import { NextResponse } from "next/server";

const RESUME_PATH = "/resume/fareeth-raja-resume-2026.pdf";

export const dynamic = "force-dynamic";

export function GET(request: Request) {
    const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
    const protocol = request.headers.get("x-forwarded-proto") ?? "https";
    const baseUrl = host ? `${protocol}://${host}` : request.url;
    const url = new URL(RESUME_PATH, baseUrl);
    return NextResponse.redirect(url, 302);
}
