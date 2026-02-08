"use client";

import { useEffect } from "react";
import { renderCanvas } from "@/components/ui/canvas";

export function MouseTrail() {
    useEffect(() => {
        renderCanvas();
    }, []);

    return (
        <canvas
            className="hidden md:block pointer-events-none fixed inset-0 z-[5] opacity-30 dark:opacity-20"
            id="canvas"
            aria-hidden="true"
            style={{ pointerEvents: "none" }}
        />
    );
}
