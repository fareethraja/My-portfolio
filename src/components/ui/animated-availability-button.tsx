"use client";

import { useEffect, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import clsx from "clsx";

export type AnimatedAvailabilityButtonProps = {
  className?: string;
  labelIdle?: string;
  labelActive?: string;
  icon?: LucideIcon;
  navigateTo?: string;
  href?: string;
  download?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  id?: string;
  ariaLabel?: string;
};

export default function AnimatedAvailabilityButton({
  className,
  labelIdle = "Open to Work",
  labelActive = "Let's Connect",
  icon: Icon,
  navigateTo = "#contact",
  href,
  download,
  type = "button",
  disabled = false,
  id,
  ariaLabel,
}: AnimatedAvailabilityButtonProps) {
  const [isActive, setIsActive] = useState(false);
  const pointerFrame = useRef<number | null>(null);
  const pointerPosition = useRef({ x: 0, y: 0 });
  const pointerMedia = useRef<MediaQueryList | null>(null);
  const Element = href ? "a" : "button";

  useEffect(() => () => {
    if (pointerFrame.current !== null) cancelAnimationFrame(pointerFrame.current);
  }, []);

  const handleClick = () => {
    if (navigateTo.startsWith("#")) {
      const element = document.querySelector(navigateTo);
      element?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    } else {
      window.location.href = navigateTo;
    }
  };

  return (
    <div className={clsx("relative inline-block", className)} id={id}>
      <Element
        href={href}
        download={download}
        type={href ? undefined : type}
        aria-label={ariaLabel || labelIdle}
        disabled={href ? undefined : disabled}
        aria-disabled={disabled || undefined}
        onClick={(event) => {
          if (disabled) {
            event.preventDefault();
            return;
          }
          if (!href) handleClick();
        }}
        onPointerEnter={() => {
          if (!disabled) setIsActive(true);
          pointerMedia.current ??= window.matchMedia("(hover: hover) and (prefers-reduced-motion: no-preference)");
        }}
        onPointerMove={(event) => {
          if (disabled || event.pointerType !== "mouse" || !pointerMedia.current?.matches) return;
          pointerPosition.current = { x: event.clientX, y: event.clientY };
          if (pointerFrame.current !== null) return;
          const element = event.currentTarget;
          pointerFrame.current = requestAnimationFrame(() => {
            pointerFrame.current = null;
            const rect = element.getBoundingClientRect();
            const x = Math.max(0, Math.min(1, (pointerPosition.current.x - rect.left) / rect.width));
            const y = Math.max(0, Math.min(1, (pointerPosition.current.y - rect.top) / rect.height));
            element.style.setProperty("--pointer-x", `${x * 100}%`);
            element.style.setProperty("--pointer-y", `${y * 100}%`);
            element.style.setProperty("--tilt-x", `${(0.5 - y) * 4}deg`);
            element.style.setProperty("--tilt-y", `${(x - 0.5) * 4}deg`);
          });
        }}
        onPointerLeave={(event) => {
          setIsActive(false);
          if (pointerFrame.current !== null) cancelAnimationFrame(pointerFrame.current);
          pointerFrame.current = null;
          event.currentTarget.style.setProperty("--tilt-x", "0deg");
          event.currentTarget.style.setProperty("--tilt-y", "0deg");
        }}
        onFocus={() => setIsActive(true)}
        onBlur={() => setIsActive(false)}
        className={clsx(
          "ui-anim-btn",
          "relative isolate flex items-center justify-center cursor-pointer select-none",
          "min-h-[52px] min-w-[180px] gap-3 rounded-full px-6 py-3 text-foreground",
          "touch-manipulation"
        )}
      >
        {Icon ? (
          <Icon aria-hidden="true" className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
        ) : (
          <span aria-hidden="true" className="flex h-4 w-4 shrink-0 items-center justify-center">
            <span className="h-2 w-2 rounded-full bg-emerald-700 ring-4 ring-emerald-600/10 dark:bg-emerald-300 dark:ring-emerald-300/10" />
          </span>
        )}
        
        <div className="relative grid h-5 place-items-center overflow-hidden">
          <span
            className={clsx(
              "[grid-area:1/1] whitespace-nowrap text-sm font-medium transition-[opacity,transform] duration-300 ease-out",
              isActive 
                ? "opacity-0 -translate-y-4"
                : "opacity-100 translate-y-0"
            )}
          >
            {labelIdle}
          </span>
          <span
            className={clsx(
              "[grid-area:1/1] whitespace-nowrap text-sm font-medium transition-[opacity,transform] duration-300 ease-out",
              isActive 
                ? "opacity-100 translate-y-0" 
                : "opacity-0 translate-y-4"
            )}
          >
            {labelActive}
          </span>
        </div>
      </Element>
      <style jsx global>{`
        .ui-anim-btn {
          border: 1px solid hsl(var(--foreground) / 0.35);
          background: hsl(var(--background) / 0.5);
          -webkit-backdrop-filter: blur(12px);
          backdrop-filter: blur(12px);
          box-shadow: inset 0 2px 3px rgb(255 255 255 / 0.85),
            inset 0 -2px 4px hsl(var(--foreground) / 0.15),
            inset 2px 0 4px rgb(255 255 255 / 0.45),
            0 6px 14px hsl(var(--glass-shadow) / 0.16),
            0 1px 3px hsl(var(--glass-shadow) / 0.12);
          transform: perspective(800px) rotateX(var(--tilt-x, 0deg))
            rotateY(var(--tilt-y, 0deg)) translateY(var(--lift, 0px)) scale(var(--press, 1));
          transition: transform 360ms cubic-bezier(0.22, 1, 0.36, 1),
            border-color 240ms ease, background-color 240ms ease;
        }

        .dark .ui-anim-btn {
          border-color: hsl(var(--foreground) / 0.4);
          background: linear-gradient(180deg, rgb(255 255 255 / 0.11), rgb(255 255 255 / 0.025)),
            hsl(var(--background) / 0.65);
          box-shadow: inset 0 2px 3px rgb(255 255 255 / 0.32),
            inset 0 -2px 4px rgb(0 0 0 / 0.5),
            inset 2px 0 4px rgb(255 255 255 / 0.09),
            0 6px 14px rgb(0 0 0 / 0.3),
            0 1px 3px rgb(0 0 0 / 0.25);
        }

        .ui-anim-btn::before {
          content: "";
          position: absolute;
          inset: 1px;
          border-radius: inherit;
          pointer-events: none;
          background: radial-gradient(ellipse at var(--pointer-x, 50%) var(--pointer-y, 20%),
            rgb(255 255 255 / 0.55), transparent 65%);
          opacity: 0;
          z-index: -1;
          transition: opacity 360ms ease;
        }

        .dark .ui-anim-btn::before {
          background: radial-gradient(ellipse at var(--pointer-x, 50%) var(--pointer-y, 20%),
            rgb(255 255 255 / 0.16), transparent 65%);
        }

        .ui-anim-btn::after {
          content: "";
          position: absolute;
          inset: 2px;
          border: 1px solid rgb(255 255 255 / 0.24);
          border-radius: inherit;
          background: linear-gradient(180deg, rgb(255 255 255 / 0.2), transparent 35%, transparent 75%, rgb(255 255 255 / 0.08));
          pointer-events: none;
          z-index: -1;
        }

        @media (hover: hover) {
          .ui-anim-btn:hover:not(:disabled):not([aria-disabled="true"]) {
            --lift: -2px;
          }
          .ui-anim-btn:hover:not(:disabled):not([aria-disabled="true"])::before {
            opacity: 1;
          }
        }

        .ui-anim-btn:focus-visible::before {
          opacity: 1;
        }

        .ui-anim-btn:active:not(:disabled):not([aria-disabled="true"]) {
          --lift: 0px;
          --press: 0.975;
        }

        .ui-anim-btn:disabled,
        .ui-anim-btn[aria-disabled="true"] {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .ui-anim-btn:focus-visible {
          outline: 2px solid hsl(var(--ring));
          outline-offset: 4px;
        }

        @supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
          .ui-anim-btn {
            background: hsl(var(--card));
          }
          .dark .ui-anim-btn {
            background: hsl(var(--secondary));
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .ui-anim-btn {
            transform: none !important;
          }
        }
      `}</style>
    </div>
  );
}
