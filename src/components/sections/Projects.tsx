"use client";

import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { ArrowUpRight, Calendar, Key, TrendingUp, Zap } from "lucide-react";
import Link from "next/link";
import React, { useRef, useState } from "react";
import { useAnalytics } from "@/hooks/use-analytics";

const PROJECTS_DATA = [
    {
        title: "Finverse",
        subtitle: "AI-powered Stock Market Super App",
        description:
            "Own product planning and execution across Zeno AI, screeners, strategy builder, backtesting, paper trading, courses, checkout, admin workflows, and real-time market tools.",
        tags: ["Product Management", "FinTech", "AI Chat", "Next.js", "Go", "Razorpay"],
        icon: <TrendingUp className="h-4 w-4" />,
        link: "https://finverse.trade/",
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
                        <span className="text-gradient-accent">Projects</span> I&apos;ve shipped
                    </h2>
                    <p className="mt-5 max-w-2xl text-base md:text-lg text-muted-foreground">
                        FinTech super apps, mobile-first PWAs, and product experiments built end to end.
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
                            hasDemo={project.hasDemo}
                        />
                    ))}
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
    hasDemo?: boolean;
}

const GridItem = ({ icon, title, subtitle, description, tags, link, hasDemo }: GridItemProps) => {
    const [isHovering, setIsHovering] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);
    const { trackProjectClick } = useAnalytics();

    // Mouse tracking for custom tooltip
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        mouseX.set(e.clientX - rect.left);
        mouseY.set(e.clientY - rect.top);
    };

    // Smooth spring animation for the tooltip
    const springConfig = { damping: 20, stiffness: 300 };
    const springX = useSpring(mouseX, springConfig);
    const springY = useSpring(mouseY, springConfig);

    const CardContent = (
        <div
            ref={cardRef}
            className="relative h-full rounded-[1.25rem] border-[0.75px] border-zinc-200 dark:border-zinc-800 p-2 md:rounded-[1.5rem] md:p-3 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-zinc-500/20 dark:hover:shadow-zinc-900/40 active:scale-[0.98] active:shadow-xl will-change-transform cursor-pointer"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            onMouseMove={handleMouseMove}
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
            </div>

            {/* Float Tooltip */}
            <AnimatePresence>
                {hasDemo && isHovering && (
                    <motion.div
                        key="demo-tooltip"
                        style={{
                            left: springX,
                            top: springY,
                            position: 'absolute',
                            zIndex: 50,
                            pointerEvents: 'none',
                        }}
                        initial={{ opacity: 0, y: 6, scale: 0.92 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{
                            opacity: 0,
                            y: 4,
                            scale: 0.94,
                            transition: { duration: 0.18, ease: [0.32, 0.72, 0, 1] },
                        }}
                        transition={{ type: "spring", damping: 22, stiffness: 320, mass: 0.6 }}
                        className="-translate-x-1/2 -translate-y-[160%]"
                    >
                        <div className="relative">
                            {/* glow halo */}
                            <div
                                aria-hidden
                                className="pointer-events-none absolute -inset-2 rounded-full bg-gradient-to-br from-violet-500/30 to-sky-500/30 opacity-70 blur-xl"
                            />
                            <div className="relative inline-flex items-center gap-2 rounded-full border border-white/15 bg-zinc-950/85 px-3 py-1.5 backdrop-blur-md shadow-[0_8px_24px_rgba(139,92,246,0.25)]">
                                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-sky-500">
                                    <ArrowUpRight className="h-2.5 w-2.5 text-white" strokeWidth={2.5} />
                                </span>
                                <span className="font-jetbrains text-[10px] uppercase tracking-[0.18em] text-white/85">
                                    View live demo
                                </span>
                                <span className="relative flex h-1.5 w-1.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                </span>
                                {/* tail */}
                                <span
                                    aria-hidden
                                    className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 rounded-[2px] border-r border-b border-white/15 bg-zinc-950/85"
                                />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );

    return (
        <div className="min-h-[14rem] list-none group/item">
            {link ? (
                <Link
                    href={link}
                    target="_blank"
                    className="block h-full"
                    onClick={() => trackProjectClick(title)} // Tracking click
                >
                    {CardContent}
                </Link>
            ) : (
                CardContent
            )}
        </div>
    );
};
