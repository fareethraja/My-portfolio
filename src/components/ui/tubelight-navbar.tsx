/* eslint-disable */
"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
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
    const [activeTab, setActiveTab] = useState(items[0]?.name)
    const [isMobile, setIsMobile] = useState(false)
    const activeSection = useActiveSection()

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768)
        }

        handleResize()
        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    }, [])

    useEffect(() => {
        if (activeSection) {
            if (activeSection === 'timeline') {
                setActiveTab('About')
                return
            }

            const matchingItem = items.find(item => item.url === `#${activeSection}`)
            if (matchingItem) {
                setActiveTab(matchingItem.name)
            }
        }
    }, [activeSection, items])

    const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, url: string) => {
        e.preventDefault()
        const element = document.querySelector(url)
        if (element) {
            element.scrollIntoView({ behavior: "smooth" })
            setActiveTab(items.find(item => item.url === url)?.name || "")
        }
    }

    return (
        <div
            className={cn(
                "fixed bottom-0 sm:top-0 left-1/2 -translate-x-1/2 z-50 mb-6 sm:pt-6",
                className,
            )}
        >
            <div className="flex items-center gap-3 bg-white/70 dark:bg-black/70 border border-zinc-200 dark:border-zinc-800 backdrop-blur-2xl py-1 px-1 rounded-full shadow-lg">
                {items.map((item) => {
                    const Icon = item.icon
                    const isActive = activeTab === item.name

                    return (
                        <Link
                            key={item.name}
                            href={item.url}
                            onClick={(e) => handleScroll(e, item.url)}
                            className={cn(
                                "relative cursor-pointer text-sm font-semibold px-6 py-2 rounded-full transition-colors",
                                "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50",
                                isActive && "text-zinc-900 dark:text-zinc-50",
                            )}
                        >
                            <span className="hidden md:inline">{item.name}</span>
                            <span className="md:hidden">
                                <Icon size={18} strokeWidth={2.5} />
                            </span>
                            {isActive && (
                                <motion.div
                                    layoutId="lamp"
                                    className="absolute inset-0 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full -z-10"
                                    initial={false}
                                    transition={{
                                        type: "spring",
                                        stiffness: 300,
                                        damping: 30,
                                    }}
                                >
                                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-zinc-900 dark:bg-zinc-50 rounded-t-full">
                                        <div className="absolute w-12 h-6 bg-zinc-900/20 dark:bg-zinc-50/20 rounded-full blur-md -top-2 -left-2" />
                                        <div className="absolute w-8 h-6 bg-zinc-900/20 dark:bg-zinc-50/20 rounded-full blur-md -top-1" />
                                        <div className="absolute w-4 h-4 bg-zinc-900/20 dark:bg-zinc-50/20 rounded-full blur-sm top-0 left-2" />
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
