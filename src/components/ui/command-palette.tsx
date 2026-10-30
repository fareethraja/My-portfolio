"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
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
    X,
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
    { id: "case-enterprise-ai", label: "Enterprise AI Case Study", hint: "/work/enterprise-ai", icon: FileText, keywords: ["enterprise", "ai", "memory", "personalization", "discovery"], action: { type: "navigate", href: "/work/enterprise-ai" } },
    { id: "case-developer-tool", label: "AI Developer Tool Case Study", hint: "/work/ai-developer-tool", icon: FileText, keywords: ["developer", "copilot", "ai", "prioritization"], action: { type: "navigate", href: "/work/ai-developer-tool" } },
    { id: "case-placement-desk", label: "Placement Desk Case Study", hint: "/work/placement-desk", icon: FileText, keywords: ["placement", "desk", "candidate", "job"], action: { type: "navigate", href: "/work/placement-desk" } },
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
    const triggerRef = useRef<HTMLButtonElement>(null);
    const rootRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLUListElement>(null);
    const reducedMotion = useReducedMotion();

    const closePalette = useCallback((restoreFocus = false) => {
        setOpen(false);
        if (restoreFocus) triggerRef.current?.focus({ preventScroll: true });
    }, []);

    const openPalette = useCallback(() => {
        setQuery("");
        setActive(0);
        setOpen(true);
        window.dispatchEvent(new Event("portfolio-search-open"));
    }, []);

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
                if (open) closePalette(true);
                else openPalette();
                return;
            }
            if (open && e.key === "Escape") {
                e.preventDefault();
                closePalette(true);
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, openPalette, closePalette]);

    useEffect(() => {
        if (!open) return;
        const frame = requestAnimationFrame(() => inputRef.current?.focus({ preventScroll: true }));
        const onOutsidePointer = (event: PointerEvent) => {
            if (event.target instanceof Node && !rootRef.current?.contains(event.target)) {
                closePalette();
            }
        };
        document.addEventListener("pointerdown", onOutsidePointer);
        return () => {
            cancelAnimationFrame(frame);
            document.removeEventListener("pointerdown", onOutsidePointer);
        };
    }, [open, closePalette]);

    const runAction = useCallback(
        (item: PaletteItem) => {
            closePalette(true);
            const { action } = item;
            if (action.type === "scroll") {
                if (window.location.pathname !== "/") {
                    router.push(`/#${action.id}`);
                    return;
                }
                const el = document.getElementById(action.id);
                el?.scrollIntoView({ behavior: reducedMotion ? "instant" : "smooth" });
            } else if (action.type === "navigate") {
                router.push(action.href);
            } else if (action.type === "external") {
                window.open(action.href, "_blank", "noopener,noreferrer");
            }
        },
        [router, closePalette, reducedMotion],
    );

    const onListKey = (e: React.KeyboardEvent) => {
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            if (!filtered.length) return;
            const next = Math.max(0, Math.min(active + (e.key === "ArrowDown" ? 1 : -1), filtered.length - 1));
            setActive(next);
            listRef.current?.children[next]?.scrollIntoView({ block: "nearest", behavior: "instant" });
        } else if (e.key === "Enter") {
            e.preventDefault();
            const item = filtered[active];
            if (item) runAction(item);
        }
    };

    return (
        <div
            ref={rootRef}
            className="fixed right-[max(1rem,env(safe-area-inset-right))] top-[max(1rem,env(safe-area-inset-top))] z-[70]"
            onBlur={(event) => {
                if (event.relatedTarget instanceof Node && !event.currentTarget.contains(event.relatedTarget)) {
                    closePalette();
                }
            }}
        >
            <button
                ref={triggerRef}
                type="button"
                onClick={() => open ? closePalette(true) : openPalette()}
                aria-label="Search portfolio"
                aria-expanded={open}
                aria-controls="portfolio-search-panel"
                aria-haspopup="dialog"
                className="inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-full border border-border bg-popover/80 px-3 text-xs text-foreground/80 backdrop-blur-md transition-colors hover:border-primary hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
            >
                <Search className="h-3.5 w-3.5" />
                <span className="hidden font-jetbrains tracking-[0.18em] uppercase sm:inline">Search</span>
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        id="portfolio-search-panel"
                        key="cmdk-dropdown"
                        initial={{ opacity: 0, y: reducedMotion ? 0 : -8, scale: reducedMotion ? 1 : 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: reducedMotion ? 0 : -4 }}
                        transition={reducedMotion ? { duration: 0 } : { type: "spring", damping: 26, stiffness: 360 }}
                        style={{
                            width: "min(26rem, calc(100vw - max(1rem, env(safe-area-inset-left)) - max(1rem, env(safe-area-inset-right))))",
                            maxHeight: "min(28rem, calc(100dvh - max(1rem, env(safe-area-inset-top)) - 5rem - env(safe-area-inset-bottom)))",
                        }}
                        className="absolute right-0 top-full mt-2 flex origin-top-right flex-col overflow-hidden rounded-2xl border border-primary/35 bg-popover/95 shadow-2xl backdrop-blur-xl"
                        role="dialog"
                        aria-label="Search portfolio"
                    >
                            <div className="flex shrink-0 items-center gap-3 border-b border-border px-3 py-2">
                                <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                                <input
                                    ref={inputRef}
                                    role="combobox"
                                    aria-label="Search sections, case studies, and links"
                                    aria-autocomplete="list"
                                    aria-expanded="true"
                                    aria-controls="portfolio-search-results"
                                    aria-activedescendant={filtered[active] ? `search-option-${filtered[active].id}` : undefined}
                                    autoComplete="off"
                                    spellCheck={false}
                                    value={query}
                                    onChange={(e) => {
                                        setQuery(e.target.value);
                                        setActive(0);
                                    }}
                                    onKeyDown={onListKey}
                                    placeholder="Search the portfolio…"
                                    className="min-w-0 flex-1 bg-transparent py-2 text-base text-foreground placeholder:text-muted-foreground focus:outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={() => closePalette(true)}
                                    aria-label="Close search"
                                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            {filtered.length === 0 && <p role="status" className="px-4 py-6 text-center text-sm text-muted-foreground">No matches. Try a section or project name.</p>}
                            <ul ref={listRef} id="portfolio-search-results" role="listbox" aria-label="Search results" tabIndex={-1} className="min-h-0 overflow-y-auto overscroll-contain py-2">
                                {filtered.map((item, i) => {
                                    const Icon = item.icon;
                                    const isActive = i === active;
                                    return (
                                        <li key={item.id} role="presentation">
                                            <button
                                                id={`search-option-${item.id}`}
                                                role="option"
                                                aria-selected={isActive}
                                                tabIndex={-1}
                                                type="button"
                                                onMouseEnter={() => setActive(i)}
                                                onClick={() => runAction(item)}
                                                className={`flex min-h-11 w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                                                    isActive ? "bg-primary/10 text-foreground" : "text-foreground/80 hover:bg-primary/5"
                                                }`}
                                            >
                                                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md border ${
                                                    isActive ? "border-primary/40 bg-primary/10 text-primary" : "border-border bg-secondary/40 text-muted-foreground"
                                                }`}>
                                                    <Icon className="h-3.5 w-3.5" />
                                                </span>
                                                <span className="min-w-0 flex-1">
                                                    <span className="block">{item.label}</span>
                                                    {item.hint && (
                                                        <span className="block break-all text-[11px] text-muted-foreground">{item.hint}</span>
                                                    )}
                                                </span>
                                                <ArrowRight className={`h-3.5 w-3.5 shrink-0 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>

                            <div className="flex shrink-0 items-center justify-between gap-2 border-t border-border px-4 py-2 text-[11px] text-muted-foreground">
                                <span className="flex items-center gap-2">
                                    <kbd className="rounded border border-border bg-secondary/50 px-1 font-mono">↑</kbd>
                                    <kbd className="rounded border border-border bg-secondary/50 px-1 font-mono">↓</kbd>
                                    navigate
                                </span>
                                <span className="flex items-center gap-2">
                                    <kbd className="rounded border border-border bg-secondary/50 px-1 font-mono">↵</kbd>
                                    select
                                </span>
                                <span className="flex items-center gap-2">
                                    <kbd className="rounded border border-border bg-secondary/50 px-1 font-mono">esc</kbd>
                                    close
                                </span>
                            </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
