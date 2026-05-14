"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
    ArrowRight,
    Briefcase,
    Cpu,
    FileText,
    Github,
    Home,
    Linkedin,
    Mail,
    Search,
    Sparkles,
    User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";

type Action =
    | { type: "scroll"; id: string }
    | { type: "navigate"; href: string }
    | { type: "external"; href: string };

interface PaletteItem {
    id: string;
    label: string;
    hint?: string;
    icon: LucideIcon;
    keywords: string[];
    action: Action;
}

const ITEMS: PaletteItem[] = [
    { id: "hero", label: "Home", hint: "Top of page", icon: Home, keywords: ["home", "hero", "top", "intro"], action: { type: "scroll", id: "hero" } },
    { id: "about", label: "About", hint: "Who I am", icon: User, keywords: ["about", "bio", "who"], action: { type: "scroll", id: "about" } },
    { id: "timeline", label: "Experience", hint: "Career timeline", icon: Briefcase, keywords: ["experience", "timeline", "career", "work"], action: { type: "scroll", id: "timeline" } },
    { id: "projects", label: "Projects", hint: "Selected work", icon: Briefcase, keywords: ["projects", "work", "portfolio", "finverse"], action: { type: "scroll", id: "projects" } },
    { id: "work", label: "Case Studies", hint: "All case studies", icon: FileText, keywords: ["case", "studies", "writeup", "work"], action: { type: "navigate", href: "/work" } },
    { id: "case-finverse", label: "Finverse Case Study", hint: "/work/finverse", icon: FileText, keywords: ["finverse", "case", "study", "ai", "fintech"], action: { type: "navigate", href: "/work/finverse" } },
    { id: "case-smartslot", label: "SmartSlot Case Study", hint: "/work/smartslot", icon: FileText, keywords: ["smartslot", "case", "dental", "pwa"], action: { type: "navigate", href: "/work/smartslot" } },
    { id: "case-roomspace", label: "RoomSpace Case Study", hint: "/work/roomspace", icon: FileText, keywords: ["roomspace", "case", "key", "tracker"], action: { type: "navigate", href: "/work/roomspace" } },
    { id: "tools", label: "Skills & Tools", hint: "Stack", icon: Cpu, keywords: ["skills", "tools", "stack", "tech"], action: { type: "scroll", id: "tools" } },
    { id: "contact", label: "Contact", hint: "Say hello", icon: Mail, keywords: ["contact", "email", "connect", "hello"], action: { type: "scroll", id: "contact" } },
    { id: "now", label: "Now", hint: "What I'm doing right now", icon: Sparkles, keywords: ["now", "current", "focus", "today"], action: { type: "navigate", href: "/now" } },
    { id: "resume", label: "Download Resume", hint: "PDF", icon: FileText, keywords: ["resume", "cv", "pdf", "download"], action: { type: "external", href: "/api/resume" } },
    { id: "github", label: "GitHub", hint: "github.com/fareethraja", icon: Github, keywords: ["github", "code", "repo"], action: { type: "external", href: "https://github.com/fareethraja" } },
    { id: "linkedin", label: "LinkedIn", hint: "in/fareethraja", icon: Linkedin, keywords: ["linkedin", "social"], action: { type: "external", href: "https://www.linkedin.com/in/fareethraja/" } },
    { id: "email", label: "Email", hint: "fareethraja.26.careers@gmail.com", icon: Mail, keywords: ["email", "mail", "gmail"], action: { type: "external", href: "mailto:fareethraja.26.careers@gmail.com" } },
    { id: "finverse", label: "See Finverse live", hint: "finverse.trade", icon: Sparkles, keywords: ["finverse", "trade", "live", "demo"], action: { type: "external", href: "https://finverse.trade/" } },
];

