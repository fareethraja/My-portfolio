"use client";

import { useEffect } from "react";

const FEEDBACK_DURATION_MS = 420;

export function useButtonFeedback() {
    useEffect(() => {
        const timers = new Map<HTMLButtonElement, number>();

        function acknowledgeClick(event: MouseEvent) {
            if (!(event.target instanceof Element)) return;
            const button = event.target.closest("button");
            if (!(button instanceof HTMLButtonElement) || button.disabled || !button.closest(".placement-desk-ui")) return;

            const previousTimer = timers.get(button);
            if (previousTimer) window.clearTimeout(previousTimer);

            button.classList.remove("pd-click-ack");
            void button.offsetWidth;
            button.classList.add("pd-click-ack");

            const timer = window.setTimeout(() => {
                button.classList.remove("pd-click-ack");
                timers.delete(button);
            }, FEEDBACK_DURATION_MS);
            timers.set(button, timer);
        }

        document.addEventListener("click", acknowledgeClick);
        return () => {
            document.removeEventListener("click", acknowledgeClick);
            timers.forEach((timer) => window.clearTimeout(timer));
        };
    }, []);
}