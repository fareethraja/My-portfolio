"use client";

import { motion } from "framer-motion";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { Card, CardCanvas } from "@/components/ui/animated-glow-card";
import { XCard } from "@/components/ui/x-gradient-card";

const SKILLS_DATA = [
    {
        title: "Strategic Thinking",
        description: "Seeing the bigger picture and connecting dots others might miss",
    },
    {
        title: "Execution Focus",
        description: "Moving from ideas to implementation without getting stuck",
    },
    {
        title: "System-Level Problem Solving",
        description: "Understanding how pieces fit together",
    },
    {
        title: "Experimentation Mindset",
        description: "Testing assumptions, learning from failures",
    },
];

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
                                My interest lies in understanding how products work—not just the surface-level features, but the systems behind them. I enjoy breaking down complex problems, running experiments, and finding solutions that actually make sense.
                            </p>
                            <p>
                                I&apos;m particularly drawn to{" "}
                                <span className="text-foreground font-medium">AI-driven products</span> and the{" "}
                                <span className="text-foreground font-medium">gaming industry</span>—spaces where technology meets user experience in interesting ways.
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
                                        <h3 className="text-xl font-bold text-foreground mb-4">What I Bring</h3>
                                        <ul className="space-y-4">
                                            {SKILLS_DATA.map((skill, index) => (
                                                <li key={index} className="flex items-start gap-3">
                                                    <span className="mt-1.5 w-2 h-2 rounded-full bg-primary shrink-0" />
                                                    <div>
                                                        <span className="font-semibold text-foreground">{skill.title}</span>
                                                        <span className="text-muted-foreground block text-sm"> — {skill.description}</span>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
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
