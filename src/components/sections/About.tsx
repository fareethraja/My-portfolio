"use client";

import { motion } from "framer-motion";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { Card, CardCanvas } from "@/components/ui/animated-glow-card";
import { XCard } from "@/components/ui/x-gradient-card";
import { Target, Rocket, Puzzle, FlaskConical } from "lucide-react";

const SKILLS_DATA = [
    {
        title: "Strategic Thinking",
        description: "Seeing the bigger picture and connecting dots others might miss",
        icon: Target,
        gradient: "from-violet-500 to-purple-600",
    },
    {
        title: "Execution Focus",
        description: "Moving from ideas to implementation without getting stuck",
        icon: Rocket,
        gradient: "from-pink-500 to-rose-600",
    },
    {
        title: "System-Level Thinking",
        description: "Understanding how pieces fit together",
        icon: Puzzle,
        gradient: "from-cyan-500 to-blue-600",
    },
    {
        title: "Experimentation",
        description: "Testing assumptions, learning from failures",
        icon: FlaskConical,
        gradient: "from-amber-500 to-orange-600",
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
            ease: "easeOut",
        },
    }),
};

export function About() {
    return (
        <section id="about" className="min-h-screen py-24 flex items-center justify-center relative">
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
                            <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-2">About</p>
                            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                                The Short Version
                            </h2>
                        </div>

                        <div className="space-y-4 text-muted-foreground leading-relaxed">
                            <p>
                                I&apos;m an MBA student specializing in Finance and Marketing with a background in Economics.
                            </p>
                            <p>
                                My interest lies in understanding how products work. Not just the surface-level features, but the systems behind them. I enjoy breaking down complex problems, running experiments, and finding solutions that actually make sense.
                            </p>
                            <p>
                                I&apos;m particularly drawn to{" "}
                                <span className="text-foreground font-medium">AI-driven products</span> and the{" "}
                                <span className="text-foreground font-medium">gaming industry</span>. These are spaces where technology meets user experience in interesting ways.
                            </p>
                        </div>

                        {/* Download Resume Button - Interactive Hover Button */}
                        <a
                            href="https://drive.google.com/file/d/1_6HAbWfhWHZm5Xq-6rw8G3j7D1u9Lbm_/view?usp=sharing"
                            target="_blank"
                            rel="noopener noreferrer"
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
                                        authorImage="https://github.com/shadcn.png"
                                        timestamp="Always Learning"
                                        link="#"
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
