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
    status?: string;
    disclosure?: string;
    context?: string;
    observations?: string[];
    decision?: string;
    outcome?: string;
};

export const CASE_STUDIES: CaseStudy[] = [
    {
        slug: "enterprise-ai",
        title: "Enterprise AI",
        tagline: "Memory, personalization, and context continuity",
        role: "Product Manager Trainee · Kumaran Systems",
        timeline: "Sep 2026 - Present",
        status: "Discovery & proposals",
        disclosure: "Anonymized account of contributions to an internal product. Product names, internal materials, and implementation details are withheld. This is not a launch announcement.",
        context: "As part of enterprise AI product discovery at Kumaran Systems, I contributed to target-market discussions, SWOT analysis, user journeys, and exploration of memory and personalization.",
        summary: "Evaluated how an AI assistant could retain useful context across conversations, and proposed context-import onboarding to address the cold-start problem. These are discovery contributions and product recommendations, not claims of shipped functionality.",
        stack: ["Product Discovery", "User Journeys", "SWOT Analysis", "AI Memory", "Personalization", "Trade-off Analysis"],
        problem: "An AI assistant without prior context asks users to repeat preferences and background information. The product question was how to support continuity without treating unlimited memory as a free or automatically useful feature.",
        constraints: [
            "Session context and persistent memory serve different user needs",
            "Context-window limits, token consumption, performance, and cost affect product choices",
            "Proposed onboarding benefits need validation before being presented as outcomes",
        ],
        observations: [
            "I questioned whether memory could support personalization rather than relying on an entirely separate preference mechanism.",
            "I identified the cold-start challenge when users move from an existing assistant to a new product.",
        ],
        approach: [
            { title: "Start with journeys and product assumptions", body: "Contributed to target-market, SWOT, and user-journey discussions to connect AI capability questions with the experience a user would actually encounter." },
            { title: "Compare continuity approaches", body: "Explored session-based versus persistent context, preference retention, and the trade-offs between memory usefulness, performance, and cost." },
            { title: "Propose a cold-start direction", body: "Suggested exploring import of existing conversational history or preferences as an onboarding option. The intended benefit was less repeated input and faster personalization, not an already-measured improvement." },
        ],
        decision: "My recommended direction was to evaluate memory as a foundation for personalization and investigate context import. I contributed to discussions; I did not independently approve architecture or the roadmap.",
        outcome: "Discovery discussions and a context-import proposal. Implementation, launch, adoption, and business impact are not asserted in this public account.",
        impact: [],
        learnings: [
            "AI product questions need to connect context quality and cost with a specific user journey.",
            "A promising onboarding proposal is a hypothesis, not proof of improved retention or activation.",
        ],
        links: [],
        accent: "violet",
    },
    {
        slug: "ai-developer-tool",
        title: "AI Developer Tool",
        tagline: "Evaluating an AI-powered developer experience",
        role: "Product Manager Trainee · Kumaran Systems",
        timeline: "Sep 2026 - Present",
        status: "Evaluation & recommendations",
        disclosure: "Anonymized contribution summary for an internal VS Code extension initiative. Internal feature lists, recordings, roadmap details, and product names are not published.",
        context: "The team was exploring an AI-assisted coding experience in VS Code. I brought prior hands-on experience using GitHub Copilot and used it to make the product category tangible for the team.",
        summary: "Demonstrated GitHub Copilot workflows, recorded walkthroughs, evaluated potential capabilities, and recommended feature priorities and phased implementation for an internal AI coding extension.",
        stack: ["Competitive Evaluation", "Developer Experience", "Product Demonstrations", "Feature Prioritization", "Phased Recommendations"],
        problem: "A familiar competitor can generate a long feature wishlist. The product challenge was to understand the developer experience and distinguish useful initial capabilities from work that could follow later.",
        constraints: [
            "Personal product experience is an input to evaluation, not a substitute for broader user research",
            "Recommendations must distinguish initial priorities from later-phase capabilities",
            "Engineering delivery and formal roadmap approval were not my ownership",
        ],
        observations: [
            "My existing Copilot experience let me show real workflows rather than describe the category only through feature names.",
            "Recorded demonstrations gave the team concrete functionality and interactions to discuss.",
        ],
        approach: [
            { title: "Make the competitive experience concrete", body: "Used my personal laptop and hands-on Copilot experience to demonstrate relevant functionality, explain developer workflows, and record walkthroughs for the team." },
            { title: "Translate demonstrations into product evaluation", body: "Evaluated potential capabilities and explained the user experience behind them so the discussion could move from competitor familiarity to product choices." },
            { title: "Recommend a phased scope", body: "Suggested which capabilities to prioritize initially and which could be introduced later. The specific internal feature ranking is deliberately omitted from this public summary." },
        ],
        decision: "Recommended feature priorities and phased implementation based on hands-on competitive evaluation. These were product recommendations, not independently approved roadmap commitments.",
        outcome: "Delivered demonstrations, recordings, and feature-priority recommendations. I do not claim to have built the extension, owned engineering delivery, or launched the recommended capabilities.",
        impact: [],
        learnings: [
            "A concrete workflow demonstration can make feature-priority discussions more specific and useful.",
            "Competitive familiarity is most useful when translated into product choices, not a mandate to copy every capability.",
        ],
        links: [],
        accent: "sky",
    },
    {
        slug: "placement-desk",
        title: "Placement Desk",
        tagline: "Connecting fragmented student job-search workflows",
        role: "Independent Product · Design · Build",
        timeline: "2026",
        status: "Working product · unlisted access",
        context: "An independent product in this portfolio repository, designed around Indian students and early-career candidates managing their job search.",
        summary: "Built a local-first workspace connecting candidate profiles, role discovery, evidence-based resume tailoring, application tracking, interview preparation, and offer analysis without treating generated claims as candidate evidence.",
        stack: ["Workflow Design", "Next.js", "TypeScript", "Local-first Storage", "Resume Export", "Candidate Privacy"],
        problem: "Candidates move between job listings, resume documents, tracking sheets, and preparation resources. That fragmentation makes it harder to keep application context together and tailor a resume without introducing unsupported claims.",
        constraints: [
            "Tailored resumes should preserve evidence and avoid inventing skills or experience",
            "A stale job link must not silently tailor a resume for the wrong role",
            "Candidate data needs browser-local storage and a portable backup",
            "Private workspaces remain unlisted and excluded from search indexing",
        ],
        observations: [
            "The workflow needs to connect discovery, applications, and preparation rather than stop at a resume download.",
            "Trust depends on showing assumptions and making data ownership clear.",
        ],
        approach: [
            { title: "Connect the application journey", body: "Built candidate profiles, role discovery, application stages, and preparation workflows around a shared workspace rather than disconnected tools." },
            { title: "Keep tailoring evidence-based", body: "Implemented resume comparison and DOCX/PDF output alongside protected job-link handling and skill roadmaps that require evidence before adding a skill." },
            { title: "Treat privacy as a product constraint", body: "Used browser-local storage with JSON backup and restore, authenticated workspace access, and indexing exclusions. Private workspace URLs and candidate data are not included here." },
        ],
        decision: "Prioritized a connected, local-first candidate workflow with truthful tailoring and explicit assumptions over an automated promise to get candidates hired.",
        outcome: "Implemented workspace features are present in this repository. No placement-rate improvement, user adoption, or hiring outcome is claimed.",
        impact: [],
        learnings: [
            "The quality of a tailored resume depends on the evidence behind it, not just how closely it matches keywords.",
            "Backup, stale-link handling, and privacy are part of the user journey, not just implementation details.",
        ],
        links: [],
        accent: "amber",
    },
    {
        slug: "finverse",
        title: "Finverse",
        tagline: "AI-powered stock market super app",
        role: "Product Manager · Technical Product Builder",
        timeline: "Feb 2026 - Aug 2026",
        summary:
            "Translated founder goals into product requirements, feature logic, user flows, QA checks, and release-ready fintech/AI workflows across Zeno AI, screeners, strategy backtesting, paper trading, courses, checkout, admin tooling, and market data through a Bermer Software Limited client engagement.",
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
            "Retail traders in India often bounce between a broker, screener, news source, learning platform, and chat app before making one decision. Finverse needed one place to research, learn, simulate, and act, while the product team needed feature requirements clear enough for fast AI-assisted frontend, backend, payment, and market-data execution.",
        constraints: [
            "Founder requirements often start broad and need to become clear scopes, flows, edge cases, and acceptance criteria",
            "Indian market hours, instruments, and charge rules need to be handled carefully",
            "AI answers must be grounded in real Finverse data, not free-form LLM output",
            "Screeners and chat need to feel fast on mobile-first user journeys",
            "Multilingual prompts (English, Tamil, Hindi mix) without losing accuracy",
            "Product discovery, specs, QA, and launches need to move in tight cycles",
        ],
        approach: [
            {
                title: "Founder intent to implementation-ready specs",
                body: "Converted high-level product requests into requirement lists, feature logic, user journeys, expected results, bug lists, and QA checks so frontend, backend, AI, payment, and admin work could move without losing the original business intent.",
            },
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
            { value: "Core", label: "Feature flows shaped from founder asks to release checks" },
            { value: "Tool-first", label: "Market, course, portfolio, and strategy data before AI narration" },
            { value: "Verified", label: "Razorpay confirmation before course access" },
            { value: "5/day", label: "Guest Zeno replies per device for landing-page trials" },
        ],
        learnings: [
            "Tool-first beats prompt engineering for fintech accuracy. Let the LLM narrate, not compute.",
            "Clear acceptance criteria matter more when the team is moving fast with AI-assisted implementation.",
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
