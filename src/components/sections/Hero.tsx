"use client";

import { motion } from "framer-motion";
import { ArrowDown, ArrowUpRight, FileText, Github, Linkedin, Mail, Sparkles, Zap } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import AnimatedAvailabilityButton from "@/components/ui/animated-availability-button";

const ROLES = [
  "Product Manager",
  "Full-Stack Engineer",
  "FinTech Builder",
  "AI Product Thinker",
  "Trading Tools",
  "Payments & Checkout",
  "Next.js · Go · MySQL",
];

const STATS = [
  { value: "Finverse", label: "Live FinTech super app", accent: "from-violet-500 to-fuchsia-500" },
  { value: "AI · Pay · Markets", label: "Stack I ship across", accent: "from-sky-500 to-cyan-400" },
  { value: "MBA + Economics", label: "Finance, marketing and product mind", accent: "from-emerald-500 to-teal-400" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.05 * i, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

function useAvailabilityLabel() {
  const [label, setLabel] = useState("Available");
  useEffect(() => {
    const now = new Date();
    const month = now.toLocaleString("en-US", { month: "short" });
    const year = now.getFullYear();
    setLabel(`Available · ${month} ${year}`);
  }, []);
  return label;
}

export function Hero() {
  const availabilityLabel = useAvailabilityLabel();
  return (
    <section
      id="hero"
      aria-label="Hero section introducing Fareeth Raja"
      className="relative w-full overflow-hidden bg-background flex items-start"
    >
      {/* Backdrop accents */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute -top-32 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-violet-500/10 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 h-[360px] w-[360px] rounded-full bg-sky-500/10 blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pt-32 pb-12 sm:px-6 sm:pt-36 md:px-10 md:pt-32 md:pb-16 lg:pt-36">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-8 lg:gap-12">
          {/* LEFT : headline column */}
          <div className="md:col-span-7">
            <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}>
              <span className="eyebrow" suppressHydrationWarning>
                {availabilityLabel}
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={1}
              className="font-display mt-5 text-[clamp(2rem,7vw,5rem)] leading-[1.05] tracking-[-0.04em] font-bold text-foreground text-balance"
            >
              Building the{" "}
              <span className="text-gradient-primary whitespace-nowrap">future</span> of{" "}
              <span className="relative inline-block whitespace-nowrap">
                <span className="text-gradient-accent">digital products.</span>
                <svg
                  aria-hidden
                  viewBox="0 0 300 12"
                  className="absolute -bottom-2 left-0 h-3 w-full text-emerald-400/70"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M2 8 C 60 2, 140 12, 220 4 S 296 6, 298 4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={2}
              className="mt-6 max-w-xl text-sm sm:text-base md:text-lg leading-relaxed text-muted-foreground"
            >
              I&apos;m{" "}
              <span className="font-semibold text-foreground">Fareeth Raja</span>, a Product
              Manager and full-stack product engineer shipping{" "}
              <span className="text-foreground">FinTech, AI chat, trading, payments,</span>{" "}
              and automation experiences that survive real users.
            </motion.p>

            {/* CTAs */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={3}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <AnimatedAvailabilityButton
                labelIdle="Open to Work"
                labelActive="Let's Connect!"
                highlightHueDeg={142}
                navigateTo="#contact"
              />
              <Link
                href="https://finverse.trade/"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.03] px-5 py-2.5 text-sm font-medium text-foreground backdrop-blur transition hover:border-white/30 hover:bg-white/[0.06]"
              >
                <Sparkles className="h-4 w-4 text-violet-400" />
                See Finverse live
                <ArrowUpRight className="h-4 w-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
              <motion.a
                href="/resume/fareeth-raja-resume-2026.pdf"
                download
                whileHover={{
                  rotate: [0, -2, 2, -1, 1, 0],
                  scale: 1.03,
                  transition: { duration: 0.5, ease: "easeInOut" },
                }}
                whileTap={{ scale: 0.97 }}
                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full border border-white/10 bg-white/[0.03] px-5 py-2.5 text-sm font-medium text-foreground backdrop-blur transition hover:border-white/25"
              >
                {/* soft gradient orb glow on hover, matching stat cards */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute -top-10 -right-10 h-24 w-24 rounded-full bg-gradient-to-br from-violet-500 to-sky-500 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-50"
                />
                {/* shimmer sweep */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-y-0 -left-full w-1/2 bg-gradient-to-r from-transparent via-white/15 to-transparent transition-all duration-700 group-hover:left-full"
                />
                <FileText className="relative h-4 w-4 text-violet-300" />
                <span className="relative">Resume</span>
                <ArrowDown className="relative h-4 w-4 text-muted-foreground transition group-hover:translate-y-0.5 group-hover:text-foreground" />
              </motion.a>
            </motion.div>

            {/* Socials */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={5}
              className="mt-7 flex items-center gap-3 text-muted-foreground"
            >
              <span className="font-jetbrains text-xs uppercase tracking-[0.18em]">Find me</span>
              <span className="h-px w-8 bg-border" />
              <Link
                href="https://github.com/fareethraja"
                target="_blank"
                aria-label="GitHub"
                className="rounded-full border border-white/10 p-2 transition hover:border-white/30 hover:text-foreground"
              >
                <Github className="h-4 w-4" />
              </Link>
              <Link
                href="https://www.linkedin.com/in/fareethraja/"
                target="_blank"
                aria-label="LinkedIn"
                className="rounded-full border border-white/10 p-2 transition hover:border-white/30 hover:text-foreground"
              >
                <Linkedin className="h-4 w-4" />
              </Link>
              <Link
                href="mailto:fareethraja.26.careers@gmail.com"
                aria-label="Email"
                className="rounded-full border border-white/10 p-2 transition hover:border-white/30 hover:text-foreground"
              >
                <Mail className="h-4 w-4" />
              </Link>
            </motion.div>
          </div>

          {/* RIGHT : stat cards column */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={3}
            className="md:col-span-5"
          >
            <div className="flex flex-col gap-3 sm:gap-4">
              {STATS.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.1, duration: 0.5 }}
                  whileHover={{
                    y: -6,
                    rotate: i % 2 === 0 ? -1.5 : 1.5,
                    scale: 1.02,
                    transition: { type: "spring", stiffness: 300, damping: 12 },
                  }}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5 backdrop-blur-sm transition hover:border-white/20"
                >
                  <div
                    className={`absolute -top-12 -right-12 h-32 w-32 rounded-full bg-gradient-to-br ${stat.accent} opacity-20 blur-2xl transition-opacity group-hover:opacity-50`}
                  />
                  <motion.div
                    aria-hidden
                    initial={{ x: "-150%" }}
                    whileHover={{ x: "150%" }}
                    transition={{ duration: 0.9, ease: "easeInOut" }}
                    className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                  />
                  <div className="relative">
                    <p className="font-display text-lg sm:text-xl md:text-2xl font-semibold tracking-tight text-foreground">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-xs sm:text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </motion.div>
              ))}

              {/* Now-shipping card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7, duration: 0.5 }}
                whileHover={{ y: -4, transition: { type: "spring", stiffness: 300, damping: 14 } }}
                className="rounded-2xl border border-emerald-400/20 bg-gradient-to-br from-emerald-500/10 to-transparent p-4 sm:p-5 backdrop-blur-sm"
              >
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                  </span>
                  <span className="font-jetbrains text-[10px] uppercase tracking-[0.2em] text-emerald-300">
                    Now shipping
                  </span>
                </div>
                <p className="mt-3 text-sm text-foreground">
                  Zeno AI, screeners, strategy backtesting, paper trading and checkout on{" "}
                  <Link
                    href="https://finverse.trade/"
                    target="_blank"
                    className="font-semibold underline decoration-emerald-400/40 underline-offset-4 hover:decoration-emerald-400"
                  >
                    finverse.trade
                  </Link>
                  .
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Roles marquee */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={5}
          className="mt-12 md:mt-16 lg:mt-20"
        >
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <Zap className="h-3.5 w-3.5 text-violet-400" />
            <span className="font-jetbrains uppercase tracking-[0.2em]">What I do</span>
            <span className="h-px flex-1 bg-border" />
          </div>
          <div className="relative mt-5 overflow-hidden">
            <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-16 bg-gradient-to-r from-background to-transparent" />
            <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-16 bg-gradient-to-l from-background to-transparent" />
            <div className="flex w-max animate-marquee gap-3">
              {[...ROLES, ...ROLES].map((role, i) => (
                <span
                  key={`${role}-${i}`}
                  className="font-display whitespace-nowrap rounded-full border border-white/10 bg-white/[0.02] px-5 py-2 text-sm text-muted-foreground"
                >
                  {role}
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Scroll cue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="mt-10 hidden justify-center lg:flex"
        >
          <Link
            href="#about"
            className="group flex flex-col items-center gap-2 text-xs text-muted-foreground transition hover:text-foreground"
          >
            <span className="font-jetbrains uppercase tracking-[0.2em]">Scroll</span>
            <span className="flex h-9 w-5 justify-center rounded-full border border-white/15 p-1">
              <motion.span
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                className="h-1.5 w-1 rounded-full bg-foreground/70"
              />
            </span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
