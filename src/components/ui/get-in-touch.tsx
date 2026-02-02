"use client";

import React, { useState, useRef } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

// --- Magnet Card Component ---
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MagnetCard = ({ children, className, onClick, href, target, rel, onMouseEnter, onMouseLeave, ...props }: any) => {
    const ref = useRef<HTMLAnchorElement>(null);

    const x = useMotionValue(0);
    const y = useMotionValue(0);

    // Smooth spring physics for the magnet effect
    const springConfig = { damping: 15, stiffness: 150, mass: 0.1 };
    const springX = useSpring(x, springConfig);
    const springY = useSpring(y, springConfig);

    const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // Calculate distance from center
        const distanceX = e.clientX - centerX;
        const distanceY = e.clientY - centerY;

        // Apply magnetic pull (adjust divisor for strength)
        x.set(distanceX / 10);
        y.set(distanceY / 10);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
        if (onMouseLeave) onMouseLeave();
    };

    return (
        <motion.a
            ref={ref}
            href={href}
            target={target}
            rel={rel}
            onMouseMove={handleMouseMove}
            onMouseEnter={onMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={onClick}
            style={{ x: springX, y: springY }}
            whileHover={{ scale: 1.02, y: -5 }} // Lift effect
            whileTap={{ scale: 0.95 }} // Click feedback
            className={className}
            {...props}
        >
            {children}
        </motion.a>
    );
};

import { useAnalytics } from '@/hooks/use-analytics';

