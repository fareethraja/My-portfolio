"use client";

import { useAnalytics } from "@/hooks/use-analytics";

export function AnalyticsTracker() {
    useAnalytics(); // Initializes page view and scroll tracking
    return null;
}
