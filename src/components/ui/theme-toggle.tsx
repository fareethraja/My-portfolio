"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useRef } from "react";
import { flushSync } from "react-dom";

export function ThemeToggle() {
    const { resolvedTheme, setTheme } = useTheme();
    const transition = useRef<ViewTransition | null>(null);
    const animations = useRef<Animation[]>([]);
    const timer = useRef<number | null>(null);
    const sequence = useRef(0);
    const requestedTheme = useRef<string | null>(null);

    useEffect(() => {
        const dark = resolvedTheme ? resolvedTheme === "dark" : document.documentElement.classList.contains("dark");
        const color = dark ? "#0c0a10" : "#faf8fc";
        const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
        if (meta) meta.content = color;
    }, [resolvedTheme]);

    useEffect(() => () => {
        sequence.current++;
        animations.current.forEach(animation => animation.cancel());
        transition.current?.skipTransition();
        if (timer.current !== null) window.clearTimeout(timer.current);
        document.documentElement.removeAttribute("data-theme-transition");
    }, []);

    const switchTheme = () => {
        animations.current.forEach(animation => animation.cancel());
        animations.current = [];
        transition.current?.skipTransition();
        transition.current = null;
        if (timer.current !== null) window.clearTimeout(timer.current);
        const id = ++sequence.current;
        const root = document.documentElement;
        const next = (requestedTheme.current ?? resolvedTheme) === "dark" ? "light" : "dark";
        requestedTheme.current = next;
        const update = () => flushSync(() => setTheme(next));
        const finish = () => {
            if (sequence.current !== id) return;
            root.removeAttribute("data-theme-transition");
            animations.current.forEach(animation => animation.cancel());
            animations.current = [];
            transition.current = null;
            requestedTheme.current = null;
            timer.current = null;
        };
        const reportError = (error: unknown) => {
            if (error instanceof DOMException && error.name === "AbortError") return;
            console.error("Theme transition failed:", error);
        };
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            root.removeAttribute("data-theme-transition");
            update();
            finish();
            return;
        }
        if (typeof document.startViewTransition !== "function") {
            root.setAttribute("data-theme-transition", "fade");
            update();
            timer.current = window.setTimeout(finish, 520);
            return;
        }
        root.setAttribute("data-theme-transition", "dissolve");
        const current = document.startViewTransition(update);
        transition.current = current;
        void current.ready.then(() => {
            if (sequence.current !== id) return;
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                current.skipTransition();
                return;
            }
            animations.current = [
                root.animate({
                    opacity: [1, 1],
                    mixBlendMode: ["normal", "normal"],
                }, {
                    duration: 720,
                    fill: "both",
                    pseudoElement: "::view-transition-old(root)",
                }),
                root.animate({
                    opacity: [0, 1],
                    mixBlendMode: ["normal", "normal"],
                }, {
                    duration: 720,
                    easing: "cubic-bezier(0.76, 0, 0.24, 1)",
                    fill: "both",
                    pseudoElement: "::view-transition-new(root)",
                }),
            ];
        }).catch(reportError);
        void current.finished.then(finish, (error: unknown) => {
            reportError(error);
            finish();
        });
    };

    return (
        <button
            type="button"
            title="Switch light and dark theme"
            onClick={switchTheme}
            className="theme-switch fixed left-[max(1rem,env(safe-area-inset-left))] top-[max(1rem,env(safe-area-inset-top))] z-[70] touch-manipulation focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
            <span aria-hidden="true" className="theme-switch-thumb" />
            <Sun aria-hidden="true" className="theme-switch-icon theme-switch-sun" />
            <Moon aria-hidden="true" className="theme-switch-icon theme-switch-moon" />
            <span className="sr-only hidden dark:inline">Switch to light theme</span>
            <span className="sr-only dark:hidden">Switch to dark theme</span>
        </button>
    );
}
