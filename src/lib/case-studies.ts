export type CaseStudyMetric = {
    value: string;
    label: string;
};

export type CaseStudyLink = {
    label: string;
    href: string;
    type: "live" | "github" | "demo" | "doc";
};

export type CaseStudy = {
    slug: string;
    title: string;
    tagline: string;
    role: string;
    timeline: string;
    summary: string;
    stack: string[];
    problem: string;
    constraints: string[];
    approach: { title: string; body: string }[];
    impact: CaseStudyMetric[];
    learnings: string[];
    links: CaseStudyLink[];
    accent: "violet" | "sky" | "amber";
};

export const CASE_STUDIES: CaseStudy[] = [
    {
        slug: "finverse",
        title: "Finverse",
        tagline: "AI-powered stock market super app",
        role: "Product Manager · Finverse Innovations Private Limited",
        timeline: "Feb 2026 - Present",
        summary:
            "Owning product planning and execution across Zeno AI, screeners, strategy backtesting, paper trading, courses, checkout, admin tooling, and real-time market data for a fast-moving fintech audience in India.",
        stack: [
            "Next.js 15",
            "TypeScript",
            "Tailwind v4",
            "Go (Fiber)",
            "MySQL",
            "Razorpay",
            "Azure OpenAI",
            "Vercel · Render",
        ],
        problem:
            "Retail traders in India often bounce between a broker, screener, news source, learning platform, and chat app before making one decision. Finverse needed one place to research, learn, simulate, and act, with AI that stays grounded in real product and market data.",
        constraints: [
            "Indian market hours, instruments, and charge rules need to be handled carefully",
            "AI answers must be grounded in real Finverse data, not free-form LLM output",
            "Screeners and chat need to feel fast on mobile-first user journeys",
            "Multilingual prompts (English, Tamil, Hindi mix) without losing accuracy",
            "Product discovery, specs, QA, and launches need to move in tight cycles",
        ],
        approach: [
            {
                title: "Tool-first AI architecture for Zeno",
                body: "Designed Zeno to call typed Finverse tools for market, course, portfolio, and strategy data before falling back to Azure OpenAI. Data queries can return directly from `finverse-tools-v1`; multilingual or open-ended prompts go through the LLM while still using tool summaries.",
            },
            {
                title: "Strategy to backtest to paper trading as one loop",
                body: "Modeled strategies as composable rule-sets that can support backtesting, paper trading, and live alert workflows. The product keeps one mental model instead of splitting users across disconnected tools.",
            },
            {
                title: "Course commerce that survives reconciliation",
                body: "Wired Razorpay checkout with server-side signature verification on confirmation, then bound course access to the verified payment state so access is not granted from a client-only success screen.",
            },
            {
                title: "Guest mode that protects the funnel",
                body: "Landing-page Zeno runs the same backend generator via `/chat/guest` with no chat history or AI track sync. A 5 replies per device per day guest limit lets visitors feel the product without polluting authenticated AI history.",
            },
            {
                title: "Operational guardrails before scale",
                body: "Shipped admin super-admin role, AI history, hydration theme fix, and Google OAuth backend wiring + frontend callback cleanup so the team could own incidents without me on every channel.",
            },
        ],
        impact: [
            { value: "2026", label: "Active Finverse product ownership" },
            { value: "Tool-first", label: "Market, course, portfolio, and strategy data before AI narration" },
            { value: "Verified", label: "Razorpay confirmation before course access" },
            { value: "5/day", label: "Guest Zeno replies per device for landing-page trials" },
        ],
        learnings: [
            "Tool-first beats prompt engineering for fintech accuracy. Let the LLM narrate, not compute.",
            "Reconciliation logic belongs on the server before the user sees a success state.",
            "A single PM can move fast if the tooling, AI guardrails, and admin surface are treated as first-class product, not afterthoughts.",
        ],
        links: [
            { label: "Visit Finverse", href: "https://finverse.trade/", type: "live" },
        ],
        accent: "violet",
    },
    {
        slug: "smartslot",
        title: "SmartSlot",
        tagline: "Mobile-first dental appointment PWA",
        role: "Product Designer · Full-stack builder",
        timeline: "2025",
        summary:
            "A Progressive Web App that lets dental students and interns publish daily slots, share WhatsApp booking links, manage leave days, and track case progress without forcing patients to sign up.",
        stack: ["React", "Tailwind CSS", "Supabase", "Vercel", "PWA"],
        problem:
            "Dental students often coordinate clinical slots through WhatsApp, paper notes, and informal spreadsheets. SmartSlot turns that scattered workflow into a simple booking link and dashboard built around the student and patient journey.",
        constraints: [
            "Patients must book in one tap, no account required",
            "The experience has to feel clean on mobile screens",
            "Students need to manage leave/availability without admin overhead",
            "The product should stay simple enough to run on lightweight web infrastructure",
        ],
        approach: [
            {
                title: "Public booking links, private dashboards",
                body: "Each student gets a public link they can share on WhatsApp. Patients can request a slot without creating an account, while the student manages availability and follow-up from a private dashboard.",
            },
            {
                title: "Installable PWA, not an app store fight",
                body: "Built the product as a PWA so it can be opened, shared, and installed from the browser without waiting for an app-store workflow.",
            },
            {
                title: "Leave + case tracking baked into the slot model",
                body: "Treated leave days and case progress as part of the same scheduling workflow, keeping the student view compact and easier to maintain.",
            },
        ],
        impact: [
            { value: "1-tap", label: "Patient booking without signup" },
            { value: "PWA", label: "Installable from the browser" },
            { value: "WhatsApp-first", label: "Designed around how patients already respond" },
        ],
        learnings: [
            "Removing signup from the consumer side is worth a lot more than a fancy admin UI.",
            "A booking product should match the channel people already use before adding new behavior.",
            "PWAs are still a strong fit when the user's first touchpoint is a shared link.",
        ],
        links: [
            { label: "Open SmartSlot", href: "https://smartslot-lilac.vercel.app/", type: "live" },
        ],
        accent: "sky",
    },
    {
        slug: "roomspace",
        title: "RoomSpace",
        tagline: "Roommate key tracker with offline sync",
        role: "Product · Design · Build",
        timeline: "2025",
        summary:
            "A small mobile/web tool that tracks who currently holds the room key, with simple accountability, real-time updates, and offline-aware behavior for shared-living coordination.",
        stack: ["React", "Node.js", "Firebase", "Offline Sync"],
        problem:
            "Shared rooms can turn one physical key into a constant coordination problem. RoomSpace gives the group a simple source of truth so everyone knows who has the key now.",
        constraints: [
            "Has to stay useful when the network is unreliable",
            "Must take fewer taps than typing in WhatsApp",
            "No notification spam, just the people who need the update",
        ],
        approach: [
            {
                title: "Optimistic UI with offline queue",
                body: "Hand-off updates write locally first, sync to Firebase when connectivity returns. The handoff feels instant whether you're on Wi-Fi or in a stairwell.",
            },
            {
                title: "Designed around one verb",
                body: "The whole app is essentially one big 'I have the key now' button + a real-time presence list. Resisted feature creep hard.",
            },
            {
                title: "Accountability log instead of blame",
                body: "Handoffs are timestamped and visible to the group, which makes the status clear without turning the app into a blame tool.",
            },
        ],
        impact: [
            { value: "1 tap", label: "Key handoff" },
            { value: "Offline-aware", label: "Built for unreliable connectivity" },
            { value: "Shared view", label: "One current holder visible to the group" },
        ],
        learnings: [
            "Tiny tools earn trust by being boring and reliable, not clever.",
            "Optimistic UI changes the perceived speed of an app more than any backend tuning.",
            "If you can't explain the app in one verb, you have two apps.",
        ],
        links: [
            { label: "Open RoomSpace", href: "https://roommate-key-tracker.vercel.app/", type: "live" },
        ],
        accent: "amber",
    },
];

export function getCaseStudy(slug: string): CaseStudy | undefined {
    return CASE_STUDIES.find((c) => c.slug === slug);
}
