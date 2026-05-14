import { NextResponse } from "next/server";

const RESUME_PATH = "/resume/fareeth-raja-resume-2026.pdf";

export const dynamic = "force-static";

export function GET(request: Request) {
    const url = new URL(RESUME_PATH, request.url);
    return NextResponse.redirect(url, 302);
}
