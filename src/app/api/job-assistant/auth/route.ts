import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
    authenticateInvite,
    createSessionToken,
    isJobAssistantSessionConfigured,
    JOB_ASSISTANT_COOKIE,
    JOB_ASSISTANT_SESSION_SECONDS,
} from "@/lib/job-assistant/auth";

type LoginAttempt = { count: number; resetAt: number };

const loginAttempts = new Map<string, LoginAttempt>();
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const MAX_LOGIN_ATTEMPTS = 8;

function attemptKey(request: Request, inviteId: string): string {
    const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    const address = forwardedFor || request.headers.get("x-real-ip") || "unknown";
    return `${address}:${inviteId.trim().toLowerCase()}`;
}

function activeAttempt(key: string): LoginAttempt | null {
    const now = Date.now();
    const attempt = loginAttempts.get(key);
    if (attempt && attempt.resetAt > now) return attempt;
    if (attempt) loginAttempts.delete(key);
    if (loginAttempts.size > 1_000) {
        for (const [candidateKey, candidate] of loginAttempts) {
            if (candidate.resetAt <= now) loginAttempts.delete(candidateKey);
        }
    }
    return null;
}

export async function POST(request: Request) {
    let body: { inviteId?: unknown; password?: unknown };

    try {
        body = (await request.json()) as typeof body;
    } catch {
        return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    if (typeof body.inviteId !== "string" || typeof body.password !== "string") {
        return NextResponse.json({ error: "Username and password are required." }, { status: 400 });
    }

    if (!isJobAssistantSessionConfigured()) {
        return NextResponse.json(
            { error: "Private login is not configured on this deployment." },
            { status: 503 },
        );
    }

    const key = attemptKey(request, body.inviteId);
    const previousAttempt = activeAttempt(key);
    if (previousAttempt && previousAttempt.count >= MAX_LOGIN_ATTEMPTS) {
        const retryAfter = Math.max(1, Math.ceil((previousAttempt.resetAt - Date.now()) / 1_000));
        return NextResponse.json(
            { error: "Too many attempts. Try again later." },
            { status: 429, headers: { "Retry-After": String(retryAfter) } },
        );
    }

    const invite = authenticateInvite(body.inviteId, body.password);
    if (!invite) {
        loginAttempts.set(key, {
            count: (previousAttempt?.count ?? 0) + 1,
            resetAt: previousAttempt?.resetAt ?? Date.now() + LOGIN_WINDOW_MS,
        });
        await new Promise((resolve) => setTimeout(resolve, 450));
        return NextResponse.json({ error: "That password does not match this username." }, { status: 401 });
    }

    loginAttempts.delete(key);
    const cookieStore = await cookies();
    cookieStore.set(JOB_ASSISTANT_COOKIE, createSessionToken(invite.id), {
        httpOnly: true,
        maxAge: JOB_ASSISTANT_SESSION_SECONDS,
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
    });

    return NextResponse.json({
        ok: true,
        invite: {
            label: invite.label,
            isOwner: invite.isOwner,
        },
    });
}

export async function DELETE() {
    const cookieStore = await cookies();
    cookieStore.delete(JOB_ASSISTANT_COOKIE);
    return NextResponse.json({ ok: true });
}