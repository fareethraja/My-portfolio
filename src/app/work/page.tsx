import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { CASE_STUDIES } from "@/lib/case-studies";

export const metadata: Metadata = {
    title: "Case Studies",
    description:
        "Selected case studies from Fareeth Raja covering Finverse, SmartSlot, RoomSpace and more. Problem, approach, and impact.",
    alternates: { canonical: "/work" },
};

const ACCENT: Record<string, { glow: string; ring: string; text: string }> = {
    violet: {
        glow: "from-violet-500/40 via-fuchsia-500/15 to-sky-500/35",
        ring: "from-violet-500 via-fuchsia-500 to-sky-500",
        text: "text-violet-100",
    },
    sky: {
        glow: "from-sky-500/40 via-cyan-500/15 to-emerald-500/35",
        ring: "from-sky-500 via-cyan-400 to-emerald-400",
        text: "text-sky-100",
    },
    amber: {
        glow: "from-amber-500/40 via-orange-500/15 to-rose-500/35",
        ring: "from-amber-400 via-orange-400 to-rose-400",
        text: "text-amber-100",
    },
};

export default function WorkIndexPage() {
    return (
        <main className="relative z-30 mx-auto w-full max-w-4xl px-6 pt-14 pb-20 sm:pt-16 sm:pb-24">
            <Link
                href="/"
                className="liquid-glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm text-foreground/85 shadow-[0_10px_30px_rgba(139,92,246,0.18)] transition hover:border-white/30 hover:text-foreground active:scale-[0.97]"
            >
                <ArrowLeft className="h-4 w-4" />
                Back home
            </Link>

            <header className="mt-6">
                <span className="eyebrow mb-5">Case Studies</span>
                <h1 className="font-display mt-5 text-4xl md:text-5xl font-bold tracking-[-0.03em] text-foreground">
                    Things I&apos;ve <span className="text-gradient-accent">shipped</span>,
                    <br className="hidden sm:block" /> told properly.
                </h1>
                <p className="mt-4 max-w-2xl text-base text-muted-foreground">
                    Each case study covers the problem, the constraints, the approach,
                    and what actually moved, not just screenshots.
                </p>
            </header>

            <section className="mt-12 grid gap-5">
                {CASE_STUDIES.map((cs) => {
                    const accent = ACCENT[cs.accent] ?? ACCENT.violet;
                    return (
                        <Link
                            key={cs.slug}
                            href={`/work/${cs.slug}`}
                            className="group relative block overflow-hidden rounded-2xl p-[1px] shadow-[0_18px_50px_rgba(0,0,0,0.35)] transition duration-300 hover:-translate-y-1 active:scale-[0.99]"
                        >
                            <div
                                aria-hidden
                                className={`absolute inset-0 bg-gradient-to-br ${accent.ring} opacity-30 transition duration-500 group-hover:opacity-60`}
                            />
                            <div className="liquid-glass relative min-h-full overflow-hidden rounded-[calc(1rem-1px)] bg-zinc-950/80 p-6">
                                <div
                                    aria-hidden
                                    className={`pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-gradient-to-br ${accent.glow} opacity-60 blur-3xl transition duration-500 group-hover:scale-110 group-hover:opacity-80`}
                                />
                                <div className="relative flex flex-col gap-3">
                                    <div className="flex items-center gap-2 font-jetbrains text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                                        <span className={`liquid-glass rounded-full px-2.5 py-1 ${accent.text}`}>
                                            {cs.role.split("·")[0].trim()}
                                        </span>
                                        <span className="h-px flex-1 bg-gradient-to-r from-white/20 to-transparent" />
                                        <span>{cs.timeline}</span>
                                    </div>
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <h2 className="font-display text-2xl font-semibold text-foreground">
                                                {cs.title}
                                            </h2>
                                            <p className="mt-1 text-sm text-primary">{cs.tagline}</p>
                                        </div>
                                        <span className="mt-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 bg-zinc-950/70 text-white transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:border-white/30">
                                            <ArrowUpRight className="h-4 w-4" />
                                        </span>
                                    </div>
                                    <p className="text-sm leading-relaxed text-muted-foreground">
                                        {cs.summary}
                                    </p>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {cs.stack.slice(0, 6).map((s) => (
                                            <span
                                                key={s}
                                                className="liquid-glass rounded-full px-2.5 py-1 text-[11px] text-foreground/80"
                                            >
                                                {s}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </section>
        </main>
    );
}
