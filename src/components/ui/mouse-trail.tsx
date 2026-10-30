"use client";

import { useEffect, useRef } from "react";
import { renderCanvas } from "@/components/ui/canvas";
import { useTheme } from "next-themes";

export function MouseTrail() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { resolvedTheme } = useTheme();
    useEffect(() => {
        if (canvasRef.current && resolvedTheme) return renderCanvas(canvasRef.current, resolvedTheme === "light");
    }, [resolvedTheme]);

    return (
        <canvas
            ref={canvasRef}
            className="hidden md:block pointer-events-none fixed inset-0 z-[5] opacity-30 dark:opacity-20"
            id="canvas"
            aria-hidden="true"
            style={{ pointerEvents: "none" }}
        />
    );
}
