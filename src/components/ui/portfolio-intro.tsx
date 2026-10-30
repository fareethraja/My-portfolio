"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const GREETINGS = [
    { text: "Hello", lang: "en" },
    { text: "Bonjour", lang: "fr" },
    { text: "Hola", lang: "es" },
    { text: "नमस्ते", lang: "hi" },
    { text: "வணக்கம்", lang: "ta" },
];

const REVEAL_DELAY_MS = GREETINGS.length * 300 + 300;
const REVEAL_DURATION_MS = 800;
const FAILSAFE_MS = REVEAL_DELAY_MS + REVEAL_DURATION_MS + 600;

export function PortfolioIntro() {
    const [finished, setFinished] = useState(false);
    const dialogRef = useRef<HTMLDialogElement>(null);
    const finish = useCallback(() => setFinished(true), []);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (finished || !dialog) return;

        const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
        const root = document.documentElement;
        const previousOverflow = root.style.overflow;
        const previousGutter = root.style.scrollbarGutter;
        let locked = false;
        const fitViewport = () => {
            dialog.style.width = `${window.innerWidth}px`;
        };
        const frame = requestAnimationFrame(() => {
            if (preference.matches || getComputedStyle(dialog).visibility === "hidden") {
                finish();
                return;
            }
            root.style.scrollbarGutter = "stable";
            root.style.overflow = "hidden";
            locked = true;
            fitViewport();
            dialog.showModal();
        });
        const onPreferenceChange = () => {
            if (preference.matches) finish();
        };
        const timeout = window.setTimeout(finish, FAILSAFE_MS);
        preference.addEventListener("change", onPreferenceChange);
        window.addEventListener("resize", fitViewport);

        return () => {
            cancelAnimationFrame(frame);
            window.clearTimeout(timeout);
            preference.removeEventListener("change", onPreferenceChange);
            window.removeEventListener("resize", fitViewport);
            if (dialog.open) dialog.close();
            if (locked) {
                root.style.overflow = previousOverflow;
                root.style.scrollbarGutter = previousGutter;
            }
        };
    }, [finished, finish]);

    if (finished) return null;

    return (
        <dialog
            ref={dialogRef}
            className="portfolio-intro"
            style={{ animationDelay: `${FAILSAFE_MS}ms` }}
            aria-labelledby="portfolio-intro-title"
            aria-describedby="portfolio-intro-description"
            onCancel={(event) => {
                event.preventDefault();
                finish();
            }}
            onKeyDown={(event) => {
                if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }}
            onAnimationEnd={(event) => {
                if (event.animationName === "portfolio-intro-open-bottom" ||
                    event.animationName === "portfolio-intro-failsafe") finish();
            }}
        >
            <p id="portfolio-intro-title" className="sr-only">Welcome to Fareeth Raja&apos;s portfolio</p>
            <p id="portfolio-intro-description" className="sr-only">A short welcome animation. Skip to explore the portfolio.</p>
            <div
                aria-hidden="true"
                className="portfolio-intro-panel portfolio-intro-top"
                style={{ animationDelay: `${REVEAL_DELAY_MS}ms`, animationDuration: `${REVEAL_DURATION_MS}ms` }}
            />
            <div
                aria-hidden="true"
                className="portfolio-intro-panel portfolio-intro-bottom"
                style={{ animationDelay: `${REVEAL_DELAY_MS}ms`, animationDuration: `${REVEAL_DURATION_MS}ms` }}
            />
            <div
                aria-hidden="true"
                className="portfolio-intro-caption font-jetbrains"
                style={{ animationDelay: `${REVEAL_DELAY_MS - 300}ms` }}
            >
                Fareeth Raja / Product &amp; AI
            </div>
            <div aria-hidden="true" className="portfolio-intro-greetings font-display">
                {GREETINGS.map((greeting, index) => (
                    <span
                        key={greeting.lang}
                        lang={greeting.lang}
                        className="portfolio-intro-word"
                        style={{ animationDelay: `${120 + index * 300}ms` }}
                    >
                        <span className="portfolio-intro-dot" />
                        {greeting.text}
                    </span>
                ))}
            </div>
            <button type="button" className="portfolio-intro-skip font-jetbrains" onClick={finish}>
                Skip intro <span aria-hidden="true">&rarr;</span>
            </button>
        </dialog>
    );
}
