import { load } from "cheerio";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { JOB_ASSISTANT_COOKIE, verifySessionToken } from "@/lib/job-assistant/auth";
import { canonicalSearchLocation } from "@/lib/job-assistant/locations";
import type { JobSearchResult, RemotePreference } from "@/lib/job-assistant/types";

export const dynamic = "force-dynamic";

type SearchBody = {
    inviteId?: unknown;
    roles?: unknown;
    location?: unknown;
    cities?: unknown;
    country?: unknown;
    remotePreference?: unknown;
    recencyDays?: unknown;
    targetCompanies?: unknown;
};

type RemotiveJob = {
    id?: number;
    title?: string;
    company_name?: string;
    candidate_required_location?: string;
    url?: string;
    publication_date?: string;
    job_type?: string;
    description?: string;
};

type ArbeitnowJob = {
    slug?: string;
    title?: string;
    company_name?: string;
    location?: string;
    remote?: boolean;
    url?: string;
    created_at?: number;
    job_types?: string[];
    description?: string;
};

type JobicyJob = {
    id?: number;
    jobTitle?: string;
    companyName?: string;
    jobGeo?: string;
    jobType?: string[] | string;
    url?: string;
    pubDate?: string;
    jobDescription?: string;
};

const ALLOWED_REMOTE_PREFERENCES: RemotePreference[] = ["any", "onsite", "hybrid", "remote"];
const ALLOWED_RECENCY_DAYS = [1, 3, 7, 14, 30] as const;
const ROLE_STOP_WORDS = new Set(["associate", "assistant", "entry", "intern", "internship", "junior", "senior", "lead", "manager", "management", "specialist"]);

function text(value: unknown, maximum = 250): string {
    return typeof value === "string" ? value.trim().slice(0, maximum) : "";
}

function cleanHtml(value: string): string {
    if (!value) return "";
    const $ = load(`<main>${value}</main>`);
    $("script, style, noscript, svg").remove();
    $("br").replaceWith("\n");
    $("p, li, h1, h2, h3, h4").each((_, element) => {
        $(element).append("\n");
    });
    return $("main").text().replace(/\u00a0/g, " ").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim().slice(0, 12_000);
}

