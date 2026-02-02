"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { Workflow, Home, Zap, Calendar, Key } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import React, { useRef, useState } from "react";
import { useAnalytics } from "@/hooks/use-analytics";

const PROJECTS_DATA = [
    {
        title: "SmartSlot – Appointment Management PWA",
        subtitle: "Product-first | Real users | Healthcare domain",
        description:
            "Built a simple booking system where patients can book appointments through a single link. Clinics can plan their day better, avoid overbooking, and spend less time coordinating so they focus more on patients, not schedules.",
        tags: ["Product Management", "PWA", "User Experience", "Healthcare Tech", "Supabase"],
        icon: <Calendar className="h-4 w-4" />,
        link: "https://smartslot-lilac.vercel.app/",
        hasDemo: true,
    },
    {
        title: "Roommate Key Tracker",
        subtitle: "Problem-solving | IoT concept | Utility product",
        description:
            "Reduced key-related confusion in shared homes by ~30%, improving trust and daily coordination among roommates.",
        tags: ["Product Ideation", "IoT Concept", "Problem Validation", "UX Thinking"],
        icon: <Key className="h-4 w-4" />,
        hasDemo: true, // Requested hover effect, link can be added later or defaults to #
        link: "https://roommate-key-tracker.vercel.app/",
    },
    {
        title: "Automated Workflow Engine",
        subtitle: "Scalability | Ops | Automation mindset",
        description:
            "Built an enterprise-style automation engine using n8n to streamline repetitive workflows, API integrations, and notifications. Reduced manual coordination and improved reliability across operational processes.",
        tags: ["Automation", "n8n", "API Integration", "Systems Thinking"],
        icon: <Workflow className="h-4 w-4" />,
    },
    {
        title: "Hybrid 2.0 – Renewable Mobility Research",
        subtitle: "Research | Strategy | Vision",
        description:
            "Authored a research-backed concept on a renewable-energy–based hybrid mobility system targeting ~40% efficiency improvement. Focused on feasibility analysis, AI-assisted validation, and future scalability.",
        tags: ["Market Research", "Feasibility Analysis", "Sustainable Tech", "AI Strategy"],
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
                <h2 className="text-3xl font-bold mb-16 text-center">Projects</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            className="relative h-full rounded-[1.25rem] border-[0.75px] border-zinc-200 dark:border-zinc-800 p-2 md:rounded-[1.5rem] md:p-3 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-zinc-500/20 dark:hover:shadow-zinc-900/40 will-change-transform cursor-pointer"
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
            {hasDemo && isHovering && (
                <motion.div
                    style={{
                        left: springX,
                        top: springY,
                        position: 'absolute',
                        zIndex: 50,
                        pointerEvents: 'none'
                    }}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/90 dark:bg-white/90 text-white dark:text-black text-xs font-bold shadow-xl border border-white/20 dark:border-black/20 transform -translate-x-1/2 -translate-y-[150%]"
                >
                    <span>Click to view demo</span>
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                    </span>
                </motion.div>
            )}
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
