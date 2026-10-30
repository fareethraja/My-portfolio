"use client";

import { motion } from "framer-motion";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { Card, CardCanvas } from "@/components/ui/animated-glow-card";
import { XCard } from "@/components/ui/x-gradient-card";
import { Cpu, LineChart, Rocket, Target } from "lucide-react";

const SKILLS_DATA = [
    {
        title: "Product Discovery",
        description: "Exploring target users, user journeys, market positioning, and product assumptions",
        icon: Target,
        gradient: "from-blue-500 to-cyan-500",
    },
    {
        title: "Developer Experience",
        description: "Translating hands-on demonstrations into feature priorities and phased recommendations",
        icon: Rocket,
        gradient: "from-pink-500 to-rose-500",
    },
    {
        title: "AI & Automation",
        description: "Evaluating context continuity, personalization, memory, and cost trade-offs",
        icon: Cpu,
        gradient: "from-violet-500 to-indigo-500",
    },
    {
        title: "Finance Context",
        description: "Bringing fintech, payments, markets, and analytics context into product decisions",
        icon: LineChart,
        gradient: "from-emerald-500 to-teal-500",
    },
];

const skillCardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            delay: i * 0.1,
            duration: 0.4,
            ease: [0.25, 0.46, 0.45, 0.94] as const,
        },
    }),
};

export function About() {
    return (
        <section id="about" className="w-full pt-8 pb-12 md:pb-16 flex items-center justify-center relative">
            <div className="section-container">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-start">

                    {/* Left Column - Text Content */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="space-y-6"
                    >
                        <div>
                            <span className="eyebrow mb-5">About</span>
                            <h2 className="font-display mt-5 text-4xl md:text-5xl font-bold tracking-[-0.03em] text-foreground">
                                Product builder at the <span className="text-gradient-accent">finance &amp; AI</span> edge
                            </h2>
                        </div>

                        <div className="space-y-4 text-muted-foreground leading-relaxed">
                            <p>
                                I&apos;m an MBA Finance and Marketing graduate and Economics Gold Medalist working at the intersection of product management, AI, and business reasoning.
                            </p>
                            <p>
                                At Kumaran Systems, I contribute to enterprise AI discovery, developer-tool evaluation, user journeys, and feature-priority recommendations. Previously, I shaped AI and fintech workflows at Finverse through Bermer Software Limited.
                            </p>
                            <p>
                                I also build independent products such as SmartSlot and Placement Desk, connecting product decisions with the details that make a workflow usable. I care about understanding the user before expanding the feature list.
                            </p>
                        </div>

                        {/* Download Resume Button - Interactive Hover Button */}
                        <a
                            href="/api/resume"
                            download="Fareeth-Raja-APM-Resume-2026.pdf"
                            aria-label="Download Fareeth Raja resume"
                            title="Download Fareeth Raja resume"
                            className="inline-block mt-4"
                        >
                            <InteractiveHoverButton
                                text="Resume"
                                className="w-40"
                            />
                        </a>
                    </motion.div>

                    {/* Right Column - What I Bring Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="relative w-full overflow-hidden md:overflow-visible pb-8 md:pb-0"
                    >
                        <div className="relative w-full">
                            <CardCanvas>
                                <Card>
                                    <XCard
                                        authorName="Fareeth Raja"
                                        authorHandle="fareeth"
                                        authorImage=""
                                        timestamp="Product, AI, FinTech"
                                    >
                                        <h3 className="text-xl font-bold text-foreground mb-5">What I Bring</h3>
                                        <div className="grid grid-cols-2 gap-3">
                                            {SKILLS_DATA.map((skill, index) => {
                                                const Icon = skill.icon;
                                                return (
                                                    <motion.div
                                                        key={index}
                                                        custom={index}
                                                        initial="hidden"
                                                        whileInView="visible"
                                                        viewport={{ once: true }}
                                                        variants={skillCardVariants}
                                                        whileHover={{ scale: 1.05, y: -2 }}
                                                        className="group relative p-3 rounded-xl bg-primary/5 dark:bg-white/[0.03] border border-border/70 cursor-default transition-all duration-300 hover:border-primary/50 hover:bg-primary/10 dark:hover:bg-white/[0.06]"
                                                    >
                                                        {/* Hover glow effect */}
                                                        <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${skill.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300 blur-sm`} />
                                                        
                                                        {/* Icon */}
                                                        <div className={`relative z-10 w-8 h-8 rounded-lg bg-gradient-to-br ${skill.gradient} flex items-center justify-center mb-2 shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
                                                            <Icon className="w-4 h-4 text-white" />
                                                        </div>
                                                        
                                                        {/* Title */}
                                                        <h4 className="relative z-10 font-semibold text-sm text-foreground mb-1 group-hover:text-foreground transition-colors duration-300">
                                                            {skill.title}
                                                        </h4>
                                                        
                                                        {/* Description */}
                                                        <p className="relative z-10 text-xs text-muted-foreground leading-relaxed group-hover:text-foreground/80 transition-colors duration-300">
                                                            {skill.description}
                                                        </p>
                                                    </motion.div>
                                                );
                                            })}
                                        </div>
                                    </XCard>
                                </Card>
                            </CardCanvas>
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
}
