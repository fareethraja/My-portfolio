"use client";

import * as React from "react";
import { useState } from "react";
import clsx from "clsx";

export type AnimatedAvailabilityButtonProps = {
  className?: string;
  labelIdle?: string;
  labelActive?: string;
  highlightHueDeg?: number;
  navigateTo?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  id?: string;
  ariaLabel?: string;
};

export default function AnimatedAvailabilityButton({
  className,
  labelIdle = "Open to Work",
  labelActive = "Let's Connect",
  highlightHueDeg = 142,
  navigateTo = "#contact",
  type = "button",
  disabled = false,
  id,
  ariaLabel,
}: AnimatedAvailabilityButtonProps) {
  const [isActive, setIsActive] = useState(false);

  const handleClick = () => {
    if (!isActive) {
      setIsActive(true);
    } else {
      if (navigateTo.startsWith("#")) {
        const element = document.querySelector(navigateTo);
        element?.scrollIntoView({ behavior: "smooth" });
      } else {
        window.location.href = navigateTo;
      }
    }
  };

  return (
    <div className={clsx("relative inline-block", className)} id={id}>
      <button
        type={type}
        aria-label={ariaLabel || (isActive ? labelActive : labelIdle)}
        disabled={disabled}
        onClick={handleClick}
        className={clsx(
          "ui-anim-btn",
          "relative flex items-center justify-center cursor-pointer select-none",
          "rounded-3xl px-6 py-3 min-w-[180px]",
          "bg-[hsl(var(--background))] text-[hsl(var(--foreground))]",
          "border border-[hsl(var(--border))]/20",
          "shadow-[inset_0px_1px_1px_rgba(255,255,255,0.2),inset_0px_2px_2px_rgba(255,255,255,0.15),inset_0px_4px_4px_rgba(255,255,255,0.1),inset_0px_8px_8px_rgba(255,255,255,0.05),inset_0px_16px_16px_rgba(255,255,255,0.05),0_-1px_1px_rgba(0,0,0,0.02),0_-2px_2px_rgba(0,0,0,0.03),0_-4px_4px_rgba(0,0,0,0.05),0_-8px_8px_rgba(0,0,0,0.06),0_-16px_16px_rgba(0,0,0,0.08)]",
          "transition-all duration-400"
        )}
        style={
          {
            ["--highlight-hue" as string]: `${highlightHueDeg}deg`,
          } as React.CSSProperties
        }
      >
        {/* Pulsing dot */}
        <span className="relative flex h-3 w-3 items-center justify-center mr-3 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75"></span>
          <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
        </span>
        
        <div className="relative flex items-center justify-center h-5 overflow-hidden">
          <span
            className={clsx(
              "whitespace-nowrap text-sm font-medium transition-all duration-500 ease-out",
              isActive 
                ? "opacity-0 -translate-y-4 absolute" 
                : "opacity-100 translate-y-0"
            )}
          >
            {labelIdle}
          </span>
          <span
            className={clsx(
              "whitespace-nowrap text-sm font-medium transition-all duration-500 ease-out",
              isActive 
                ? "opacity-100 translate-y-0" 
                : "opacity-0 translate-y-4 absolute"
            )}
          >
            {labelActive}
          </span>
        </div>
      </button>
      <style jsx>{`
        .ui-anim-btn {
          --padding: 4px;
          --radius: 24px;
          --transition: 0.4s;
          --highlight: hsl(var(--highlight-hue), 100%, 70%);
          --highlight-50: hsla(var(--highlight-hue), 100%, 70%, 0.5);
          --highlight-30: hsla(var(--highlight-hue), 100%, 70%, 0.3);
          --highlight-20: hsla(var(--highlight-hue), 100%, 70%, 0.2);
          --highlight-80: hsla(var(--highlight-hue), 100%, 70%, 0.8);
        }

        .ui-anim-btn::before {
          content: "";
          position: absolute;
          top: calc(0px - var(--padding));
          left: calc(0px - var(--padding));
          width: calc(100% + var(--padding) * 2);
          height: calc(100% + var(--padding) * 2);
          border-radius: calc(var(--radius) + var(--padding));
          pointer-events: none;
          background-image: linear-gradient(0deg, #0004, #000a);
          z-index: -1;
          transition: box-shadow var(--transition), filter var(--transition);
          box-shadow:
            0 -8px 8px -6px #0000 inset,
            0 -16px 16px -8px #00000000 inset,
            1px 1px 1px #fff2,
            2px 2px 2px #fff1,
            -1px -1px 1px #0002,
            -2px -2px 2px #0001;
        }

        .ui-anim-btn::after {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          pointer-events: none;
          background-image: linear-gradient(0deg, #fff, var(--highlight), var(--highlight-50), 8%, transparent);
          background-position: 0 0;
          opacity: 0;
          transition: opacity var(--transition), filter var(--transition);
        }

        /* Hover */
        .ui-anim-btn:hover {
          border-color: hsla(var(--highlight-hue), 100%, 80%, 0.4);
        }
        .ui-anim-btn:hover::before {
          box-shadow:
            0 -8px 8px -6px #fffa inset,
            0 -16px 16px -8px var(--highlight-30) inset,
            1px 1px 1px #fff2,
            2px 2px 2px #fff1,
            -1px -1px 1px #0002,
            -2px -2px 2px #0001;
        }
        .ui-anim-btn:hover::after {
          opacity: 1;
          -webkit-mask-image: linear-gradient(0deg, #fff, transparent);
          mask-image: linear-gradient(0deg, #fff, transparent);
        }

        /* Active */
        .ui-anim-btn:active {
          border-color: hsla(var(--highlight-hue), 100%, 80%, 0.7);
          background-color: hsla(var(--highlight-hue), 50%, 20%, 0.5);
        }
        .ui-anim-btn:active::before {
          box-shadow:
            0 -8px 12px -6px #fffa inset,
            0 -16px 16px -8px var(--highlight-80) inset,
            1px 1px 1px #fff4,
            2px 2px 2px #fff2,
            -1px -1px 1px #0002,
            -2px -2px 2px #0001;
        }
        .ui-anim-btn:active::after {
          opacity: 1;
          -webkit-mask-image: linear-gradient(0deg, #fff, transparent);
          mask-image: linear-gradient(0deg, #fff, transparent);
          filter: brightness(200%);
        }

        /* Disabled */
        .ui-anim-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
