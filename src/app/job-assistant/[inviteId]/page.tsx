import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import { LoginGate } from "./login-gate";
import { JobWorkspace } from "@/components/job-assistant/job-workspace";
import { getInviteById, JOB_ASSISTANT_COOKIE, verifySessionToken } from "@/lib/job-assistant/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Placement Desk",
    description: "Private job application workspace.",
    robots: {
        follow: false,
        index: false,
        nocache: true,
    },
};

type PageProps = {
    params: Promise<{ inviteId: string }>;
};

export default async function JobAssistantPage({ params }: PageProps) {
    const { inviteId } = await params;
    const invite = getInviteById(inviteId);
    if (!invite) notFound();

    const cookieStore = await cookies();
    const sessionInvite = verifySessionToken(cookieStore.get(JOB_ASSISTANT_COOKIE)?.value);

    if (!sessionInvite || sessionInvite.id !== invite.id) {
        return <LoginGate inviteId={invite.id} inviteLabel={invite.label} />;
    }

    return <JobWorkspace inviteId={invite.id} inviteLabel={invite.label} isOwner={invite.isOwner} />;
}