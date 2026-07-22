"use client";

import { usePathname } from "next/navigation";

import { ClientNavBar } from "@/components/ui/client-navbar";
import { CommandPalette } from "@/components/ui/command-palette";
import { CommandPaletteHint } from "@/components/ui/command-palette-hint";
import { MouseTrail } from "@/components/ui/mouse-trail";
import ProceduralGroundBackground from "@/components/ui/procedural-ground-background";

export function ClientSiteChrome() {
    const pathname = usePathname();

    if (pathname.startsWith("/job-assistant")) return null;

    return (
        <>
            <ProceduralGroundBackground />
            <MouseTrail />
            <CommandPalette />
            <CommandPaletteHint />
            <div className="hidden md:block">
                <ClientNavBar />
            </div>
        </>
    );
}