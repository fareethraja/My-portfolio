import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, CheckCircle2, Github, Layers3, Sparkles } from "lucide-react";
import { CASE_STUDIES, getCaseStudy } from "@/lib/case-studies";

type RouteParams = { slug: string };

export async function generateStaticParams(): Promise<RouteParams[]> {
    return CASE_STUDIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata(
    { params }: { params: Promise<RouteParams> },
): Promise<Metadata> {
    const { slug } = await params;
    const cs = getCaseStudy(slug);
    if (!cs) return { title: "Case Study Not Found" };
    return {
        title: `${cs.title} | Case Study`,
        description: cs.summary,
        alternates: { canonical: `/work/${cs.slug}` },
        openGraph: {
            title: `${cs.title} | ${cs.tagline}`,
            description: cs.summary,
            url: `/work/${cs.slug}`,
            type: "article",
        },
        twitter: {
            card: "summary_large_image",
            title: `${cs.title} | ${cs.tagline}`,
            description: cs.summary,
        },
    };
}

const ACCENT: Record<string, { glow: string; ring: string; chip: string; dot: string }> = {
    violet: {
        glow: "from-violet-500/50 via-fuchsia-500/20 to-sky-500/40",
        ring: "from-violet-500 via-fuchsia-500 to-sky-500",
        chip: "text-violet-900 border-violet-700/40 dark:text-violet-100 dark:border-violet-300/30",
        dot: "bg-violet-300 shadow-[0_0_16px_rgba(196,181,253,0.8)]",
    },
    sky: {
        glow: "from-sky-500/50 via-cyan-500/20 to-emerald-500/40",
        ring: "from-sky-500 via-cyan-400 to-emerald-400",
        chip: "text-sky-900 border-sky-700/40 dark:text-sky-100 dark:border-sky-300/30",
        dot: "bg-sky-300 shadow-[0_0_16px_rgba(125,211,252,0.8)]",
    },
    amber: {
        glow: "from-amber-500/50 via-orange-500/20 to-rose-500/40",
        ring: "from-amber-400 via-orange-400 to-rose-400",
        chip: "text-amber-900 border-amber-700/40 dark:text-amber-100 dark:border-amber-300/30",
        dot: "bg-amber-300 shadow-[0_0_16px_rgba(252,211,77,0.8)]",
    },
};

export default async function CaseStudyPage(
    { params }: { params: Promise<RouteParams> },
) {
    const { slug } = await params;
    const cs = getCaseStudy(slug);
    if (!cs) return notFound();

    const accent = ACCENT[cs.accent] ?? ACCENT.violet;

    return (
        <main className="section-container relative z-30 pt-24 pb-20 md:pt-28 sm:pb-24">
            <Link
                href="/work"
                className="liquid-glass inline-flex min-h-11 items-center gap-2 rounded-full px-4 py-2 text-sm text-foreground/85 shadow-[0_10px_30px_rgba(139,92,246,0.18)] transition hover:border-primary/60 hover:text-foreground active:scale-[0.97]"
            >
                <ArrowLeft className="h-4 w-4" />
                All case studies
            </Link>

            <section className="group relative mt-6 overflow-hidden rounded-3xl p-[1px] shadow-2xl shadow-primary/10">
                <div
                    aria-hidden
                    className={`absolute inset-0 bg-gradient-to-br ${accent.ring} opacity-35 transition duration-500 group-hover:opacity-55`}
                />
                <div className="liquid-glass relative overflow-hidden rounded-[calc(1.5rem-1px)] bg-card/90 p-8 sm:p-10">
                    <div
                        aria-hidden
                        className={`pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gradient-to-br ${accent.glow} opacity-70 blur-3xl transition duration-500 group-hover:scale-110`}
                    />
                    <div
                        aria-hidden
                        className="pointer-events-none absolute -left-24 bottom-0 h-60 w-60 rounded-full bg-gradient-to-br from-emerald-400/15 to-transparent blur-3xl"
                    />
                    <div className="relative">
                    <div className="flex flex-wrap items-center gap-2 font-jetbrains text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                        <span className={`liquid-glass rounded-full border px-3 py-1 ${accent.chip}`}>
                            Case study
                        </span>
                        <span className={`h-1.5 w-1.5 rounded-full ${accent.dot}`} />
                        <span>{cs.timeline}</span>
                        <span className="text-muted-foreground">/</span>
                        <span>{cs.role}</span>
                    </div>
                    <h1 className="font-display mt-5 text-4xl font-bold tracking-[-0.03em] text-foreground sm:text-5xl">
                        {cs.title}
                    </h1>
                    <p className="mt-2 text-lg text-primary">{cs.tagline}</p>
                    <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
                        {cs.summary}
                    </p>
                    {cs.status && <p className="mt-4 text-sm font-medium text-accent-foreground">{cs.status}</p>}
                    {cs.disclosure && (
                        <p className="mt-4 rounded-xl border border-amber-700/35 dark:border-amber-300/20 bg-amber-300/5 p-4 text-sm leading-relaxed text-muted-foreground">
                            {cs.disclosure}
                        </p>
                    )}

                    {cs.impact.length > 0 && (
                        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {cs.impact.map((m) => (
                            <div
                                key={m.label}
                                className="group/metric relative overflow-hidden rounded-2xl border border-border/70 bg-card/45 p-4 backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:border-primary/50 hover:bg-primary/5"
                            >
                                <div
                                    aria-hidden
                                    className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${accent.ring} opacity-70`}
                                />
                                <div className="font-display text-2xl font-semibold text-foreground">
                                    {m.value}
                                </div>
                                <div className="mt-1 text-[11px] uppercase tracking-wider text-muted-foreground">
                                    {m.label}
                                </div>
                            </div>
                        ))}
                        </div>
                    )}

                    {cs.links.length > 0 && (
                        <div className="mt-6 flex flex-wrap gap-2">
                            {cs.links.map((l) => (
                                <a
                                    key={l.href}
                                    href={l.href}
                                    data-project-demo={l.type === "live" ? cs.title : undefined}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="liquid-glass group/link inline-flex min-h-11 items-center gap-2 rounded-full px-4 py-2 text-sm text-foreground transition hover:border-primary/60 active:scale-[0.97]"
                                >
                                    {l.type === "github" ? (
                                        <Github className="h-3.5 w-3.5" />
                                    ) : (
                                        <ArrowUpRight className="h-3.5 w-3.5 transition group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
                                    )}
                                    {l.label}
                                </a>
                            ))}
                        </div>
                    )}
                    </div>
                </div>
            </section>

            {cs.context && (
                <Section eyebrow="Product context & my role">
                    <p className="text-base leading-relaxed text-foreground/90">{cs.context}</p>
                </Section>
            )}

            <Section eyebrow="The problem & constraints">
                <p className="text-base leading-relaxed text-foreground/90">{cs.problem}</p>
                {cs.constraints.length > 0 && (
                    <ul className="mt-5 grid gap-2">
                        {cs.constraints.map((c) => (
                            <li
                                key={c}
                                className="group relative overflow-hidden rounded-2xl border border-border/70 bg-card/20 p-[1px] transition duration-300 hover:-translate-y-0.5 hover:border-primary/50"
                            >
                                <div className="relative flex items-start gap-3 rounded-[calc(1rem-1px)] bg-card/50 px-4 py-3 text-sm text-foreground/85 backdrop-blur-md">
                                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent-foreground" />
                                    <span>{c}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </Section>

            {cs.observations && (
                <Section eyebrow="What I observed">
                    <ul className="list-disc space-y-3 pl-5 text-sm leading-relaxed text-foreground/90">
                        {cs.observations.map((observation) => <li key={observation}>{observation}</li>)}
                    </ul>
                </Section>
            )}

            <Section eyebrow={cs.decision ? "My approach & recommendations" : "Approach"}>
                <ol className="grid gap-4">
                    {cs.approach.map((step, i) => (
                        <li
                            key={step.title}
                            className="group relative overflow-hidden rounded-2xl border border-border/70 bg-card/20 p-5 backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-primary/50 hover:bg-primary/5"
                        >
                            <div
                                aria-hidden
                                className={`absolute -right-16 -top-16 h-36 w-36 rounded-full bg-gradient-to-br ${accent.glow} opacity-0 blur-2xl transition duration-500 group-hover:opacity-60`}
                            />
                            <div className="flex items-start gap-4">
                                <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-primary/40 bg-secondary font-jetbrains text-xs text-primary shadow-[0_0_22px_rgba(139,92,246,0.15)]">
                                    {String(i + 1).padStart(2, "0")}
                                </span>
                                <div className="relative">
                                    <h3 className="font-display text-lg font-semibold text-foreground">
                                        {step.title}
                                    </h3>
                                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                        {step.body}
                                    </p>
                                </div>
                            </div>
                        </li>
                    ))}
                </ol>
            </Section>

            {cs.decision && (
                <Section eyebrow="Product direction & attribution">
                    <p className="text-base leading-relaxed text-foreground/90">{cs.decision}</p>
                </Section>
            )}
            {cs.outcome && (
                <Section eyebrow="Outcome & current status">
                    <p className="text-base leading-relaxed text-foreground/90">{cs.outcome}</p>
                </Section>
            )}

            <Section eyebrow="Methods & tools">
                <div className="flex flex-wrap gap-2">
                    {cs.stack.map((s) => (
                        <span
                            key={s}
                            className="liquid-glass rounded-full px-3 py-1.5 text-xs text-foreground/85 transition hover:border-primary/50 hover:text-foreground"
                        >
                            {s}
                        </span>
                    ))}
                </div>
            </Section>

            {cs.learnings.length > 0 && (
                <Section eyebrow="What I'd take forward">
                    <ul className="grid gap-3">
                        {cs.learnings.map((l) => (
                            <li
                                key={l}
                                className="liquid-glass flex items-start gap-3 rounded-2xl px-4 py-3 text-sm text-foreground/90 transition hover:border-primary/50"
                            >
                                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-accent-foreground" />
                                <span>{l}</span>
                            </li>
                        ))}
                    </ul>
                </Section>
            )}

            <section className="liquid-glass mt-16 flex flex-col items-start justify-between gap-4 rounded-2xl p-6 sm:flex-row sm:items-center">
                <div>
                    <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-foreground">
                        <Layers3 className="h-5 w-5 text-primary" />
                        Want the full story?
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Happy to discuss my contribution, trade-offs, and learnings within confidentiality limits.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Link
                        href="/work"
                        className="liquid-glass inline-flex min-h-11 items-center gap-2 rounded-full px-4 py-2 text-sm text-foreground transition hover:border-primary/60"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        More case studies
                    </Link>
                    <Link
                        href="/#contact"
                        className="liquid-glass inline-flex min-h-11 items-center gap-2 rounded-full px-4 py-2 text-sm text-foreground/90 shadow-[0_10px_30px_rgba(139,92,246,0.18)] transition hover:border-primary/60 hover:text-foreground active:scale-[0.97]"
                    >
                        Get in touch
                        <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                </div>
            </section>
        </main>
    );
}

function Section({
    eyebrow,
    children,
}: {
    eyebrow: string;
    children: React.ReactNode;
}) {
    return (
        <section className="mt-12">
            <div className="flex items-center gap-3">
                <span className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-border/40" />
                <h2 className="liquid-glass rounded-full px-3 py-1 font-jetbrains text-xs uppercase tracking-[0.22em] text-muted-foreground">
                    {eyebrow}
                </h2>
                <span className="h-px flex-1 bg-gradient-to-l from-transparent via-border to-border/40" />
            </div>
            <div className="mt-5 [&_p]:max-w-[85ch]">{children}</div>
        </section>
    );
}
