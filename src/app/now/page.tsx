import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";

export const metadata: Metadata = {
    title: "Now",
    description:
        "What Fareeth Raja is focused on right now: current product work, study, and side projects.",
    alternates: { canonical: "/now" },
};

const LAST_UPDATED = "October 2026";

const FOCUS = [
    {
        title: "AI product discovery at Kumaran Systems",
        body: "Since September 2026, contributing as a Product Manager Trainee to enterprise AI discovery, developer-tool evaluation, feature-priority recommendations, and product positioning. Internal product names and implementation details remain private.",
        tag: "Day-to-day",
    },
    {
        title: "Developer experience & context continuity",
        body: "Exploring memory and personalization trade-offs, demonstrating competitive AI coding workflows, and recommending phased feature priorities. Public case studies distinguish proposals from implemented features.",
        tag: "Product questions",
    },
    {
        title: "MBA in Finance & Marketing",
        body: "Graduated from Krupanidhi College on Aug 8, 2026 as Best Outgoing Student and Finance Gold Medalist. CGPA: 8.38/10.",
        tag: "Graduated",
    },
    {
        title: "Placement Desk & this portfolio",
        body: "Building connected, evidence-based job-search workflows and documenting product decisions alongside independent projects. Finverse and the Bermer engagement concluded in August 2026.",
        tag: "Side build",
    },
];

const SHIPPED = [
    "Mobile navbar across the portfolio",
    "Command palette (⌘K)",
    "/now page (this page)",
    "OG image + favicons via next/og",
    "/api/resume redirect for analytics",
    "Gold-medal easter egg on the timeline",
    "prefers-reduced-motion across animations",
];

const STACK = [
    "Next.js · React · TypeScript",
    "Tailwind v4 · Framer Motion",
    "GitHub Copilot · Competitive demos",
    "User journeys · Prioritization · AI product evaluation",
];

export default function NowPage() {
    return (
        <main className="section-container relative z-30 pt-24 pb-20 md:pt-28 sm:pb-24">
            <Link
                href="/"
                className="liquid-glass inline-flex min-h-11 items-center gap-2 rounded-full px-4 py-2 text-sm text-foreground/85 shadow-[0_10px_30px_rgba(139,92,246,0.18)] transition hover:border-white/30 hover:text-foreground active:scale-[0.97]"
            >
                <ArrowLeft className="h-4 w-4" />
                Back home
            </Link>

            <header className="mt-6">
                <span className="eyebrow mb-5">Now</span>
                <h1 className="font-display mt-5 text-4xl md:text-5xl font-bold tracking-[-0.03em] text-foreground">
                    What I&apos;m focused on{" "}
                    <span className="text-gradient-accent">right now</span>
                </h1>
                <p className="mt-4 text-sm text-muted-foreground">
                    Inspired by{" "}
                    <Link
                        href="https://nownownow.com/about"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline decoration-white/30 underline-offset-4 hover:decoration-white"
                    >
                        nownownow.com
                    </Link>
                    . Updated {LAST_UPDATED}.
                </p>
            </header>

            <section className="mt-12 grid gap-4 md:grid-cols-2">
                {FOCUS.map((item) => (
                    <article
                        key={item.title}
                        className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm transition hover:border-white/20"
                    >
                        <div className="flex items-center gap-2">
                            <span className="font-jetbrains text-[10px] uppercase tracking-[0.2em] text-emerald-300">
                                {item.tag}
                            </span>
                            <span className="h-px flex-1 bg-border" />
                        </div>
                        <h2 className="mt-3 font-display text-xl font-semibold text-foreground">
                            {item.title}
                        </h2>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                            {item.body}
                        </p>
                    </article>
                ))}
            </section>

            <section className="mt-12">
                <h2 className="font-jetbrains text-xs uppercase tracking-[0.22em] text-muted-foreground">
                    Recently shipped
                </h2>
                <ul className="mt-4 grid gap-2">
                    {SHIPPED.map((item) => (
                        <li
                            key={item}
                            className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 text-sm text-foreground/90"
                        >
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
                            <span>{item}</span>
                        </li>
                    ))}
                </ul>
            </section>

            <section className="mt-12">
                <h2 className="font-jetbrains text-xs uppercase tracking-[0.22em] text-muted-foreground">
                    Methods &amp; tools
                </h2>
                <div className="mt-4 flex flex-wrap gap-2">
                    {STACK.map((tag) => (
                        <span
                            key={tag}
                            className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-foreground/80"
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            </section>

            <footer className="mt-14 flex flex-wrap items-center gap-4 text-sm">
                <Link
                    href="/work"
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-foreground transition hover:border-white/30"
                >
                    Read product case studies
                    <ArrowUpRight className="h-4 w-4" />
                </Link>
                <Link
                    href="/api/resume"
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-foreground transition hover:border-white/30"
                >
                    Resume
                    <ArrowUpRight className="h-4 w-4" />
                </Link>
            </footer>
        </main>
    );
}
