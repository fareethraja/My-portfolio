"use client";

import { usePathname } from "next/navigation";
import { NavBar } from "@/components/ui/tubelight-navbar";

export function ClientNavBar() {
    const pathname = usePathname();

    if (pathname === "/analytics" || pathname === "/now" || pathname.startsWith("/work")) {
        return null;
    }

    return <NavBar />;
}
