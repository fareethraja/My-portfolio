"use client";

import { AnimatedLetterText } from "@/components/ui/animated-letter-text";
import AnimatedAvailabilityButton from "@/components/ui/animated-availability-button";

export function Hero() {
  return (
    <section id="hero" aria-label="Hero section introducing Fareeth Raja" className="relative min-h-screen w-full overflow-hidden bg-background">
      <div className="animation-delay-8 animate-fadeIn mt-12 sm:mt-16 md:mt-20 flex flex-col items-center justify-center px-3 sm:px-4 text-center relative z-10">
        <div className="mb-6 sm:mb-10 mt-2 sm:mt-4 md:mt-20">
          <div className="px-1 sm:px-2">
            <div className="relative mx-auto h-full max-w-7xl p-4 sm:p-6 md:px-12 md:py-20">
              <h1 className="select-none px-2 sm:px-3 py-2 text-center text-lg xs:text-xl sm:text-3xl md:text-5xl lg:text-7xl font-bold leading-tight tracking-tight text-foreground">
                <span className="font-orbitron">Building the Future of</span> <br />
                <AnimatedLetterText text="Digital Products" className="font-oswald" />
              </h1>
              <div className="mt-4 sm:mt-6 flex justify-center">
                <AnimatedAvailabilityButton
                  labelIdle="Open to Work"
                  labelActive="Let's Connect!"
                  highlightHueDeg={142}
                  navigateTo="#contact"
                />
              </div>
            </div>
          </div>

          <h2 className="mt-6 sm:mt-8 text-lg sm:text-xl md:text-2xl lg:text-3xl font-medium text-foreground font-cormorant px-4">
            Welcome to my digital playground! I&#39;m{" "}
            <span className="text-primary font-bold">Fareeth Raja</span>
          </h2>

          <p className="mx-auto mb-12 sm:mb-16 mt-3 sm:mt-4 max-w-xl sm:max-w-2xl px-4 sm:px-6 text-sm sm:text-base md:text-lg text-muted-foreground md:max-w-4xl md:px-20 font-cormorant">
            I craft scalable systems, automate workflows, and build intelligent products that empower businesses to grow.
          </p>

        </div>
      </div>
    </section>
  );
};
