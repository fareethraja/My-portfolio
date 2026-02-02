"use client";

import { GlowingEffect } from "@/components/ui/glowing-effect";
import { LineChart, Cpu, Database, Layout } from "lucide-react";
import { cn } from "@/lib/utils";

const TOOLS_DATA = [
    {
        category: "Product Strategy",
        items: ["Market Research", "User Framing", "MVP Definition", "Stakeholder Comm"],
        icon: <LineChart className="h-4 w-4" />,
    },
    {
        category: "AI & Engineering",
        items: ["AI Agents", "Prompt Engineering", "Automation Logic", "React & Node.js"],
        icon: <Cpu className="h-4 w-4" />,
    },
    {
        category: "Data & Analytics",
        items: ["SQL", "Power BI", "Excel Strategies", "Data Interpretation"],
        icon: <Database className="h-4 w-4" />,
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
        icon: <Layout className="h-4 w-4" />,
    },
];

export function Tools() {
    return (
        <section
            id="tools"
            className="min-h-screen py-24 flex flex-col items-center justify-center"
        >
            <div className="section-container">
                <h2 className="text-3xl font-bold mb-16 text-center">Skills</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {TOOLS_DATA.map((group, index) => (
                        <GridItem
                            key={index}
                            title={group.category}
                            items={group.items}
                            icon={group.icon}
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
    items: string[];
}

const GridItem = ({ icon, title, items }: GridItemProps) => {
    return (
        <div className="min-h-[14rem] list-none group/item">
            <div className="relative h-full rounded-[1.25rem] border-[0.75px] border-zinc-200 dark:border-zinc-800 p-2 md:rounded-[1.5rem] md:p-3 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-zinc-500/20 dark:hover:shadow-zinc-900/40 will-change-transform">
                <GlowingEffect
                    spread={80}
                    glow={true}
                    disabled={false}
                    proximity={64}
                    inactiveZone={0.01}
                    borderWidth={3}
                />
                <div className="relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl border-[0.75px] border-white/10 dark:border-white/10 bg-white/5 dark:bg-black/5 backdrop-blur-xl p-6 shadow-sm dark:shadow-[0px_0px_27px_0px_rgba(45,45,45,0.3)] md:p-6 transition-colors duration-300 group-hover/item:border-white/20 dark:group-hover/item:border-white/20">
                    <div className="relative flex flex-1 flex-col justify-between gap-3">
                        <div className="w-fit rounded-lg border-[0.75px] border-zinc-200 dark:border-zinc-800 bg-muted p-2">
                            {icon}
                        </div>
                        <div className="space-y-3">
                            <h3 className="pt-0.5 text-xl leading-[1.375rem] font-semibold font-sans tracking-[-0.04em] md:text-2xl md:leading-[1.875rem] text-balance text-foreground">
                                {title}
                            </h3>
                            <div className="flex flex-wrap gap-3">
                                {items.map((item, itemIndex) => (
                                    <div
                                        key={itemIndex}
                                        className={cn(
                                            "px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200",
                                            "border border-zinc-200 dark:border-zinc-800",
                                            "bg-white dark:bg-zinc-950",
                                            "hover:border-zinc-400 dark:hover:border-zinc-600",
                                            "hover:bg-zinc-50 dark:hover:bg-zinc-900",
                                        )}
                                    >
                                        {item}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
