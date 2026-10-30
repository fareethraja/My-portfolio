"use client";

import { trackEvent } from "@/lib/analytics";

export const useAnalytics = () => ({
    trackConnectClick: (platform: string) => trackEvent("connect_click", { platform }),
    trackProjectClick: (project: string) => trackEvent("project_demo_click", { project }),
});