function normalize(value: string): string {
    return value.toLowerCase().replace(/[^a-z0-9+#.]+/g, " ").replace(/\s+/g, " ").trim();
}

function roleMatches(title: string, roles: string[]): boolean {
    const normalizedTitle = normalize(title);
    if (!normalizedTitle) return false;
    return roles.some((role) => {
        const words = normalize(role).split(" ").filter((word) => word.length >= 3 && !ROLE_STOP_WORDS.has(word));
        if (!words.length) return normalizedTitle.includes(normalize(role));
        const matches = words.filter((word) => normalizedTitle.includes(word)).length;
        return matches >= Math.max(1, Math.ceil(words.length * 0.6));
    });
}

function dateIsRecent(value: string, recencyDays: number): boolean {
    const timestamp = new Date(value).getTime();
    if (!Number.isFinite(timestamp)) return true;
    return timestamp >= Date.now() - recencyDays * 24 * 60 * 60 * 1000;
}

function targetCompanyMatch(company: string, targets: string[]): boolean {
    const normalizedCompany = normalize(company);
    return targets.some((target) => {
        const normalizedTarget = normalize(target);
        return normalizedTarget.length >= 2 && (normalizedCompany.includes(normalizedTarget) || normalizedTarget.includes(normalizedCompany));
    });
}

function locationScore(job: JobSearchResult, location: string, remotePreference: RemotePreference): number {
    let score = 0;
    if (job.isTargetCompany) score += 100;
    if (remotePreference === "remote" && job.isRemote) score += 30;
    if (remotePreference === "onsite" && !job.isRemote) score += 20;
    const locationTerms = normalize(location).split(" ").filter((term) => term.length >= 4);
    if (locationTerms.some((term) => normalize(job.location).includes(term))) score += 25;
    const postedAt = new Date(job.postedAt).getTime();
    if (Number.isFinite(postedAt)) score += Math.max(0, 20 - Math.floor((Date.now() - postedAt) / (24 * 60 * 60 * 1000)));
    return score;
}

function locationMatches(job: JobSearchResult, location: string): boolean {
    const requestedTerms = normalize(location).split(" ").filter((term) => term.length >= 4);
    if (!requestedTerms.length) return true;
    const jobLocation = normalize(job.location);
    if (requestedTerms.some((term) => jobLocation.includes(term))) return true;
    return job.isRemote && /worldwide|anywhere|global|remote/.test(jobLocation);
}

async function fetchJson<T>(url: string): Promise<T> {
    const response = await fetch(url, {
        cache: "no-store",
        headers: {
            Accept: "application/json",
            "User-Agent": "PlacementDesk/1.0 (+https://fareeth.vercel.app)",
        },
        signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) throw new Error(`${new URL(url).hostname} returned ${response.status}`);
    return response.json() as Promise<T>;
}

async function fetchLinkedInJobs(
    roles: string[],
    locations: string[],
    recencyDays: number,
    targets: string[],
): Promise<JobSearchResult[]> {
    const recencySeconds = recencyDays * 24 * 60 * 60;
    const searches = roles.slice(0, 3).flatMap((role) =>
        locations.slice(0, 3).map(async (location) => {
            const url = new URL("https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search");
            url.searchParams.set("keywords", role);
            url.searchParams.set("location", location);
            url.searchParams.set("f_TPR", `r${recencySeconds}`);
            url.searchParams.set("start", "0");
            const response = await fetch(url, {
                cache: "no-store",
                headers: {
                    Accept: "text/html,application/xhtml+xml",
                    "Accept-Language": "en-US,en;q=0.9",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131 Safari/537.36",
                },
                signal: AbortSignal.timeout(12_000),
            });
            if (!response.ok) throw new Error(`LinkedIn returned ${response.status}`);
            const $ = load(await response.text());
            const jobs: JobSearchResult[] = [];
            $("li").each((_, element) => {
                const card = $(element);
                const anchor = card.find("a.base-card__full-link").first();
                const title = card.find(".base-search-card__title").first().text().trim();
                const company = card.find(".base-search-card__subtitle").first().text().trim();
                const jobLocation = card.find(".job-search-card__location").first().text().trim();
                const href = anchor.attr("href")?.trim();
                if (!title || !company || !href) return;
                let cleanUrl = href.split("?")[0];
                try {
                    const parsed = new URL(href);
                    cleanUrl = `${parsed.origin}${parsed.pathname}`;
                } catch {
                    // Keep the public card URL when it cannot be normalized.
                }
                const linkedInId = cleanUrl.match(/-(\d+)(?:\/?$)/)?.[1] ?? normalize(`${company}-${title}-${jobLocation}`);
                jobs.push({
                    id: `linkedin-${linkedInId}`,
                    title,
                    company,
                    location: jobLocation || location,
                    url: cleanUrl,
                    description: "",
                    employmentType: "",
                    postedAt: card.find("time").attr("datetime")?.trim() || card.find("time").text().trim(),
                    source: "LinkedIn",
                    isRemote: /remote/i.test(jobLocation),
                    isTargetCompany: targetCompanyMatch(company, targets),
                    discoveredAt: new Date().toISOString(),
                });
            });
            return jobs;
        }),
    );
    const settled = await Promise.allSettled(searches);
    const successful = settled.filter((result): result is PromiseFulfilledResult<JobSearchResult[]> => result.status === "fulfilled");
    if (!successful.length) throw new Error("LinkedIn public search was unavailable.");
    return successful.flatMap((result) => result.value);
}

function remotiveResult(job: RemotiveJob, targets: string[]): JobSearchResult | null {
    const title = text(job.title);
    const company = text(job.company_name);
    const url = text(job.url, 2_000);
    if (!title || !company || !url) return null;
    return {
        id: `remotive-${job.id ?? `${normalize(company)}-${normalize(title)}`}`,
        title,
        company,
        location: text(job.candidate_required_location) || "Remote",
        url,
        description: cleanHtml(text(job.description, 30_000)),
        employmentType: text(job.job_type),
        postedAt: text(job.publication_date, 80),
        source: "Remotive",
        isRemote: true,
        isTargetCompany: targetCompanyMatch(company, targets),
        discoveredAt: new Date().toISOString(),
    };
}

function arbeitnowResult(job: ArbeitnowJob, targets: string[]): JobSearchResult | null {
    const title = text(job.title);
    const company = text(job.company_name);
    const url = text(job.url, 2_000);
    if (!title || !company || !url) return null;
    return {
        id: `arbeitnow-${text(job.slug, 400) || `${normalize(company)}-${normalize(title)}`}`,
        title,
        company,
        location: text(job.location) || (job.remote ? "Remote" : "Not listed"),
        url,
        description: cleanHtml(text(job.description, 30_000)),
        employmentType: Array.isArray(job.job_types) ? job.job_types.join(", ") : "",
        postedAt: typeof job.created_at === "number" ? new Date(job.created_at * 1000).toISOString() : "",
        source: "Arbeitnow",
        isRemote: Boolean(job.remote),
        isTargetCompany: targetCompanyMatch(company, targets),
        discoveredAt: new Date().toISOString(),
    };
}

function jobicyResult(job: JobicyJob, targets: string[]): JobSearchResult | null {
    const title = text(job.jobTitle);
    const company = text(job.companyName);
    const url = text(job.url, 2_000);
    if (!title || !company || !url) return null;
    return {
        id: `jobicy-${job.id ?? `${normalize(company)}-${normalize(title)}`}`,
        title,
        company,
        location: text(job.jobGeo) || "Remote",
        url,
        description: cleanHtml(text(job.jobDescription, 30_000)),
        employmentType: Array.isArray(job.jobType) ? job.jobType.join(", ") : text(job.jobType),
        postedAt: text(job.pubDate, 80),
        source: "Jobicy",
        isRemote: true,
        isTargetCompany: targetCompanyMatch(company, targets),
        discoveredAt: new Date().toISOString(),
    };
}

export async function POST(request: Request) {
    const cookieStore = await cookies();
    const sessionInvite = verifySessionToken(cookieStore.get(JOB_ASSISTANT_COOKIE)?.value);
    if (!sessionInvite) return NextResponse.json({ error: "Sign in again to search for jobs." }, { status: 401 });

    let body: SearchBody;
    try {
        body = (await request.json()) as SearchBody;
    } catch {
        return NextResponse.json({ error: "Invalid search request." }, { status: 400 });
    }

    if (body.inviteId !== sessionInvite.id) return NextResponse.json({ error: "This invite cannot run that search." }, { status: 403 });
    if (!Array.isArray(body.roles) || !body.roles.length || body.roles.length > 6) {
        return NextResponse.json({ error: "Choose between one and six target roles." }, { status: 400 });
    }
    const roles = body.roles.map((role) => text(role, 120)).filter(Boolean);
    if (!roles.length) return NextResponse.json({ error: "Choose at least one valid target role." }, { status: 400 });
    const location = text(body.location, 180);
    const country = text(body.country, 80);
    const cities = Array.isArray(body.cities)
        ? body.cities.slice(0, 3).map((city) => text(city, 80)).filter(Boolean)
        : [];
    const linkedInLocations = cities.length
        ? cities.map((city) => canonicalSearchLocation(city, country))
        : [location || country].filter(Boolean);
    const remotePreference = ALLOWED_REMOTE_PREFERENCES.includes(body.remotePreference as RemotePreference)
        ? body.remotePreference as RemotePreference
        : "any";
    const recencyDays = ALLOWED_RECENCY_DAYS.includes(body.recencyDays as typeof ALLOWED_RECENCY_DAYS[number])
        ? body.recencyDays as typeof ALLOWED_RECENCY_DAYS[number]
        : 7;
    const targetCompanies = Array.isArray(body.targetCompanies)
        ? body.targetCompanies.slice(0, 10).map((company) => text(company, 100)).filter(Boolean)
        : [];

    const requests: Array<Promise<{ source: string; jobs: JobSearchResult[] }>> = [
        fetchLinkedInJobs(roles, linkedInLocations, recencyDays, targetCompanies).then((jobs) => ({
            source: "LinkedIn",
            jobs,
        })),
        Promise.all(
            roles.slice(0, 4).map((role) => fetchJson<{ jobs?: RemotiveJob[] }>(`https://remotive.com/api/remote-jobs?search=${encodeURIComponent(role)}`)),
        ).then((responses) => ({
            source: "Remotive",
            jobs: responses.flatMap((response) => response.jobs ?? []).map((job) => remotiveResult(job, targetCompanies)).filter((job): job is JobSearchResult => Boolean(job)),
        })),
        fetchJson<{ data?: ArbeitnowJob[] }>("https://www.arbeitnow.com/api/job-board-api").then((response) => ({
            source: "Arbeitnow",
            jobs: (response.data ?? []).map((job) => arbeitnowResult(job, targetCompanies)).filter((job): job is JobSearchResult => Boolean(job)),
        })),
        fetchJson<{ jobs?: JobicyJob[] }>("https://jobicy.com/api/v2/remote-jobs?count=50").then((response) => ({
            source: "Jobicy",
            jobs: (response.jobs ?? []).map((job) => jobicyResult(job, targetCompanies)).filter((job): job is JobSearchResult => Boolean(job)),
        })),
    ];

    const settled = await Promise.allSettled(requests);
    const warnings: string[] = [];
    const allResults: JobSearchResult[] = [];
    settled.forEach((result, index) => {
        if (result.status === "fulfilled") {
            allResults.push(...result.value.jobs);
        } else {
            warnings.push(`${["LinkedIn", "Remotive", "Arbeitnow", "Jobicy"][index]} was unavailable for this search.`);
        }
    });

    const deduplicated = new Map<string, JobSearchResult>();
    allResults
        .filter((job) => roleMatches(job.title, roles))
        .filter((job) => dateIsRecent(job.postedAt, recencyDays))
        .filter((job) => locationMatches(job, location))
        .filter((job) => remotePreference !== "remote" || job.isRemote)
        .forEach((job) => {
            const key = `${normalize(job.company)}|${normalize(job.title)}`;
            const existing = deduplicated.get(key);
            if (!existing || locationScore(job, location, remotePreference) > locationScore(existing, location, remotePreference)) {
                deduplicated.set(key, job);
            }
        });

    const results = [...deduplicated.values()]
        .sort((left, right) => locationScore(right, location, remotePreference) - locationScore(left, location, remotePreference))
        .slice(0, 60);

    return NextResponse.json({
        results,
        warnings,
        searchedSources: settled.filter((result) => result.status === "fulfilled").length,
        searchedAt: new Date().toISOString(),
    });
}