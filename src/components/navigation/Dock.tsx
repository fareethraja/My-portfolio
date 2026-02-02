"use client";

import { SECTIONS } from "@/lib/constants";
import { useActiveSection } from "@/hooks/use-active-section";
import { clsx } from "clsx";

export function Dock() {
    const activeSection = useActiveSection();

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: "smooth" });
        }
    };

    return (
        <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
            <div className="flex items-center gap-2 px-4 py-3 bg-white/10 dark:bg-black/80 backdrop-blur-md rounded-full border border-white/20 shadow-lg">
                {SECTIONS.map((section) => {
                    const isActive = activeSection === section.id;
                    return (
                        <button
                            key={section.id}
                            onClick={() => scrollToSection(section.id)}
                            className={clsx(
                                "p-3 rounded-full transition-colors",
                                isActive
                                    ? "bg-white text-black dark:bg-white dark:text-black"
                                    : "text-zinc-800 dark:text-zinc-200 hover:bg-white/20 dark:hover:bg-white/10"
                            )}
                            aria-label={`Scroll to ${section.label}`}
                            title={section.label}
                            aria-current={isActive ? "page" : undefined}
                        >
                            <section.icon size={20} />
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}
