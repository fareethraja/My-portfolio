"use client";

import { useState, useEffect, useRef } from "react";
import { SECTIONS } from "@/lib/constants";

export function useActiveSection() {
    const [activeSection, setActiveSection] = useState<string>("hero");
    const observers = useRef<Map<string, IntersectionObserverEntry>>(new Map());

    useEffect(() => {
        const observerCallback: IntersectionObserverCallback = (entries) => {
            entries.forEach((entry) => {
                observers.current.set(entry.target.id, entry);
            });

            // Find the visible section with the maximum intersection ratio
            let maxRatio = 0;
            let newActiveSection = "";

            observers.current.forEach((entry, id) => {
                if (entry.isIntersecting && entry.intersectionRatio > maxRatio) {
                    maxRatio = entry.intersectionRatio;
                    newActiveSection = id;
                }
            });

            if (newActiveSection) {
                setActiveSection(newActiveSection);
            }
        };

        const observerOptions = {
            root: null,
            rootMargin: "-10% 0px -10% 0px", // Slight margin to avoid edge cases
            threshold: Array.from({ length: 11 }, (_, i) => i * 0.1), // [0, 0.1, ... 1.0]
        };

        const observer = new IntersectionObserver(observerCallback, observerOptions);

        SECTIONS.forEach((section) => {
            const element = document.getElementById(section.id);
            if (element) {
                observer.observe(element);
            }
        });

        const handleScroll = () => {
            if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 50) {
                const lastSection = SECTIONS[SECTIONS.length - 1];
                if (lastSection) setActiveSection(lastSection.id);
            } else if (window.scrollY < 100) {
                setActiveSection("hero");
            }
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            observer.disconnect();
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return activeSection;
}
