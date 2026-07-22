import { isIP } from "node:net";
import { lookup } from "node:dns/promises";

import { load } from "cheerio";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { JOB_ASSISTANT_COOKIE, verifySessionToken } from "@/lib/job-assistant/auth";
import type { ExtractedJob } from "@/lib/job-assistant/types";

export const dynamic = "force-dynamic";

const MAX_RESPONSE_BYTES = 2_500_000;
const MAX_REDIRECTS = 3;

type JsonObject = Record<string, unknown>;

function isPrivateIpv4(address: string): boolean {
    const parts = address.split(".").map(Number);
    if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) return true;
    const [first, second] = parts;
    return (
        first === 0 ||
        first === 10 ||
        first === 127 ||
        (first === 100 && second >= 64 && second <= 127) ||
        (first === 169 && second === 254) ||
        (first === 172 && second >= 16 && second <= 31) ||
        (first === 192 && second === 168) ||
        first >= 224
    );
}

function isPrivateIp(address: string): boolean {
    if (isIP(address) === 4) return isPrivateIpv4(address);
    const normalized = address.toLowerCase();
    if (normalized.startsWith("::ffff:")) return isPrivateIpv4(normalized.slice(7));
    return (
        normalized === "::" ||
        normalized === "::1" ||
        normalized.startsWith("fc") ||
        normalized.startsWith("fd") ||
        normalized.startsWith("fe8") ||
        normalized.startsWith("fe9") ||
        normalized.startsWith("fea") ||
        normalized.startsWith("feb")
    );
}

async function validatePublicUrl(value: string): Promise<URL> {
    let url: URL;
    try {
        url = new URL(value);
    } catch {
        throw new Error("Enter a complete public job URL.");
    }

    if (!['http:', 'https:'].includes(url.protocol)) throw new Error("Only HTTP and HTTPS links are supported.");
    if (url.username || url.password) throw new Error("Links containing credentials are not supported.");
    const hostname = url.hostname.toLowerCase().replace(/\.$/, "");
    if (hostname === "localhost" || hostname.endsWith(".localhost") || hostname.endsWith(".local")) {
        throw new Error("Private network links are not supported.");
    }

    let addresses: Array<{ address: string; family: number }>;
    try {
        addresses = await lookup(hostname, { all: true, verbatim: true });
    } catch {
        throw new Error("The job site could not be resolved.");
    }
    if (!addresses.length || addresses.some((entry) => isPrivateIp(entry.address))) {
        throw new Error("Private network links are not supported.");
    }

    return url;
}

async function fetchJobPage(initialUrl: URL): Promise<{ html: string; finalUrl: URL }> {
    let currentUrl = initialUrl;

    for (let redirectCount = 0; redirectCount <= MAX_REDIRECTS; redirectCount += 1) {
        currentUrl = await validatePublicUrl(currentUrl.href);
        const response = await fetch(currentUrl, {
            cache: "no-store",
            headers: {
                Accept: "text/html,application/xhtml+xml",
                "Accept-Language": "en-US,en;q=0.9",
                "User-Agent": "Mozilla/5.0 (compatible; PlacementDesk/1.0; +https://fareeth.vercel.app)",
            },
            redirect: "manual",
            signal: AbortSignal.timeout(12_000),
        });

        if (response.status >= 300 && response.status < 400) {
            const location = response.headers.get("location");
            if (!location || redirectCount === MAX_REDIRECTS) throw new Error("The job page redirected too many times.");
            currentUrl = new URL(location, currentUrl);
            continue;
        }

        if (!response.ok) {
            throw new Error(response.status === 403 ? "This job site blocks automatic reading. Paste the description instead." : `The job page returned ${response.status}.`);
        }

        const contentType = response.headers.get("content-type") ?? "";
        if (!contentType.includes("text/html") && !contentType.includes("application/xhtml+xml")) {
            throw new Error("That link did not return a job web page.");
        }
        const declaredLength = Number(response.headers.get("content-length") ?? 0);
        if (declaredLength > MAX_RESPONSE_BYTES) throw new Error("The job page is too large to read safely.");

        const buffer = await response.arrayBuffer();
        if (buffer.byteLength > MAX_RESPONSE_BYTES) throw new Error("The job page is too large to read safely.");
        return { html: new TextDecoder().decode(buffer), finalUrl: currentUrl };
    }

    throw new Error("Unable to read the job page.");
}

