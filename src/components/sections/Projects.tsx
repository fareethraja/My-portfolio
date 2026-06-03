"use client";

import { GlowingEffect } from "@/components/ui/glowing-effect";
import { ArrowUpRight, Calendar, Key, TrendingUp, Zap } from "lucide-react";
import Link from "next/link";
import React from "react";
import { useAnalytics } from "@/hooks/use-analytics";

const PROJECTS_DATA = [
    {
        title: "Finverse",
        subtitle: "AI-powered Stock Market Super App",
        description:
            "Translate founder goals into feature specs, user flows, implementation logic, QA checks, and shipped workflows across Zeno AI, screeners, strategy builder, backtesting, paper trading, courses, checkout, admin, and market tools.",
        tags: ["Product Management", "FinTech", "AI Chat", "Next.js", "Go", "Razorpay"],
        icon: <TrendingUp className="h-4 w-4" />,
        link: "https://finverse.trade/",
        caseStudySlug: "finverse",
        hasDemo: true,
    },
    {
        title: "SmartSlot",
        subtitle: "Mobile-first Dental Appointment PWA",
        description:
            "Built a Progressive Web App for dental students and interns to create daily slots, share WhatsApp booking links, manage leave days, and track case progress without requiring patient login.",
        tags: ["React", "Tailwind CSS", "Supabase", "Vercel", "Clinic Workflow"],
        icon: <Calendar className="h-4 w-4" />,
        link: "https://smartslot-lilac.vercel.app/",
        caseStudySlug: "smartslot",
        hasDemo: true,
    },
    {
        title: "RoomSpace",
        subtitle: "Roommate Key Tracker",
        description:
            "Built a mobile/web app to help roommates track who holds the room key with accountability, real-time updates, and offline synchronization for shared-living coordination.",
        tags: ["React", "Node.js", "Firebase", "Offline Sync", "UX Thinking"],
        icon: <Key className="h-4 w-4" />,
        link: "https://roommate-key-tracker.vercel.app/",
        caseStudySlug: "roomspace",
        hasDemo: true,
    },
    {
        title: "Hybrid 2.0",
        subtitle: "Renewable Mobility Research",
        description:
            "Researched and presented a renewable-energy automobile mechanism focused on reducing fossil-fuel dependence and supporting sustainable development.",
        tags: ["Market Research", "Sustainable Tech", "Business Presentation", "AI-assisted Research"],
        icon: <Zap className="h-4 w-4" />,
    },
];

export function Projects() {
    return (
        <section
            id="projects"
            className="min-h-screen py-24 flex flex-col items-center justify-center"
        >
            <div className="section-container">
                <div className="flex flex-col items-center mb-16 text-center">
                    <span className="eyebrow mb-5">Selected Work</span>
                    <h2 className="font-display text-4xl md:text-6xl font-bold tracking-[-0.03em] text-foreground">
                        <span className="text-gradient-accent">Product work</span> I&apos;ve shipped
                    </h2>
                    <p className="mt-5 max-w-2xl text-base md:text-lg text-muted-foreground">
                        Case studies across fintech, AI, payments, user flows, QA, and mobile-first product experiments.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                    {PROJECTS_DATA.map((project, index) => (
                        <GridItem
                            key={index}
                            title={project.title}
                            subtitle={project.subtitle}
                            description={project.description}
                            tags={project.tags}
                            icon={project.icon}
                            link={project.link}
                            caseStudySlug={project.caseStudySlug}
                            hasDemo={project.hasDemo}
                        />
                    ))}
                </div>

                <div className="mt-12 flex justify-center">
                    <Link
                        href="/work"
                        className="group inline-flex items-center gap-2 rounded-full border border-white/15 bg-zinc-950/70 px-5 py-2.5 text-sm text-foreground backdrop-blur-md transition hover:border-white/30 hover:bg-zinc-950/90 active:scale-[0.97]"
                    >
                        Read all case studies
                        <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </Link>
                </div>
            </div>
        </section>
    );
}

interface GridItemProps {
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    description: string;
    tags: string[];
    link?: string;
    caseStudySlug?: string;
    hasDemo?: boolean;
}

const GridItem = ({ icon, title, subtitle, description, tags, link, caseStudySlug, hasDemo }: GridItemProps) => {
    const { trackProjectClick } = useAnalytics();

    const CardContent = (
        <div
            className="relative h-full rounded-[1.25rem] border-[0.75px] border-zinc-200 p-2 transition-colors duration-300 dark:border-zinc-800 md:rounded-[1.5rem] md:p-3"
        >
            <GlowingEffect
                spread={80}
                glow={true}
                disabled={false}
                proximity={64}
                inactiveZone={0.01}
                borderWidth={3}
            />
            <div className="relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl border-[0.75px] border-white/10 dark:border-white/10 bg-white/5 dark:bg-black/5 backdrop-blur-xl p-6 shadow-sm dark:shadow-[0px_0px_27px_0px_rgba(45,45,45,0.3)] md:p-6 transition-colors duration-300 group-hover/item:border-white/20 dark:group-hover/item:border-white/20">
                <div className="relative flex flex-1 flex-col justify-start gap-3">
                    <div className="w-fit rounded-lg border-[0.75px] border-zinc-200 dark:border-zinc-800 bg-muted p-2">
                        {icon}
                    </div>
                    <div className="space-y-3">
                        <h3 className="pt-0.5 text-xl leading-[1.375rem] font-semibold font-sans tracking-[-0.04em] md:text-2xl md:leading-[1.875rem] text-balance text-foreground">
                            {title}
                        </h3>
                        {subtitle && (
                            <p className="text-xs font-medium text-primary uppercase tracking-wider">
                                {subtitle}
                            </p>
                        )}
                        <p className="[&_b]:md:font-semibold [&_strong]:md:font-semibold font-sans text-sm leading-[1.125rem] md:text-base md:leading-[1.375rem] text-muted-foreground">
                            {description}
                        </p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                    {tags.map((tag, tagIndex) => (
                        <span
                            key={tagIndex}
                            className="px-3 py-1 text-xs font-medium rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                        >
                            {tag}
                        </span>
                    ))}
                </div>

                {(caseStudySlug || (hasDemo && link)) && (
                    <div className="relative z-20 mt-5 flex flex-wrap gap-2">
                        {caseStudySlug && (
                            <Link
                                href={`/work/${caseStudySlug}`}
                                className="liquid-glass inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 font-jetbrains text-[10px] uppercase tracking-[0.18em] text-white/90 shadow-[0_10px_30px_rgba(139,92,246,0.22)] transition hover:border-white/35 hover:text-white active:scale-[0.97]"
                            >
                                Case study
                                <ArrowUpRight className="h-3 w-3" />
                            </Link>
                        )}
                        {hasDemo && link && (
                            <a
                                href={link}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => trackProjectClick(title)}
                                className="liquid-glass inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 font-jetbrains text-[10px] uppercase tracking-[0.18em] text-white/75 shadow-[0_10px_30px_rgba(56,189,248,0.16)] transition hover:border-white/35 hover:text-white active:scale-[0.97]"
                            >
                                Live demo
                                <ArrowUpRight className="h-3 w-3" />
                            </a>
                        )}
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="relative min-h-[14rem] list-none rounded-[1.5rem] transition-all duration-300 will-change-transform hover:scale-[1.02] hover:shadow-2xl hover:shadow-zinc-500/20 active:scale-[0.98] active:shadow-xl dark:hover:shadow-zinc-900/40 group/item">
            {CardContent}
        </div>
    );
};
