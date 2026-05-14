"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

function isMacLike() {
    if (typeof navigator === "undefined") return false;
    return /mac|iphone|ipad|ipod/i.test(navigator.platform || navigator.userAgent || "");
}

function isLikelyDesktop() {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(min-width: 768px)").matches;
}

export function CommandPaletteHint() {
    const [show, setShow] = useState(false);
    const [mac, setMac] = useState(false);

    useEffect(() => {
        if (!isLikelyDesktop()) return;
        setMac(isMacLike());
        const showTimer = window.setTimeout(() => setShow(true), 1200);
        return () => window.clearTimeout(showTimer);
    }, []);

    useEffect(() => {
        if (!show) return;
        const dismissOnKey = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
                setShow(false);
            }
        };
        window.addEventListener("keydown", dismissOnKey);
        const auto = window.setTimeout(() => setShow(false), 8000);
        return () => {
            window.removeEventListener("keydown", dismissOnKey);
            window.clearTimeout(auto);
        };
    }, [show]);

    const dismiss = () => setShow(false);

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    key="cmdk-hint"
                    role="status"
                    aria-live="polite"
                    initial={{ opacity: 0, y: -16, scale: 0.94 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{
                        opacity: 0,
                        y: -10,
                        scale: 0.96,
                        transition: { duration: 0.24, ease: [0.32, 0.72, 0, 1] },
                    }}
                    transition={{ type: "spring", damping: 22, stiffness: 280, mass: 0.7 }}
                    className="fixed right-5 top-[3.6rem] z-[80] hidden max-w-xs md:block"
                >
                    {/* arrow / tail pointing up to the Search button */}
                    <div
                        aria-hidden
                        className="absolute -top-1.5 right-6 h-3 w-3 rotate-45 rounded-[3px] border-l border-t border-white/10 bg-zinc-950/90"
                    />
                    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/90 p-4 shadow-2xl backdrop-blur-xl">
                        <div
                            aria-hidden
                            className="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full bg-gradient-to-br from-violet-500 to-sky-500 opacity-30 blur-2xl"
                        />
                        <button
                            type="button"
                            onClick={dismiss}
                            aria-label="Dismiss hint"
                            className="absolute right-2 top-2 rounded-md p-1 text-white/40 transition hover:bg-white/5 hover:text-white"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                        <div className="relative pr-4">
                            <p className="font-display text-sm font-semibold text-foreground">
                                Try the search bar
                            </p>
                            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                                Click{" "}
                                <span className="font-jetbrains uppercase tracking-[0.18em] text-violet-300">
                                    Search
                                </span>{" "}
                                or press{" "}
                                <kbd className="mx-0.5 rounded border border-white/15 bg-white/5 px-1 py-0.5 font-mono text-[10px] text-white/70">
                                    {mac ? "⌘" : "Ctrl"}
                                </kbd>
                                <kbd className="mx-0.5 rounded border border-white/15 bg-white/5 px-1 py-0.5 font-mono text-[10px] text-white/70">
                                    K
                                </kbd>{" "}
                                to jump anywhere instantly.
                            </p>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