export function CommandPalette() {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [active, setActive] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return ITEMS;
        return ITEMS.filter((item) =>
            item.label.toLowerCase().includes(q) ||
            item.keywords.some((k) => k.includes(q)),
        );
    }, [query]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
                e.preventDefault();
                setOpen((v) => !v);
                return;
            }
            if (e.key === "Escape") {
                setOpen(false);
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    useEffect(() => {
        if (open) {
            requestAnimationFrame(() => {
                setQuery("");
                setActive(0);
                inputRef.current?.focus();
            });
        }
    }, [open]);

    const runAction = useCallback(
        (item: PaletteItem) => {
            setOpen(false);
            const { action } = item;
            if (action.type === "scroll") {
                if (window.location.pathname !== "/") {
                    router.push(`/#${action.id}`);
                    return;
                }
                const el = document.getElementById(action.id);
                el?.scrollIntoView({ behavior: "smooth" });
            } else if (action.type === "navigate") {
                router.push(action.href);
            } else if (action.type === "external") {
                window.open(action.href, "_blank", "noopener,noreferrer");
            }
        },
        [router],
    );

    const onListKey = (e: React.KeyboardEvent) => {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setActive((i) => Math.min(i + 1, filtered.length - 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((i) => Math.max(i - 1, 0));
        } else if (e.key === "Enter") {
            e.preventDefault();
            const item = filtered[active];
            if (item) runAction(item);
        }
    };

    return (
        <>
            {/* floating launcher (visible on desktop, top-right) */}
            <button
                type="button"
                onClick={() => setOpen(true)}
                aria-label="Open command palette"
                className="fixed right-5 top-5 z-[60] hidden items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-1.5 text-xs text-white/70 backdrop-blur-md transition hover:border-white/30 hover:text-white md:inline-flex"
            >
                <Search className="h-3.5 w-3.5" />
                <span className="font-jetbrains tracking-[0.18em] uppercase">Search</span>
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        key="cmdk-backdrop"
                        initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                        animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
                        exit={{ opacity: 0, backdropFilter: "blur(0px)", transition: { duration: 0.28, ease: [0.32, 0.72, 0, 1] } }}
                        transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
                        className="fixed inset-0 z-[100] flex items-start justify-center bg-black/55 px-4 pt-[15vh]"
                        onClick={() => setOpen(false)}
                    >
                        <motion.div
                            key="cmdk-card"
                            initial={{ opacity: 0, y: -16, scale: 0.94 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{
                                opacity: 0,
                                y: -8,
                                scale: 0.97,
                                filter: "blur(4px)",
                                transition: { duration: 0.26, ease: [0.32, 0.72, 0, 1] },
                            }}
                            transition={{
                                type: "spring",
                                damping: 22,
                                stiffness: 320,
                                mass: 0.7,
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-xl overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/95 shadow-2xl backdrop-blur-xl"
                            role="dialog"
                            aria-modal="true"
                            aria-label="Command palette"
                            onKeyDown={onListKey}
                        >
                            <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
                                <Search className="h-4 w-4 text-white/50" />
                                <input
                                    ref={inputRef}
                                    value={query}
                                    onChange={(e) => {
                                        setQuery(e.target.value);
                                        setActive(0);
                                    }}
                                    placeholder="Jump to a section, link, or action…"
                                    className="flex-1 bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
                                />
                                <kbd className="hidden rounded border border-white/15 bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-white/50 sm:inline">esc</kbd>
                            </div>

                            <ul className="max-h-[60vh] overflow-y-auto py-2">
                                {filtered.length === 0 && (
                                    <li className="px-4 py-6 text-center text-sm text-white/50">No matches.</li>
                                )}
                                {filtered.map((item, i) => {
                                    const Icon = item.icon;
                                    const isActive = i === active;
                                    return (
                                        <li key={item.id}>
                                            <button
                                                type="button"
                                                onMouseEnter={() => setActive(i)}
                                                onClick={() => runAction(item)}
                                                className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition ${
                                                    isActive ? "bg-white/[0.06] text-white" : "text-white/80 hover:bg-white/[0.04]"
                                                }`}
                                            >
                                                <span className={`flex h-7 w-7 items-center justify-center rounded-md border ${
                                                    isActive ? "border-violet-400/40 bg-violet-500/10 text-violet-200" : "border-white/10 bg-white/[0.03] text-white/60"
                                                }`}>
                                                    <Icon className="h-3.5 w-3.5" />
                                                </span>
                                                <span className="flex-1">
                                                    <span className="block">{item.label}</span>
                                                    {item.hint && (
                                                        <span className="block text-[11px] text-white/40">{item.hint}</span>
                                                    )}
                                                </span>
                                                <ArrowRight className={`h-3.5 w-3.5 ${isActive ? "text-violet-300" : "text-white/30"}`} />
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>

                            <div className="flex items-center justify-between border-t border-white/10 px-4 py-2 text-[11px] text-white/40">
                                <span className="flex items-center gap-2">
                                    <kbd className="rounded border border-white/15 bg-white/5 px-1 font-mono">↑</kbd>
                                    <kbd className="rounded border border-white/15 bg-white/5 px-1 font-mono">↓</kbd>
                                    navigate
                                </span>
                                <span className="flex items-center gap-2">
                                    <kbd className="rounded border border-white/15 bg-white/5 px-1 font-mono">↵</kbd>
                                    select
                                </span>
                                <span className="flex items-center gap-2">
                                    <kbd className="rounded border border-white/15 bg-white/5 px-1 font-mono">esc</kbd>
                                    close
                                </span>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
