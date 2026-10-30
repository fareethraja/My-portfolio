"use client";

import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { Award } from "lucide-react";
import { useRef, useState } from "react";
import TiltedCard from "@/components/ui/tilted-card";

const TIMELINE_DATA = [
    {
        year: "Sep 2026 - Present",
        title: "Product Manager Trainee - Kumaran Systems",
        description:
            "Contributing to enterprise AI discovery, user journeys, memory and personalization evaluation, GitHub Copilot demonstrations, and phased feature-priority recommendations. Proposals are not presented as shipped features.",
    },
    {
        year: "Feb 2026 - Aug 2026",
        title: "Product Manager - Finverse via Bermer Software Limited",
        description:
            "Shaped requirements, user journeys, acceptance criteria, release priorities, and QA checks across AI chat, market tools, trading simulation, courses, checkout, and admin flows.",
    },
    {
        year: "Jan 2026 - Aug 2026",
        title: "Product Intern - Bermer / Niyantha",
        description:
            "Supported hardware and IoT product positioning, business communication, and stakeholder-ready narratives before transitioning into the Finverse engagement.",
    },
    {
        year: "Dec 2025 - Jan 2026",
        title: "Product Manager (Technical) - Kiddofin",
        description:
            "Led website delivery, automated email onboarding, feature planning, and stakeholder pitches. Presented the product vision and user value at Google.",
    },
    {
        year: "Dec 2024 - Jan 2025",
        title: "Human Resource Management Intern - Peunier",
        description:
            "Screened and interviewed candidates, supported hiring, and improved ATS-based recruitment workflows.",
    },
    {
        year: "Oct 2024 - Aug 2026",
        title: "MBA in Finance and Marketing - Krupanidhi College",
        description:
            "Graduated on Aug 8, 2026 with a CGPA of 8.38/10, earning Best Outgoing Student and the Finance Gold Medal. Organized Orphic 2025 and emceed most college events; Best Presenter at Krupacon International Conference 2025 and Emerging Entrepreneur award recipient.",
    },
    {
        year: "Oct 2021 - Apr 2024",
        title: "Bachelor of Economics - The New College",
        description:
            "Economics Gold Medalist and Students' Union Leader. Co-founded IRA 2K24, coordinated 400 student organizers for over 2,500 visitors in one day, attracted sponsorship funding, and organized 20+ events over a one-year term. Won the college-level SDG Championship 2022 and led an environmental-focus team onward to state level.",
        easterEgg: "gold",
    },
];

