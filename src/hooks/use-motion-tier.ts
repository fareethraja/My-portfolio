"use client";

import { useEffect, useState } from "react";

export type MotionTier = "full" | "lite" | "reduced";

type NavigatorWithPerformanceHints = Navigator & {
    deviceMemory?: number;
    connection?: EventTarget & {
        effectiveType?: string;
        saveData?: boolean;
    };
};

function detectMotionTier(): MotionTier {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return "reduced";

    const navigatorWithHints = navigator as NavigatorWithPerformanceHints;
    const connection = navigatorWithHints.connection;
    const constrained =
        window.matchMedia("(max-width: 767px)").matches ||
        (navigatorWithHints.deviceMemory !== undefined && navigatorWithHints.deviceMemory <= 4) ||
        (navigator.hardwareConcurrency !== undefined && navigator.hardwareConcurrency <= 4) ||
        connection?.saveData === true ||
        connection?.effectiveType === "slow-2g" ||
        connection?.effectiveType === "2g";

    return constrained ? "lite" : "full";
}

export function useMotionTier(): MotionTier {
    const [motionTier, setMotionTier] = useState<MotionTier>("lite");

    useEffect(() => {
        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
        const narrowViewport = window.matchMedia("(max-width: 767px)");
        const navigatorWithHints = navigator as NavigatorWithPerformanceHints;
        const connection = navigatorWithHints.connection;
        const update = () => setMotionTier(detectMotionTier());

        update();
        reducedMotion.addEventListener("change", update);
        narrowViewport.addEventListener("change", update);
        connection?.addEventListener("change", update);

        return () => {
            reducedMotion.removeEventListener("change", update);
            narrowViewport.removeEventListener("change", update);
            connection?.removeEventListener("change", update);
        };
    }, []);

    return motionTier;
}