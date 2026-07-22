import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { PDFParse } from "pdf-parse";

import { JOB_ASSISTANT_COOKIE, verifySessionToken } from "@/lib/job-assistant/auth";

export const dynamic = "force-dynamic";

const MAX_OFFER_BYTES = 10_000_000;

function cleanText(value: string): string {
    return value
        .replace(/\u0000/g, "")
        .replace(/\u00a0/g, " ")
        .replace(/[ \t]+/g, " ")
        .replace(/\n[ \t]+/g, "\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim()
        .slice(0, 150_000);
}

export async function POST(request: Request) {
    const cookieStore = await cookies();
    const sessionInvite = verifySessionToken(cookieStore.get(JOB_ASSISTANT_COOKIE)?.value);
    if (!sessionInvite) return NextResponse.json({ error: "Sign in again to read this offer." }, { status: 401 });

    try {
        const form = await request.formData();
        const inviteId = form.get("inviteId");
        const file = form.get("file");
        if (inviteId !== sessionInvite.id || !(file instanceof File)) {
            return NextResponse.json({ error: "Invalid offer upload." }, { status: 400 });
        }
        if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
            return NextResponse.json({ error: "The fallback accepts PDF offer letters only." }, { status: 415 });
        }
        if (!file.size || file.size > MAX_OFFER_BYTES) {
            return NextResponse.json({ error: "Choose a PDF smaller than 10 MB." }, { status: 413 });
        }

        const parser = new PDFParse({ data: new Uint8Array(await file.arrayBuffer()) });
        let extractedText = "";
        try {
            extractedText = (await parser.getText()).text;
        } finally {
            await parser.destroy();
        }

        const text = cleanText(extractedText);
        if (text.length < 80) {
            return NextResponse.json({ error: "This PDF contains too little readable text. Paste the offer text instead." }, { status: 422 });
        }
        return NextResponse.json({ text, transient: true });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to read this PDF.";
        return NextResponse.json({ error: message }, { status: 422 });
    }
}