"use client";

import { useEffect, useRef } from 'react';
import { trackEvent } from '@/lib/analytics';
import { usePathname } from 'next/navigation';

export const useAnalytics = () => {
    const pathname = usePathname();
    const hasScrolledRef = useRef(false);

    // Track Page Views
    useEffect(() => {
        trackEvent('page_view', { path: pathname });
    }, [pathname]);

    // Track Scroll Depth (90%)
    useEffect(() => {
        const handleScroll = () => {
            if (hasScrolledRef.current) return;

            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight;
            const winHeight = window.innerHeight;
            const scrollPercent = (scrollTop + winHeight) / docHeight;

            if (scrollPercent > 0.9) {
                trackEvent('scroll_depth', { depth: '90%' });
                hasScrolledRef.current = true;
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [pathname]);

    return {
        trackConnectClick: (platform: string) => trackEvent('connect_click', { platform }),
        trackProjectClick: (project: string) => trackEvent('project_demo_click', { project }),
    };
};