function isObject(value: unknown): value is JsonObject {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasJobPostingType(value: unknown): boolean {
    if (typeof value === "string") return value.toLowerCase() === "jobposting";
    return Array.isArray(value) && value.some(hasJobPostingType);
}

function findJobPosting(value: unknown): JsonObject | null {
    if (Array.isArray(value)) {
        for (const item of value) {
            const match = findJobPosting(item);
            if (match) return match;
        }
        return null;
    }
    if (!isObject(value)) return null;
    if (hasJobPostingType(value["@type"])) return value;
    for (const nested of Object.values(value)) {
        const match = findJobPosting(nested);
        if (match) return match;
    }
    return null;
}

function stringValue(value: unknown): string {
    if (typeof value === "string") return value.trim();
    if (typeof value === "number") return String(value);
    return "";
}

function organizationName(value: unknown): string {
    if (typeof value === "string") return value.trim();
    if (isObject(value)) return stringValue(value.name);
    return "";
}

function locationValue(value: unknown): string {
    const locations = Array.isArray(value) ? value : [value];
    return locations
        .map((location) => {
            if (typeof location === "string") return location;
            if (!isObject(location)) return "";
            const address = isObject(location.address) ? location.address : location;
            return [address.addressLocality, address.addressRegion, address.addressCountry]
                .map((part) => {
                    if (isObject(part)) return stringValue(part.name);
                    return stringValue(part);
                })
                .filter(Boolean)
                .join(", ");
        })
        .filter(Boolean)
        .join(" / ");
}

function cleanText(value: string, limit = 30_000): string {
    if (!value) return "";
    const $ = load(`<main>${value}</main>`);
    $("script, style, noscript, svg, form, nav, footer, header").remove();
    $("br").replaceWith("\n");
    $("p, li, h1, h2, h3, h4, section, div").each((_, element) => {
        $(element).append("\n");
    });
    return $("main")
        .text()
        .replace(/\u00a0/g, " ")
        .replace(/[ \t]+/g, " ")
        .replace(/\n[ \t]+/g, "\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim()
        .slice(0, limit);
}

function extractJob(html: string, finalUrl: URL): ExtractedJob {
    const $ = load(html);
    let posting: JsonObject | null = null;

    $('script[type="application/ld+json"]').each((_, element) => {
        if (posting) return;
        const raw = $(element).text().trim();
        if (!raw) return;
        try {
            posting = findJobPosting(JSON.parse(raw));
        } catch {
            // Some sites ship malformed analytics JSON-LD; metadata fallback handles it.
        }
    });

    const structured = posting as JsonObject | null;
    const pageTitle = $('meta[property="og:title"]').attr("content")?.trim() || $("title").text().trim();
    const titleParts = pageTitle.split(/\s+[|–—-]\s+/).filter(Boolean);
    const title = stringValue(structured?.title) || $("h1").first().text().trim() || titleParts[0] || "";
    const company =
        organizationName(structured?.hiringOrganization) ||
        $('meta[property="og:site_name"]').attr("content")?.trim() ||
        (titleParts.length > 1 ? titleParts[titleParts.length - 1] : "") ||
        "";
    const structuredDescription = stringValue(structured?.description) || stringValue(structured?.responsibilities) || stringValue(structured?.qualifications);
    const fallbackDescription =
        $('[data-automation-id="jobPostingDescription"]').first().html() ||
        $('[class*="job-description" i]').first().html() ||
        $('[id*="job-description" i]').first().html() ||
        $("article").first().html() ||
        $("main").first().html() ||
        "";

    return {
        title: cleanText(title, 180),
        company: cleanText(company, 180),
        location: cleanText(locationValue(structured?.jobLocation) || stringValue(structured?.jobLocationType), 220),
        description: cleanText(structuredDescription || fallbackDescription),
        employmentType: cleanText(stringValue(structured?.employmentType), 100),
        postedAt: cleanText(stringValue(structured?.datePosted), 50),
        source: finalUrl.hostname.replace(/^www\./, ""),
        url: finalUrl.href,
    };
}

export async function POST(request: Request) {
    const cookieStore = await cookies();
    const sessionInvite = verifySessionToken(cookieStore.get(JOB_ASSISTANT_COOKIE)?.value);
    if (!sessionInvite) return NextResponse.json({ error: "Sign in again to import this job." }, { status: 401 });

    let body: { inviteId?: unknown; url?: unknown };
    try {
        body = (await request.json()) as typeof body;
    } catch {
        return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }
    if (body.inviteId !== sessionInvite.id || typeof body.url !== "string" || body.url.length > 2_000) {
        return NextResponse.json({ error: "Invalid invite or job link." }, { status: 400 });
    }

    try {
        const url = await validatePublicUrl(body.url);
        const { html, finalUrl } = await fetchJobPage(url);
        const job = extractJob(html, finalUrl);
        if (!job.title && !job.description) throw new Error("No readable job details were found. Paste the description instead.");
        return NextResponse.json({ job });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to import this job.";
        const status = /blocks|No readable|returned|too large|did not return/.test(message) ? 422 : 400;
        return NextResponse.json({ error: message }, { status });
    }
}