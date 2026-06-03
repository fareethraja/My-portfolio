"use client";

import { motion } from "framer-motion";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { Card, CardCanvas } from "@/components/ui/animated-glow-card";
import { XCard } from "@/components/ui/x-gradient-card";
import { Cpu, LineChart, Rocket, Target } from "lucide-react";

const SKILLS_DATA = [
    {
        title: "Product Ownership",
        description: "Turning founder asks into requirements, user flows, acceptance criteria, and launch checks",
        icon: Target,
        gradient: "from-blue-500 to-cyan-500",
    },
    {
        title: "Technical Execution",
        description: "Explaining APIs, auth, payments, AI guardrails, backend logic, and QA tradeoffs",
        icon: Rocket,
        gradient: "from-pink-500 to-rose-500",
    },
    {
        title: "AI & Automation",
        description: "Designing AI chat flows, automation logic, and workflows that reduce manual work",
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
        <section id="about" className="min-h-fit md:min-h-screen py-12 md:py-24 flex items-center justify-center relative">
            <div className="w-full max-w-6xl mx-auto px-6 md:px-8">
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
                                I&apos;m an MBA Finance and Marketing candidate working at the intersection of product management, technical execution, and fintech.
                            </p>
                            <p>
                                Right now, I work on Finverse as a Product Manager, translating broad founder requirements into feature specs, implementation logic, user journeys, bug lists, QA checks, and release-ready AI/fintech workflows.
                            </p>
                            <p>
                                I care about products that move from idea to usable systems: clear user flows, reliable payments, grounded AI chat, admin tooling, analytics, and trading workflows that can survive real users.
                            </p>
                        </div>

                        {/* Download Resume Button - Interactive Hover Button */}
                        <a
                            href="/api/resume"
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
                                                        className="group relative p-3 rounded-xl bg-white/5 dark:bg-white/[0.03] border border-white/10 dark:border-white/5 cursor-default transition-all duration-300 hover:border-white/20 hover:bg-white/10 dark:hover:bg-white/[0.06]"
                                                    >
                                                        {/* Hover glow effect */}
                                                        <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${skill.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300 blur-sm`} />
                                                        
                                                        {/* Icon */}
                                                        <div className={`relative z-10 w-8 h-8 rounded-lg bg-gradient-to-br ${skill.gradient} flex items-center justify-center mb-2 shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
                                                            <Icon className="w-4 h-4 text-white" />
                                                        </div>
                                                        
                                                        {/* Title */}
                                                        <h4 className="relative z-10 font-semibold text-sm text-foreground mb-1 group-hover:text-white transition-colors duration-300">
                                                            {skill.title}
                                                        </h4>
                                                        
                                                        {/* Description */}
                                                        <p className="relative z-10 text-xs text-muted-foreground leading-relaxed group-hover:text-white/70 transition-colors duration-300">
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
