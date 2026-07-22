"use client";

import { ArrowRight, Eye, EyeOff, LockKeyhole } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { GBLogo } from "@/components/job-assistant/gb-logo";

type LoginGateProps = {
    inviteId: string;
    inviteLabel: string;
};

export function LoginGate({ inviteId, inviteLabel }: LoginGateProps) {
    const router = useRouter();
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setSubmitting(true);
        setError("");

        try {
            const response = await fetch("/api/job-assistant/auth", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ inviteId, password }),
            });
            const result = (await response.json()) as { error?: string };
            if (!response.ok) {
                setError(result.error ?? "Unable to sign in.");
                return;
            }
            router.refresh();
        } catch {
            setError("The sign-in service is unavailable. Try again.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <main className="placement-desk-ui relative z-[70] grid min-h-screen place-items-center overflow-hidden bg-[#f3f1ea] px-5 py-10 text-[#18201c]">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(24,32,28,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(24,32,28,0.055)_1px,transparent_1px)] bg-[size:28px_28px]" />
            <section className="relative w-full max-w-[420px] border border-[#18201c]/15 bg-[#fbfaf6] p-7 shadow-[12px_12px_0_#18201c] sm:p-9">
                <div className="mb-9 flex items-center justify-between">
                    <GBLogo />
                    <span className="flex items-center gap-1.5 font-jetbrains text-[10px] uppercase tracking-[0.16em] text-[#526058]">
                        <LockKeyhole className="h-3.5 w-3.5 text-[#a84708]" /> Private workspace
                    </span>
                </div>

                <p className="mb-2 font-jetbrains text-[11px] uppercase tracking-[0.16em] text-[#a84708]">
                    Username / {inviteLabel}
                </p>
                <h1 className="font-display text-[2.15rem] font-semibold leading-[1.05] tracking-normal">
                    Placement Desk
                </h1>
                <p className="mt-3 max-w-sm text-sm leading-6 text-[#526058]">
                    Enter the password paired with this username.
                </p>

                <form className="mt-8" onSubmit={handleSubmit}>
                    <label className="mb-2 block font-jetbrains text-[10px] font-semibold uppercase tracking-[0.14em] text-[#526058]" htmlFor="invite-password">
                        Access password
                    </label>
                    <div className="flex border border-[#18201c]/25 bg-white focus-within:border-[#ff7a1a] focus-within:ring-2 focus-within:ring-[#ff7a1a]/20">
                        <input
                            id="invite-password"
                            autoComplete="current-password"
                            autoFocus
                            className="min-w-0 flex-1 bg-transparent px-3.5 py-3 text-sm outline-none placeholder:text-[#8a948e]"
                            onChange={(event) => setPassword(event.target.value)}
                            placeholder="Enter password"
                            required
                            type={showPassword ? "text" : "password"}
                            value={password}
                        />
                        <button
                            aria-label={showPassword ? "Hide password" : "Show password"}
                            className="grid w-11 place-items-center text-[#526058] hover:text-[#18201c]"
                            onClick={() => setShowPassword((visible) => !visible)}
                            type="button"
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                    {error ? (
                        <p className="mt-2 text-xs leading-5 text-[#b43f2f]" role="alert">
                            {error}
                        </p>
                    ) : null}
                    <button
                        className="mt-4 flex w-full items-center justify-between bg-[#18201c] px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-[#2e7251] disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={submitting}
                        type="submit"
                    >
                        <span>{submitting ? "Checking invite..." : "Open workspace"}</span>
                        <ArrowRight className="h-4 w-4" />
                    </button>
                </form>

                <div className="mt-7 border-t border-[#18201c]/10 pt-5">
                    <p className="font-jetbrains text-[10px] leading-5 text-[#6d7871]">Workspace data stays in this browser. The username only controls access.</p>
                    <p className="mt-2 text-[11px] font-semibold text-[#18201c]">Built by Fareeth Raja <span className="font-normal text-[#8a948e]">· Open source for India</span></p>
                </div>
            </section>
        </main>
    );
}

export function LogoutButton() {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);

    async function logout() {
        setSubmitting(true);
        await fetch("/api/job-assistant/auth", { method: "DELETE" });
        router.refresh();
    }

    return (
        <button className="border border-current px-3 py-2 text-xs" disabled={submitting} onClick={logout} type="button">
            {submitting ? "Signing out..." : "Sign out"}
        </button>
    );
}