"use client";

import { useEffect, useRef } from "react";
import { renderCanvas } from "@/components/ui/canvas";

export function MouseTrail() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        if (canvasRef.current) return renderCanvas(canvasRef.current);
    }, []);

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
