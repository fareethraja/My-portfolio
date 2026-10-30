"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const GREETINGS = [
    { text: "Hello", lang: "en" },
    { text: "Bonjour", lang: "fr" },
    { text: "Hola", lang: "es" },
    { text: "Ciao", lang: "it" },
    { text: "Hallo", lang: "de" },
    { text: "こんにちは", lang: "ja" },
    { text: "नमस्ते", lang: "hi" },
    { text: "வணக்கம்", lang: "ta" },
];

const HANDWRITING_MS = 1800;
const GREETING_MS = 420;
const REVEAL_DELAY_MS = HANDWRITING_MS + (GREETINGS.length - 1) * GREETING_MS + 120;
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
        let timeout = window.setTimeout(finish, FAILSAFE_MS);
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
            dialog.setAttribute("data-playing", "");
            window.clearTimeout(timeout);
            timeout = window.setTimeout(finish, FAILSAFE_MS);
        });
        const onPreferenceChange = () => {
            if (preference.matches) finish();
        };
        preference.addEventListener("change", onPreferenceChange);
        window.addEventListener("resize", fitViewport);

        return () => {
            cancelAnimationFrame(frame);
            window.clearTimeout(timeout);
            preference.removeEventListener("change", onPreferenceChange);
            window.removeEventListener("resize", fitViewport);
            if (dialog.open) dialog.close();
            dialog.removeAttribute("data-playing");
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
                    event.animationName === "portfolio-intro-failsafe" ||
                    event.animationName === "portfolio-intro-playing-failsafe") finish();
            }}
        >
            <p id="portfolio-intro-title" className="sr-only">Welcome to Fareeth Raja&apos;s portfolio</p>
            <p id="portfolio-intro-description" className="sr-only">A short welcome animation. Press Escape to explore the portfolio immediately.</p>
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
            <div aria-hidden="true" className="portfolio-intro-greetings font-display">
                {GREETINGS.map((greeting, index) => (
                    <span
                        key={greeting.lang}
                        lang={greeting.lang}
                        className={`portfolio-intro-word${index === 0 ? " portfolio-intro-handwriting" : ""}`}
                        style={{
                            animationDelay: `${index === 0 ? 0 : HANDWRITING_MS + (index - 1) * GREETING_MS}ms`,
                            animationDuration: `${index === 0 ? HANDWRITING_MS : GREETING_MS}ms`,
                        }}
                    >
                        {index === 0 ? (
                            <svg className="portfolio-intro-script" viewBox="0 0 460 240" fill="none" focusable="false">
                                <title>{greeting.text}</title>
                                <path
                                    className="portfolio-intro-ink"
                                    pathLength={1}
                                    stroke="currentColor"
                                    strokeWidth={9.5}
                                    strokeDasharray={1}
                                    strokeDashoffset={1}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M48 174 C75 157 98 115 106 76 C112 46 95 36 83 63 C68 98 72 147 67 178 C80 139 103 124 118 139 C133 154 112 186 135 183 C150 182 173 162 178 148 C184 134 165 129 153 145 C131 173 153 194 180 179 C207 161 233 106 235 67 C237 41 218 35 207 65 C192 106 191 158 199 177 C207 196 227 177 240 162 C264 134 286 91 283 59 C279 34 259 48 251 78 C240 115 240 158 250 178 C261 194 282 177 294 163 C309 138 342 128 352 148 C361 168 343 192 323 183 C302 174 314 137 338 137 C354 137 358 155 373 157 C387 159 400 153 413 144"
                                />
                            </svg>
                        ) : (
                            <>
                                <span className="portfolio-intro-dot" />
                                {greeting.text}
                            </>
                        )}
                    </span>
                ))}
            </div>
        </dialog>
    );
}
