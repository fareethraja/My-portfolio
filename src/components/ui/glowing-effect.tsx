"use client";

import { memo, useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { animate, useReducedMotion } from "motion/react";

type PointerPosition = { x: number; y: number };
const pointerSubscribers = new Set<(position: PointerPosition) => void>();
let pointerPosition: PointerPosition | null = null;
let pointerFrame: number | null = null;

function schedulePointerUpdate() {
    if (pointerFrame !== null || !pointerPosition || document.hidden) return;
    pointerFrame = requestAnimationFrame(() => {
        pointerFrame = null;
        if (pointerPosition) {
            for (const subscriber of pointerSubscribers) subscriber(pointerPosition);
        }
    });
}

function handlePointerMove(event: PointerEvent) {
    if (event.pointerType === "touch") return;
    pointerPosition = { x: event.clientX, y: event.clientY };
    schedulePointerUpdate();
}

function subscribePointer(subscriber: (position: PointerPosition) => void) {
    if (pointerSubscribers.size === 0) {
        document.addEventListener("pointermove", handlePointerMove, { passive: true });
        window.addEventListener("scroll", schedulePointerUpdate, { passive: true });
        window.addEventListener("resize", schedulePointerUpdate, { passive: true });
    }
    pointerSubscribers.add(subscriber);
    return () => {
        pointerSubscribers.delete(subscriber);
        if (pointerSubscribers.size === 0) {
            document.removeEventListener("pointermove", handlePointerMove);
            window.removeEventListener("scroll", schedulePointerUpdate);
            window.removeEventListener("resize", schedulePointerUpdate);
            if (pointerFrame !== null) cancelAnimationFrame(pointerFrame);
            pointerFrame = null;
            pointerPosition = null;
        }
    };
}

interface GlowingEffectProps {
    blur?: number;
    inactiveZone?: number;
    proximity?: number;
    spread?: number;
    variant?: "default" | "white";
    glow?: boolean;
    className?: string;
    disabled?: boolean;
    movementDuration?: number;
    borderWidth?: number;
}
const GlowingEffect = memo(
    ({
        blur = 0,
        inactiveZone = 0.7,
        proximity = 0,
        spread = 20,
        variant = "default",
        glow = false,
        className,
        movementDuration = 0.35,
        borderWidth = 1,
        disabled = true,
    }: GlowingEffectProps) => {
        const containerRef = useRef<HTMLDivElement>(null);
        const isVisible = useRef(false);
        const activeAnimation = useRef<ReturnType<typeof animate> | null>(null);
        const reducedMotion = useReducedMotion();

        const handleMove = useCallback(
            ({ x: mouseX, y: mouseY }: PointerPosition) => {
                    const element = containerRef.current;
                    if (!element || !isVisible.current) return;

                    const { left, top, width, height } = element.getBoundingClientRect();

                    const center = [left + width * 0.5, top + height * 0.5];
                    const distanceFromCenter = Math.hypot(
                        mouseX - center[0],
                        mouseY - center[1]
                    );
                    const inactiveRadius = 0.5 * Math.min(width, height) * inactiveZone;

                    if (distanceFromCenter < inactiveRadius) {
                        element.style.setProperty("--active", "0");
                        activeAnimation.current?.stop();
                        return;
                    }

                    const isActive =
                        mouseX > left - proximity &&
                        mouseX < left + width + proximity &&
                        mouseY > top - proximity &&
                        mouseY < top + height + proximity;

                    element.style.setProperty("--active", isActive ? "1" : "0");

                    activeAnimation.current?.stop();
                    if (!isActive) return;

                    const currentAngle =
                        parseFloat(element.style.getPropertyValue("--start")) || 0;
                    const targetAngle =
                        (180 * Math.atan2(mouseY - center[1], mouseX - center[0])) /
                        Math.PI +
                        90;

                    const angleDiff = ((targetAngle - currentAngle) % 360 + 540) % 360 - 180;
                    const newAngle = currentAngle + angleDiff;

                    activeAnimation.current = animate(currentAngle, newAngle, {
                        duration: movementDuration,
                        ease: [0.16, 1, 0.3, 1],
                        onUpdate: (value) => {
                            element.style.setProperty("--start", String(value));
                        },
                    });
            },
            [inactiveZone, proximity, movementDuration]
        );

        useEffect(() => {
            const element = containerRef.current;
            if (disabled || reducedMotion || !element) return;

            const observer = new IntersectionObserver(([entry]) => {
                isVisible.current = entry.isIntersecting;
                if (!entry.isIntersecting) {
                    element.style.setProperty("--active", "0");
                    activeAnimation.current?.stop();
                } else {
                    schedulePointerUpdate();
                }
            }, {
                rootMargin: `${proximity}px`,
            });
            observer.observe(element);
            const unsubscribe = subscribePointer(handleMove);

            return () => {
                unsubscribe();
                observer.disconnect();
                isVisible.current = false;
                activeAnimation.current?.stop();
                element.style.setProperty("--active", "0");
            };
        }, [handleMove, disabled, reducedMotion, proximity]);

        return (
            <>
                <div
                    className={cn(
                        "pointer-events-none absolute -inset-px hidden rounded-[inherit] border opacity-0 transition-opacity",
                        glow && "opacity-100",
                        variant === "white" && "border-white",
                        disabled && "!block"
                    )}
                />
                <div
                    ref={containerRef}
                    style={
                        {
                            "--blur": `${blur}px`,
                            "--spread": spread,
                            "--start": "0",
                            "--active": "0",
                            "--glowingeffect-border-width": `${borderWidth}px`,
                            "--repeating-conic-gradient-times": "5",
                            "--gradient":
                                variant === "white"
                                    ? `repeating-conic-gradient(
                  from 236.84deg at 50% 50%,
                  var(--black),
                  var(--black) calc(25% / var(--repeating-conic-gradient-times))
                )`
                                    : `radial-gradient(circle, #ff0080 10%, #ff008000 20%),
                radial-gradient(circle at 40% 40%, #ffaa40 5%, #ffaa4000 15%),
                radial-gradient(circle at 60% 60%, #00ff80 10%, #00ff8000 20%), 
                radial-gradient(circle at 40% 60%, #00bfff 10%, #00bfff00 20%),
                repeating-conic-gradient(
                  from 236.84deg at 50% 50%,
                  #ff0080 0%,
                  #ffaa40 calc(25% / var(--repeating-conic-gradient-times)),
                  #00ff80 calc(50% / var(--repeating-conic-gradient-times)), 
                  #00bfff calc(75% / var(--repeating-conic-gradient-times)),
                  #ff0080 calc(100% / var(--repeating-conic-gradient-times))
                )`,
                        } as React.CSSProperties
                    }
                    className={cn(
                        "pointer-events-none absolute inset-0 rounded-[inherit] opacity-100 transition-opacity",
                        glow && "opacity-100",
                        blur > 0 && "blur-[var(--blur)] ",
                        className,
                        disabled && "!hidden"
                    )}
                >
                    <div
                        className={cn(
                            "glow",
                            "rounded-[inherit]",
                            'after:content-[""] after:rounded-[inherit] after:absolute after:inset-[calc(-1*var(--glowingeffect-border-width))]',
                            "after:[border:var(--glowingeffect-border-width)_solid_transparent]",
                            "after:[background:var(--gradient)] after:[background-attachment:fixed]",
                            "after:opacity-[var(--active)] after:transition-opacity after:duration-300",
                            "after:[mask-clip:padding-box,border-box]",
                            "after:[mask-composite:intersect]",
                            "after:[mask-image:linear-gradient(#0000,#0000),conic-gradient(from_calc((var(--start)-var(--spread))*1deg),#00000000_0deg,#fff,#00000000_calc(var(--spread)*2deg))]"
                        )}
                    />
                </div>
            </>
        );
    }
);

GlowingEffect.displayName = "GlowingEffect";

export { GlowingEffect };
