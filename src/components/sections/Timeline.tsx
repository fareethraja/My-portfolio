"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import TiltedCard from "@/components/ui/tilted-card";

const TIMELINE_DATA = [
    {
        year: "2021 - 2024",
        title: "Economics Graduate",
        description: "The New College. Built a foundation in analytical thinking and market behavior reasoning.",
    },
    {
        year: "2024 - 2025",
        title: "HR Ops Intern - Peunier",
        description: "Optimized ATS workflows reducing time-to-hire by 20%. Led recruitment and systems optimization.",
    },
    {
        year: "2024 - 2026",
        title: "MBA in Finance and Marketing",
        description: "Focusing on Product Thinking, Market Analysis, and Data-Backed Strategy at Krupanidhi College.",
    },
    {
        year: "2024",
        title: "Product Intern - Kidofin",
        description: "Hands-on product experience in a live EdTech environment. Improved platform reliability and user flows.",
    },
    {
        year: "2024 - Present",
        title: "Product & AI Builder (Independent)",
        description: "Building AI-powered systems, automation workflows, and MVPs. Orchestrating AI agents to solve operational problems.",
    },
];

export function Timeline() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"],
    });

    const height = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

    return (
        <section
            id="timeline"
            ref={containerRef}
            className="min-h-screen py-24 flex flex-col items-center justify-center relative overflow-hidden"
        >
            <div className="section-container relative">
                <div className="flex flex-col items-center mb-20">
                    <p className="text-xl md:text-2xl font-medium text-zinc-700 dark:text-zinc-300 text-center mb-6 max-w-2xl">
                        A timeline of how curiosity turned into product thinking.
                    </p>

                    <div className="mb-6 text-zinc-400 dark:text-zinc-600">
                        <svg
                            width="50"
                            height="50"
                            viewBox="0 0 100 100"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="transform rotate-12"
                        >
                            <path
                                d="M30 10 C 20 20, 10 40, 30 60 C 50 80, 80 60, 70 90"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeLinecap="round"
                                fill="none"
                            />
                            <path
                                d="M60 85 L 70 90 L 78 80"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeLinecap="round"
                                fill="none"
                            />
                        </svg>
                    </div>

                    <h2 className="text-3xl md:text-4xl font-bold">Journey</h2>
                </div>

                <div className="relative pl-8 md:pl-0">
                    {/* Vertical Line Container */}
                    <div
                        className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-zinc-200 dark:bg-zinc-800 md:-translate-x-1/2 z-timeline-line pointer-events-none"
                    >
                        {/* Scroll Progress Line */}
                        <motion.div
                            style={{ height }}
                            className="absolute top-0 left-0 w-full bg-black dark:bg-white origin-top"
                        />
                    </div>

                    <div className="space-y-12">
                        {TIMELINE_DATA.map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-40% 0px -40% 0px" }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className={`flex flex-col md:flex-row items-start ${index % 2 !== 0 ? "md:flex-row-reverse" : ""
                                    } relative pl-12 md:pl-0`}
                            >
                                {/* Timeline Dot */}
                                <div className="absolute left-4 md:left-1/2 w-4 h-4 bg-white border-2 border-black dark:border-white dark:bg-black rounded-full -translate-x-1/2 z-10 mt-1.5" />

                                <div className="md:w-1/2" />
                                <div className="md:w-1/2 px-2 sm:px-4 md:px-6">
                                    <TiltedCard
                                        captionText={item.year}
                                        scaleOnHover={1.08}
                                        rotateAmplitude={14}
                                        showTooltip={true}
                                        className="w-full"
                                    >
                                        <div className="liquid-glass w-full aspect-[16/7] sm:aspect-[16/6] rounded-2xl p-5 sm:p-6 md:p-8 flex flex-col justify-center">
                                            <span className="relative z-10 text-xs sm:text-sm font-mono text-zinc-400 block mb-2">
                                                {item.year}
                                            </span>
                                            <h3 className="relative z-10 text-base sm:text-lg md:text-xl font-semibold mb-2 text-white">
                                                {item.title}
                                            </h3>
                                            <p className="relative z-10 text-xs sm:text-sm md:text-base text-zinc-300/90 leading-relaxed">
                                                {item.description}
                                            </p>
                                        </div>
                                    </TiltedCard>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section >
    );
}
