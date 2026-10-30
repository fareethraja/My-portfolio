"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { SECTIONS } from "@/lib/constants";

export function useActiveSection() {
    const [activeSection, setActiveSection] = useState<string>("hero");
    const destination = useRef<number | null>(null);
    const settleTimer = useRef<number | null>(null);
    const requestUpdate = useRef<(() => void) | null>(null);

    useEffect(() => {
        const sections = SECTIONS.flatMap(({ id }) => {
            const element = document.getElementById(id);
            return element ? [{ id, element }] : [];
        });
        let frame: number | null = null;

        const release = () => {
            destination.current = null;
            if (settleTimer.current !== null) window.clearTimeout(settleTimer.current);
            settleTimer.current = null;
        };

        const update = () => {
            frame = null;
            if (destination.current !== null) {
                if (Math.abs(window.scrollY - destination.current) > 2) return;
                release();
            }
            if (!sections.length) return;

            const atBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
            const activationLine = Math.max(120, Math.min(200, window.innerHeight * 0.25));
            let current = sections[0].id;
            for (const section of sections) {
                if (section.element.getBoundingClientRect().top <= activationLine) current = section.id;
            }
            setActiveSection(atBottom ? sections[sections.length - 1].id : current);
        };

        const schedule = () => {
            if (frame === null) frame = requestAnimationFrame(update);
        };
        const interrupt = () => {
            release();
            schedule();
        };
        const onKeyDown = (event: KeyboardEvent) => {
            if (["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "].includes(event.key)) interrupt();
        };

        requestUpdate.current = schedule;
        schedule();
        window.addEventListener("scroll", schedule, { passive: true });
        window.addEventListener("resize", interrupt, { passive: true });
        window.addEventListener("wheel", interrupt, { passive: true });
        window.addEventListener("touchstart", interrupt, { passive: true });
        window.addEventListener("keydown", onKeyDown);
        window.addEventListener("scrollend", interrupt);

        return () => {
            release();
            if (frame !== null) cancelAnimationFrame(frame);
            requestUpdate.current = null;
            window.removeEventListener("scroll", schedule);
            window.removeEventListener("resize", interrupt);
            window.removeEventListener("wheel", interrupt);
            window.removeEventListener("touchstart", interrupt);
            window.removeEventListener("keydown", onKeyDown);
            window.removeEventListener("scrollend", interrupt);
        };
    }, []);

    const scrollToSection = useCallback((id: string) => {
        const element = document.getElementById(id);
        if (!element) {
            console.warn(`Navigation: section "${id}" is unavailable.`);
            return false;
        }
        const margin = parseFloat(getComputedStyle(element).scrollMarginTop) || 0;
        const top = element.getBoundingClientRect().top + window.scrollY - margin;
        destination.current = Math.max(0, Math.min(top, document.documentElement.scrollHeight - window.innerHeight));
        if (settleTimer.current !== null) window.clearTimeout(settleTimer.current);
        settleTimer.current = window.setTimeout(() => {
            destination.current = null;
            settleTimer.current = null;
            requestUpdate.current?.();
        }, 2500);
        setActiveSection(id);
        element.scrollIntoView({
            behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
            block: "start",
        });
        requestUpdate.current?.();
        return true;
    }, []);

    return { activeSection, scrollToSection };
}