export const ProfessionalConnect = () => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const { trackConnectClick } = useAnalytics();

    const projectPlatforms = [
        {
            name: 'LinkedIn',
            icon: (
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
            ),
            link: 'https://www.linkedin.com/in/fareethraja',
            label: 'Connect',
            color: 'hover:border-blue-500 hover:text-blue-400 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]'
        },
        {
            name: 'WhatsApp',
            icon: (
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
            ),
            link: 'https://wa.me/919159469088',
            label: 'Chat',
            color: 'hover:border-green-500 hover:text-green-400 hover:shadow-[0_0_20px_rgba(34,197,94,0.3)]'
        }
    ];

    const hiringPlatforms = [
        {
            name: 'Gmail',
            icon: (
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z" />
                </svg>
            ),
            link: 'mailto:fareethraja7@gmail.com',
            label: 'Email',
            color: 'hover:border-red-500 hover:text-red-400 hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]'
        },
        {
            name: 'Phone',
            icon: (
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
            ),
            link: 'tel:+919159469088',
            label: 'Call',
            color: 'hover:border-purple-500 hover:text-purple-400 hover:shadow-[0_0_20px_rgba(168,85,247,0.3)]'
        }
    ];

    return (
        <div className="w-full min-h-[80vh] flex flex-col items-center justify-center p-4 relative overflow-hidden">

            {/* Main Flex Container - Desktop: Row, Mobile: Column */}
            <div className="flex flex-col md:flex-row items-center justify-between w-full max-w-7xl relative z-50 space-y-12 md:space-y-0">

                {/* LEFT SIDE: Project / Collab */}
                <div className="w-full md:w-1/3 flex flex-col items-center md:items-start gap-6 order-2 md:order-1 mt-8 md:mt-0">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: false, amount: 0.2 }}
                        transition={{ duration: 0.5 }}
                        className="text-center md:text-left mb-4 pointer-events-none"
                    >
                        <h3 className="text-xl font-bold text-white mb-2">
                            Got a project in mind?
                        </h3>
                        <p className="text-zinc-400 text-sm">
                            Let&apos;s collaborate.
                        </p>
                    </motion.div>

                    <div className="flex flex-col gap-4 w-full max-w-xs pointer-events-auto">
                        {projectPlatforms.map((platform, index) => (
                            <MagnetCard
                                key={platform.name}
                                href={platform.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                initial={{ opacity: 0, x: -50, filter: 'blur(10px)' }}
                                whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                                viewport={{ once: false, amount: 0.2 }}
                                transition={{ duration: 0.6, delay: 0.1 + (index * 0.15), ease: "easeOut" }}
                                onMouseEnter={() => setHoveredIndex(index)}
                                onMouseLeave={() => setHoveredIndex(null)}
                                onClick={() => trackConnectClick(platform.name)} // Tracking
                                className={`flex items-center gap-4 p-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-300 ${platform.color} hover:bg-white/10 group cursor-pointer`}
                            >
                                <motion.div
                                    className="text-white/80 group-hover:text-white transition-colors"
                                    whileHover={{ rotate: 10, scale: 1.1 }}
                                >
                                    {platform.icon}
                                </motion.div>
                                <div className="flex flex-col">
                                    <span className="font-semibold text-white group-hover:translate-x-1 transition-transform">
                                        {platform.name}
                                    </span>
                                    <span className="text-xs text-zinc-500">
                                        {platform.label}
                                    </span>
                                </div>
                                <ArrowRight className="ml-auto w-4 h-4 text-white/30 group-hover:text-white group-hover:translate-x-1 transition-all" />
                            </MagnetCard>
                        ))}
                    </div>
                </div>


                {/* CENTER: Static Visuals */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: false, amount: 0.2 }}
                    transition={{ duration: 0.8 }}
                    // Pulse Effect when hoveredIndex is not null
                    animate={{
                        scale: hoveredIndex !== null ? 1.05 : 1,
                        filter: hoveredIndex !== null ? 'contrast(1.2)' : 'contrast(1)'
                    }}
                    className="w-full md:w-1/3 flex flex-col items-center justify-center order-1 md:order-2 mb-12 md:mb-0 pointer-events-none"
                >
                    <div className="relative pointer-events-none">
                        {/* Interactive Equalizer Ring */}
                        <motion.div
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] -z-10 mix-blend-screen overflow-visible"
                            animate={{
                                scale: hoveredIndex !== null ? 1.2 : 1,
                                opacity: hoveredIndex !== null ? 1 : 0.3,
                            }}
                            transition={{ duration: 0.5, ease: "circOut" }}
                        >
                            {/* Spinning Rings */}
                            <motion.div
                                className="absolute inset-0"
                                animate={{ rotate: 360 }}
                                transition={{ duration: hoveredIndex !== null ? 4 : 20, repeat: Infinity, ease: "linear" }}
                            >
                                <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
                                    <defs>
                                        <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#3b82f6" />
                                            <stop offset="50%" stopColor="#a855f7" />
                                            <stop offset="100%" stopColor="#ec4899" />
                                        </linearGradient>
                                    </defs>

                                    {/* Inner Glow Circle */}
                                    <circle cx="50" cy="50" r="30" fill="none" stroke="url(#ringGradient)" strokeWidth="1" strokeOpacity="0.5" />

                                    {/* Equalizer Bars (Dashed Ring) */}
                                    <circle cx="50" cy="50" r="40" fill="none" stroke="white" strokeWidth="4" strokeDasharray="4 6" strokeOpacity="0.2" />

                                    {/* Outer Tech Ring */}
                                    <circle cx="50" cy="50" r="48" fill="none" stroke="white" strokeWidth="0.5" strokeDasharray="10 10" strokeOpacity="0.3" />
                                </svg>
                            </motion.div>

                            {/* Counter-Rotating Ring (Active only) */}
                            <motion.div
                                className="absolute inset-0"
                                animate={{
                                    rotate: hoveredIndex !== null ? -360 : 0,
                                    opacity: hoveredIndex !== null ? 1 : 0
                                }}
                                transition={{
                                    rotate: { duration: 10, repeat: Infinity, ease: "linear" },
                                    opacity: { duration: 0.3 }
                                }}
                            >
                                <svg viewBox="0 0 100 100" className="w-full h-full">
                                    <circle cx="50" cy="50" r="44" fill="none" stroke="white" strokeWidth="2" strokeDasharray="2 8" strokeOpacity="0.4" />
                                </svg>
                            </motion.div>
                        </motion.div>


                        <h2 className="relative z-10 text-4xl md:text-6xl font-bold bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent text-center leading-tight">
                            Let&apos;s<br />Work
                        </h2>

                        {/* Curled Arrows SVG - Desktop Only */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 0.5 }}
                            viewport={{ once: false, amount: 0.2 }}
                            transition={{ duration: 1, delay: 0.5 }}
                            animate={{ opacity: hoveredIndex !== null ? 0.8 : 0.5 }}
                            className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[200px] -z-10"
                        >
                            {/* Left Arrow Curve */}
                            <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full text-zinc-600" viewBox="0 0 400 200" fill="none" stroke="currentColor" strokeWidth="2">
                                {/* Center to Left */}
                                <path d="M200 100 Q 100 100 50 150" strokeDasharray="5,5" />
                                <path d="M50 150 L 60 140 M 50 150 L 40 140" />

                                {/* Center to Right */}
                                <path d="M200 100 Q 300 100 350 150" strokeDasharray="5,5" />
                                <path d="M350 150 L 340 140 M 350 150 L 360 140" />
                            </svg>
                        </motion.div>

                        {/* Mobile Arrow (Down) */}
                        <div className="md:hidden mt-4 text-zinc-600 animate-bounce">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6 mx-auto">
                                <path d="M12 5v14M19 12l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </motion.div>


                {/* RIGHT SIDE: Hiring */}
                <div className="w-full md:w-1/3 flex flex-col items-center md:items-end gap-6 order-3 md:order-3">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: false, amount: 0.2 }}
                        transition={{ duration: 0.5 }}
                        className="text-center md:text-right mb-4 pointer-events-none"
                    >
                        <h3 className="text-xl font-bold text-white mb-2">
                            Ready to hire?
                        </h3>
                        <p className="text-zinc-400 text-sm">
                            Contact me directly.
                        </p>
                    </motion.div>

                    <div className="flex flex-col gap-4 w-full max-w-xs pointer-events-auto">
                        {hiringPlatforms.map((platform, index) => (
                            <MagnetCard
                                key={platform.name}
                                href={platform.link}
                                initial={{ opacity: 0, x: 50, filter: 'blur(10px)' }}
                                whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                                viewport={{ once: false, amount: 0.2 }}
                                transition={{ duration: 0.6, delay: 0.1 + (index * 0.15), ease: "easeOut" }}
                                onMouseEnter={() => setHoveredIndex(index + 10)} // Offset index to avoid conflict
                                onMouseLeave={() => setHoveredIndex(null)}
                                onClick={() => trackConnectClick(platform.name)} // Tracking
                                className={`flex flex-row-reverse items-center gap-4 p-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-300 ${platform.color} hover:bg-white/10 group cursor-pointer`}
                            >
                                <motion.div
                                    className="text-white/80 group-hover:text-white transition-colors"
                                    whileHover={{ rotate: -10, scale: 1.1 }}
                                >
                                    {platform.icon}
                                </motion.div>
                                <div className="flex flex-col items-end">
                                    <span className="font-semibold text-white group-hover:-translate-x-1 transition-transform">
                                        {platform.name}
                                    </span>
                                    <span className="text-xs text-zinc-500">
                                        {platform.label}
                                    </span>
                                </div>
                                <ArrowLeft className="mr-auto w-4 h-4 text-white/30 group-hover:text-white group-hover:-translate-x-1 transition-all" />
                            </MagnetCard>
                        ))}
                    </div>
                </div>

            </div>

            {/* Background Ambience */}
            <div className="absolute inset-0 pointer-events-none -z-10">
                <div className="absolute inset-0 bg-gradient-to-t from-black via-slate-900/50 to-transparent opacity-80" />
            </div>
        </div>
    );
};
