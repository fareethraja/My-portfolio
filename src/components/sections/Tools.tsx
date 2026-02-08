"use client";

import { motion } from "framer-motion";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { LineChart, Cpu, Database, Layout } from "lucide-react";
import { cn } from "@/lib/utils";

const TOOLS_DATA = [
    {
        category: "Product Strategy",
        items: ["Market Research", "User Framing", "MVP Definition", "Stakeholder Comm"],
        icon: LineChart,
        gradient: "from-blue-500 to-cyan-400",
        glowColor: "rgba(59, 130, 246, 0.5)",
    },
    {
        category: "AI & Engineering",
        items: ["AI Agents", "Prompt Engineering", "Automation Logic", "React & Node.js"],
        icon: Cpu,
        gradient: "from-pink-500 to-rose-400",
        glowColor: "rgba(236, 72, 153, 0.5)",
    },
    {
        category: "Data & Analytics",
        items: ["SQL", "Power BI", "Excel Strategies", "Data Interpretation"],
        icon: Database,
        gradient: "from-emerald-500 to-teal-400",
        glowColor: "rgba(16, 185, 129, 0.5)",
    },
    {
        category: "Core Stack",
        items: [
            "React / Tailwind",
            "Firebase",
            "Git / GitHub",
            "Figma",
            "n8n",
        ],
        icon: Layout,
        gradient: "from-violet-500 via-pink-500 to-orange-400",
        glowColor: "rgba(139, 92, 246, 0.5)",
    },
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15,
        },
    },
};

const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            ease: [0.25, 0.46, 0.45, 0.94] as const,
        },
    },
};

const tagVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: (i: number) => ({
        opacity: 1,
        scale: 1,
        transition: {
            delay: i * 0.05,
            duration: 0.3,
        },
    }),
};

export function Tools() {
    return (
        <section
            id="tools"
            className="min-h-screen py-24 flex flex-col items-center justify-center"
        >
            <div className="section-container">
                <motion.h2 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-3xl font-bold mb-16 text-center"
                >
                    Skills
                </motion.h2>

                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-8"
                >
                    {TOOLS_DATA.map((group, index) => (
                        <GridItem
                            key={index}
                            title={group.category}
                            items={group.items}
                            Icon={group.icon}
                            gradient={group.gradient}
                            glowColor={group.glowColor}
                        />
                    ))}
                </motion.div>
            </div>
        </section>
    );
}

interface GridItemProps {
    Icon: React.ElementType;
    title: string;
    items: string[];
    gradient: string;
    glowColor: string;
}

const GridItem = ({ Icon, title, items, gradient, glowColor }: GridItemProps) => {
    return (
        <motion.div 
            variants={cardVariants}
            className="min-h-56 list-none group/item"
        >
            <div className="relative h-full rounded-2xl border border-zinc-200 dark:border-zinc-800 p-2 md:rounded-3xl md:p-3 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl will-change-transform"
                style={{ 
                    boxShadow: `0 0 40px ${glowColor.replace('0.5', '0.1')}`,
                }}
            >
                <GlowingEffect
                    spread={80}
                    glow={true}
                    disabled={false}
                    proximity={64}
                    inactiveZone={0.01}
                    borderWidth={3}
                />
                <div className="relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl border border-white/10 dark:border-white/10 bg-white/5 dark:bg-black/5 backdrop-blur-xl p-6 shadow-sm dark:shadow-[0px_0px_27px_0px_rgba(45,45,45,0.3)] md:p-6 transition-colors duration-300 group-hover/item:border-white/20 dark:group-hover/item:border-white/20">
                    <div className="relative flex flex-1 flex-col justify-between gap-4">
                        {/* Animated Icon with Gradient Background */}
                        <motion.div 
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                            className={cn(
                                "w-12 h-12 rounded-xl flex items-center justify-center",
                                "bg-gradient-to-br shadow-lg",
                                gradient
                            )}
                            style={{
                                boxShadow: `0 4px 20px ${glowColor}`,
                            }}
                        >
                            <Icon className="h-5 w-5 text-white" />
                        </motion.div>
                        
                        <div className="space-y-4">
                            <h3 className="text-xl font-semibold font-sans tracking-tight md:text-2xl text-balance text-foreground">
                                {title}
                            </h3>
                            <div className="flex flex-wrap gap-2.5">
                                {items.map((item, itemIndex) => (
                                    <motion.div
                                        key={itemIndex}
                                        custom={itemIndex}
                                        variants={tagVariants}
                                        whileHover={{ 
                                            scale: 1.05,
                                            boxShadow: `0 0 20px ${glowColor}`,
                                        }}
                                        className={cn(
                                            "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-default",
                                            "border border-zinc-200 dark:border-zinc-700",
                                            "bg-white/80 dark:bg-zinc-900/80",
                                            "hover:border-transparent",
                                            "hover:bg-gradient-to-r hover:text-white",
                                            gradient.includes('violet') 
                                                ? "hover:from-violet-500 hover:via-pink-500 hover:to-orange-400"
                                                : gradient.includes('emerald')
                                                ? "hover:from-emerald-500 hover:to-teal-400"
                                                : gradient.includes('pink')
                                                ? "hover:from-pink-500 hover:to-rose-400"
                                                : "hover:from-blue-500 hover:to-cyan-400"
                                        )}
                                    >
                                        {item}
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
