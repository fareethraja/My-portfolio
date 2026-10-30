"use client"

import type { MouseEvent } from "react"
import { motion, useReducedMotion } from "framer-motion"
import Link from "next/link"
import { LucideIcon, Home, User, Briefcase, Cpu, Mail } from "lucide-react"
import { cn } from "@/lib/utils"

import { useActiveSection } from "@/hooks/use-active-section"

interface NavItem {
    name: string
    url: string
    icon: LucideIcon
}

interface NavBarProps {
    items?: NavItem[]
    className?: string
}

const defaultNavItems: NavItem[] = [
    { name: 'Home', url: '#hero', icon: Home },
    { name: 'About', url: '#about', icon: User },
    { name: 'Projects', url: '#projects', icon: Briefcase },
    { name: 'Skills', url: '#tools', icon: Cpu },
    { name: 'Contact', url: '#contact', icon: Mail }
];

export function NavBar({ items = defaultNavItems, className }: NavBarProps) {
    const { activeSection, scrollToSection } = useActiveSection()
    const reducedMotion = useReducedMotion()
    const activeId = activeSection === "timeline" ? "about" : activeSection
    const activeTab = items.find(item => item.url === `#${activeId}`)?.name

    const handleScroll = (event: MouseEvent<HTMLAnchorElement>, url: string) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || !url.startsWith("#")) return
        if (scrollToSection(url.slice(1))) event.preventDefault()
    }

    return (
        <div
            className={cn(
                "fixed bottom-0 sm:top-0 left-1/2 -translate-x-1/2 z-50 mb-6 sm:pt-6 pointer-events-none",
                className,
            )}
        >
            <div className="flex items-center gap-3 bg-popover/80 border border-border backdrop-blur-2xl py-1 px-1 rounded-full shadow-lg pointer-events-auto">
                {items.map((item) => {
                    const Icon = item.icon
                    const isActive = activeTab === item.name

                    return (
                        <Link
                            key={item.name}
                            href={item.url}
                            aria-label={item.name}
                            aria-current={isActive ? "location" : undefined}
                            onClick={(e) => handleScroll(e, item.url)}
                            className={cn(
                                "relative flex min-h-11 items-center cursor-pointer text-sm font-semibold px-6 py-2 rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                                "text-muted-foreground hover:text-foreground",
                                isActive && "text-foreground",
                            )}
                        >
                            <span className="hidden md:inline">{item.name}</span>
                            <span className="md:hidden">
                                <Icon size={18} strokeWidth={2.5} aria-hidden="true" />
                            </span>
                            {isActive && (
                                <motion.div
                                    layoutId="lamp"
                                    className="absolute inset-0 w-full bg-secondary rounded-full -z-10"
                                    initial={false}
                                    transition={reducedMotion ? { duration: 0 } : {
                                        type: "spring",
                                        stiffness: 300,
                                        damping: 30,
                                    }}
                                >
                                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-t-full">
                                        <div className="absolute w-12 h-6 bg-primary/20 rounded-full blur-md -top-2 -left-2" />
                                        <div className="absolute w-8 h-6 bg-primary/20 rounded-full blur-md -top-1" />
                                        <div className="absolute w-4 h-4 bg-primary/20 rounded-full blur-sm top-0 left-2" />
                                    </div>
                                </motion.div>
                            )}
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}
