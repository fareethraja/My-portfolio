"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { trackEvent } from "@/lib/analytics";

export function AnalyticsTracker() {
    const pathname = usePathname();
    const lastTrackedPath = useRef<string | null>(null);

    useEffect(() => {
        if (pathname.startsWith("/job-assistant")) {
            lastTrackedPath.current = null;
            return;
        }
        if (lastTrackedPath.current !== pathname) {
            trackEvent("page_view", { path: pathname });
            lastTrackedPath.current = pathname;
        }
        let reachedEnd = false;
        const handleScroll = () => {
            if (!reachedEnd && (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight > 0.9) {
                reachedEnd = true;
                trackEvent("scroll_depth", { depth: "90%" });
            }
        };
        const handleClick = (event: MouseEvent) => {
            if (!(event.target instanceof Element)) return;
            const link = event.target.closest<HTMLAnchorElement>("a");
            if (link?.dataset.connectPlatform) trackEvent("connect_click", { platform: link.dataset.connectPlatform });
            if (link?.dataset.projectDemo) trackEvent("project_demo_click", { project: link.dataset.projectDemo });
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        document.addEventListener("click", handleClick);
        return () => {
            window.removeEventListener("scroll", handleScroll);
            document.removeEventListener("click", handleClick);
        };
    }, [pathname]);

    return null;
}