export function Timeline() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start 85%", "end 20%"],
    });

    const height = useTransform(scrollYProgress, [0, 0.96], ["0%", "100%"]);

    return (
        <section
            id="timeline"
            ref={containerRef}
            className="w-full py-12 md:py-16 flex flex-col items-center justify-center relative overflow-hidden"
        >
            <div className="section-container relative">
                <div className="flex flex-col items-center mb-20 text-center">
                    <span className="eyebrow mb-5">Timeline</span>
                    <h2 className="font-display text-4xl md:text-6xl font-bold tracking-[-0.03em] text-foreground">
                        <span className="text-gradient-primary">Experience</span>
                    </h2>
                    <p className="mt-5 max-w-2xl text-base md:text-lg text-muted-foreground">
                        Enterprise AI today, with earlier experience in fintech products, IoT, entrepreneurship, and student leadership.
                    </p>
                    <span
                        aria-hidden
                        title="There's an easter egg in here…"
                        className="mt-4 inline-flex h-2 w-2 rounded-full bg-amber-300"
                        style={{
                            boxShadow:
                                "0 0 12px rgba(252, 211, 77, 0.85), 0 0 28px rgba(245, 158, 11, 0.45)",
                            animation: "pulse 2.6s ease-in-out infinite",
                        }}
                    />
                </div>

                <div className="relative pl-6 md:pl-0">
                    <div className="absolute left-2 md:left-1/2 top-0 bottom-0 w-0.5 bg-border/60 md:-translate-x-1/2 z-timeline-line pointer-events-none">
                        <motion.div
                            style={{ height }}
                            className="absolute top-0 left-0 w-full bg-primary origin-top"
                        />
                    </div>

                    <div className="space-y-12">
                        {TIMELINE_DATA.map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 24, scale: 0.98 }}
                                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                viewport={{ once: true, amount: 0.18, margin: "0px 0px -12% 0px" }}
                                transition={{ duration: 0.42, delay: 0.03, ease: [0.32, 0.72, 0, 1] }}
                                className={`flex flex-col md:flex-row items-start ${index % 2 !== 0 ? "md:flex-row-reverse" : ""
                                    } relative`}
                            >
                                <div className="absolute -left-4 md:left-1/2 w-4 h-4 bg-background border-2 border-primary rounded-full -translate-x-1/2 z-10 mt-1.5" />

                                <div className="md:w-1/2" />
                                <div className="w-full min-w-0 md:w-1/2 sm:px-2 md:px-6">
                                    {item.easterEgg === "gold" ? (
                                        <GoldenCard year={item.year} title={item.title} description={item.description} />
                                    ) : (
                                        <TiltedCard
                                            captionText={item.year}
                                            scaleOnHover={1.08}
                                            rotateAmplitude={14}
                                            showTooltip={true}
                                            className="w-full"
                                        >
                                            <div className="liquid-glass w-full rounded-2xl p-5 sm:p-6 md:p-8 flex flex-col justify-start min-h-[220px] sm:min-h-[200px]">
                                                <span className="relative z-10 text-sm sm:text-base font-mono text-primary block mb-2">
                                                    {item.year}
                                                </span>
                                                <h3 className="relative z-10 text-base sm:text-lg md:text-xl font-semibold mb-2 text-foreground">
                                                    {item.title}
                                                </h3>
                                                <p className="relative z-10 text-xs sm:text-sm md:text-base text-muted-foreground leading-relaxed">
                                                    {item.description}
                                                </p>
                                            </div>
                                        </TiltedCard>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

interface GoldenCardProps {
    year: string;
    title: string;
    description: string;
}

const CONFETTI_COLORS = ["#fde047", "#facc15", "#f59e0b", "#fbbf24", "#fff7d6", "#fcd34d"];
const CONFETTI = Array.from({ length: 28 }).map((_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 360,
    y: -160 - Math.random() * 120,
    rot: Math.random() * 720 - 360,
    delay: Math.random() * 0.15,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    size: 4 + Math.random() * 6,
}));

function GoldenCard({ year, title, description }: GoldenCardProps) {
    const [active, setActive] = useState(false);
    const [unlocked, setUnlocked] = useState(false);

    const reveal = () => {
        setActive(true);
        setUnlocked(true);
    };

    const toggle = () => {
        if (!active) setUnlocked(true);
        setActive((value) => !value);
    };

    return (
        <motion.div
            onHoverStart={reveal}
            onHoverEnd={() => setActive(false)}
            onClick={toggle}
            whileTap={{ scale: 0.98 }}
            animate={
                active
                    ? { scale: 1.04, rotate: [0, -1.2, 1.2, -0.8, 0.8, 0] }
                    : { scale: 1, rotate: 0 }
            }
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative w-full cursor-pointer select-none"
            role="button"
            aria-label="Reveal gold medalist easter egg"
            aria-pressed={active}
            data-unlocked={unlocked}
        >
            {/* "click me" hint until first unlock */}
            <AnimatePresence>
                {!unlocked && (
                    <motion.div
                        key="click-hint"
                        initial={{ opacity: 0, y: -6, scale: 0.9 }}
                        animate={{
                            opacity: 1,
                            y: [0, -4, 0],
                            scale: 1,
                            transition: {
                                opacity: { duration: 0.4 },
                                scale: { duration: 0.4 },
                                y: { duration: 1.6, repeat: Infinity, ease: "easeInOut" },
                            },
                        }}
                        exit={{ opacity: 0, y: -10, scale: 0.9, transition: { duration: 0.25 } }}
                        className="pointer-events-none absolute -top-3 right-4 z-30 -translate-y-full"
                    >
                        <div className="relative inline-flex items-center gap-1.5 rounded-full border border-amber-300/40 bg-amber-300/15 px-3 py-1 backdrop-blur-md shadow-[0_0_20px_rgba(252,211,77,0.35)]">
                            <span
                                className="h-1.5 w-1.5 rounded-full bg-amber-300"
                                style={{ boxShadow: "0 0 10px rgba(252, 211, 77, 1)" }}
                            />
                            <span className="font-jetbrains text-[10px] uppercase tracking-[0.18em] text-amber-800 dark:text-amber-100">
                                tap me
                            </span>
                            {/* tail */}
                            <span
                                aria-hidden
                                className="absolute -bottom-1 right-5 h-2 w-2 rotate-45 rounded-[2px] border-r border-b border-amber-300/40 bg-amber-300/15"
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {active && (
                    <motion.div
                        key="glow"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1.05 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.4 }}
                        className="pointer-events-none absolute -inset-3 rounded-3xl"
                        style={{
                            background:
                                "radial-gradient(ellipse at center, rgba(250, 204, 21, 0.45) 0%, rgba(245, 158, 11, 0.25) 35%, transparent 70%)",
                            filter: "blur(20px)",
                        }}
                    />
                )}
            </AnimatePresence>

            <div
                className={`relative w-full rounded-2xl p-5 sm:p-6 md:p-8 flex flex-col justify-start min-h-[220px] sm:min-h-[200px] overflow-hidden transition-all duration-500 ${active
                    ? "border-2 border-amber-300/70 shadow-[0_0_60px_-10px_rgba(252,211,77,0.6)]"
                    : "border border-amber-300/20 liquid-glass"
                    }`}
                style={
                    active
                        ? {
                            background:
                                "linear-gradient(135deg, #49330f 0%, #302207 50%, #1d1407 100%)",
                            backdropFilter: "blur(20px)",
                        }
                        : undefined
                }
            >
                <AnimatePresence>
                    {active && (
                        <motion.div
                            key="sheen"
                            initial={{ x: "-150%" }}
                            animate={{ x: "150%" }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                            className="pointer-events-none absolute inset-y-0 left-0 w-1/2"
                            style={{
                                background:
                                    "linear-gradient(110deg, transparent 0%, rgba(255, 235, 150, 0.35) 45%, rgba(255, 255, 255, 0.55) 50%, rgba(255, 235, 150, 0.35) 55%, transparent 100%)",
                                filter: "blur(2px)",
                            }}
                        />
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {active && (
                        <motion.div
                            key="medal"
                            initial={{ opacity: 0, scale: 0.4, rotate: -30, y: -10 }}
                            animate={{ opacity: 1, scale: 1, rotate: 0, y: 0 }}
                            exit={{ opacity: 0, scale: 0.4, rotate: 20 }}
                            transition={{ type: "spring", stiffness: 220, damping: 14 }}
                            className="absolute right-4 top-4 z-20 flex h-12 w-12 items-center justify-center rounded-full"
                            style={{
                                background:
                                    "radial-gradient(circle at 30% 30%, #fff7d6 0%, #fcd34d 35%, #b45309 100%)",
                                boxShadow:
                                    "0 0 30px rgba(252, 211, 77, 0.8), inset 0 -2px 6px rgba(0,0,0,0.35), inset 0 2px 4px rgba(255, 255, 255, 0.5)",
                            }}
                        >
                            <Award className="h-6 w-6 text-amber-900" strokeWidth={2.5} />
                        </motion.div>
                    )}
                </AnimatePresence>

                <span
                    className={`relative z-10 text-sm sm:text-base font-mono block mb-2 transition-colors duration-500 ${active ? "text-amber-200" : "text-primary"
                        }`}
                >
                    {year}
                </span>
                <h3
                    className={`relative z-10 text-base sm:text-lg md:text-xl font-semibold mb-2 transition-colors duration-500 ${active ? "text-amber-50" : "text-foreground"
                        }`}
                >
                    {title}
                </h3>
                <p
                    className={`relative z-10 text-xs sm:text-sm md:text-base leading-relaxed transition-colors duration-500 ${active ? "text-amber-100/90" : "text-muted-foreground"
                        }`}
                >
                    {description}
                </p>

                <AnimatePresence>
                    {active && (
                        <motion.div
                            key="badge"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 8 }}
                            transition={{ duration: 0.3, delay: 0.15 }}
                            className="relative z-10 mt-4 inline-flex items-center gap-2 self-start rounded-full border border-amber-300/40 bg-amber-300/15 px-3 py-1.5"
                        >
                            <span
                                className="h-1.5 w-1.5 rounded-full bg-amber-300"
                                style={{ boxShadow: "0 0 10px rgba(252, 211, 77, 1)" }}
                            />
                            <span className="font-jetbrains text-[10px] uppercase tracking-[0.18em] text-amber-100">
                                University of Madras Gold Medalist
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <AnimatePresence>
                {active && (
                    <div
                        key="confetti"
                        className="pointer-events-none absolute inset-0 z-30 flex items-end justify-center"
                        aria-hidden
                    >
                        {CONFETTI.map((piece) => (
                            <motion.span
                                key={piece.id}
                                initial={{ opacity: 0, y: 0, x: 0, rotate: 0, scale: 0.6 }}
                                animate={{
                                    opacity: [0, 1, 1, 0],
                                    x: piece.x,
                                    y: piece.y,
                                    rotate: piece.rot,
                                    scale: [0.6, 1, 1, 0.8],
                                }}
                                exit={{ opacity: 0 }}
                                transition={{
                                    duration: 1.6,
                                    delay: piece.delay,
                                    ease: [0.22, 1, 0.36, 1],
                                }}
                                className="absolute bottom-1/2 block rounded-sm"
                                style={{
                                    width: piece.size,
                                    height: piece.size * 1.6,
                                    background: piece.color,
                                    boxShadow: `0 0 8px ${piece.color}`,
                                }}
                            />
                        ))}
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
