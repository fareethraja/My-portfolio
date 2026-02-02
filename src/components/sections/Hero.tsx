"use client";

import Link from "next/link";
import { AnimatedLetterText } from "@/components/ui/animated-letter-text";

export function Hero() {
  return (
    <section id="hero" className="relative min-h-screen w-full overflow-hidden bg-background">
      <div className="animation-delay-8 animate-fadeIn mt-20 flex flex-col items-center justify-center px-4 text-center md:mt-20 relative z-10">
        <div className="mb-10 mt-4 md:mt-20">
          <div className="px-2">
            <div className="relative mx-auto h-full max-w-7xl p-6 md:px-12 md:py-20">
              <h1 className="flex flex-col items-center justify-center select-none px-3 py-2 text-center text-4xl font-semibold leading-tight tracking-tight md:text-8xl lg:text-8xl text-foreground">
                Building the Future of <br />
                <AnimatedLetterText text="Digital Products" />
              </h1>
              <div className="flex items-center justify-center gap-2 mt-4">
                <span className="relative flex h-3 w-3 items-center justify-center">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
                </span>
                <p className="text-sm font-medium text-green-500">Available for new opportunities</p>
              </div>
            </div>
          </div>

          <h1 className="mt-8 text-2xl md:text-3xl font-medium text-foreground">
            Welcome to my digital playground! I&#39;m{" "}
            <span className="text-primary font-bold">Fareeth Raja</span>
          </h1>

          <p className="md:text-lg mx-auto mb-16 mt-4 max-w-2xl px-6 text-sm text-muted-foreground sm:px-6 md:max-w-4xl md:px-20">
            I craft scalable systems, automate workflows, and build intelligent products that empower businesses to grow.
          </p>

        </div>
      </div>
    </section>
  );
};
