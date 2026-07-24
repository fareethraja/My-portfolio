import type {
    CandidateProfile,
    ExperienceEntry,
    JobAnalysis,
    JobRecord,
    PlanCategory,
    PlanTask,
    PreparationPlan,
    ProjectEntry,
    RoleTrack,
    SkillGroup,
    TailoredResume,
} from "./types";
import { getPreparationMaterials } from "./prep-materials";

type KeywordDefinition = {
    label: string;
    category: string;
    aliases: string[];
};

const KEYWORDS: KeywordDefinition[] = [
    { label: "Product management", category: "Product", aliases: ["product management", "product manager", "product lifecycle"] },
    { label: "Product roadmapping", category: "Product", aliases: ["roadmap", "roadmapping", "product strategy"] },
    { label: "Feature prioritization", category: "Product", aliases: ["prioritization", "prioritisation", "rice framework", "moscow"] },
    { label: "Product discovery", category: "Product", aliases: ["product discovery", "customer discovery", "problem discovery"] },
    { label: "User stories", category: "Product", aliases: ["user stories", "user story", "epics"] },
    { label: "Acceptance criteria", category: "Product", aliases: ["acceptance criteria", "definition of done"] },
    { label: "Requirements gathering", category: "Product", aliases: ["requirements gathering", "requirement gathering", "business requirements", "brd", "prd"] },
    { label: "Stakeholder management", category: "Product", aliases: ["stakeholder management", "stakeholder communication", "stakeholders"] },
    { label: "Cross-functional collaboration", category: "Product", aliases: ["cross functional", "cross-functional", "engineering collaboration"] },
    { label: "Agile", category: "Product", aliases: ["agile", "scrum", "sprint planning", "kanban"] },
    { label: "Jira", category: "Product", aliases: ["jira", "confluence"] },
    { label: "Go-to-market", category: "Product", aliases: ["go to market", "go-to-market", "gtm"] },
    { label: "Market research", category: "Product", aliases: ["market research", "competitive analysis", "competitor analysis"] },
    { label: "User research", category: "Product", aliases: ["user research", "customer interviews", "usability testing"] },
    { label: "Product metrics", category: "Analytics", aliases: ["product metrics", "kpi", "north star metric", "success metrics"] },
    { label: "Funnel analysis", category: "Analytics", aliases: ["funnel", "activation", "retention", "conversion", "churn"] },
    { label: "A/B testing", category: "Analytics", aliases: ["a/b testing", "ab testing", "experimentation"] },
    { label: "Data analysis", category: "Analytics", aliases: ["data analysis", "data analytics", "analytical skills"] },
    { label: "SQL", category: "Analytics", aliases: ["sql", "mysql", "postgresql"] },
    { label: "Power BI", category: "Analytics", aliases: ["power bi", "powerbi", "dax"] },
    { label: "Microsoft Excel", category: "Analytics", aliases: ["excel", "spreadsheets", "pivot table", "vlookup"] },
    { label: "Data visualization", category: "Analytics", aliases: ["data visualization", "dashboard", "tableau"] },
    { label: "Financial analysis", category: "Finance", aliases: ["financial analysis", "financial modelling", "financial modeling"] },
    { label: "FinTech", category: "Finance", aliases: ["fintech", "financial technology"] },
    { label: "Payments", category: "Finance", aliases: ["payments", "payment gateway", "razorpay", "checkout"] },
    { label: "Trading", category: "Finance", aliases: ["trading", "stock market", "capital markets", "equities"] },
    { label: "Risk management", category: "Finance", aliases: ["risk management", "risk assessment", "compliance"] },
    { label: "Artificial intelligence", category: "Technology", aliases: ["artificial intelligence", "generative ai", "genai", "ai product", "llm"] },
    { label: "Prompt design", category: "Technology", aliases: ["prompt design", "prompt engineering"] },
    { label: "Azure OpenAI", category: "Technology", aliases: ["azure openai", "openai"] },
    { label: "React", category: "Technology", aliases: ["react", "react.js", "reactjs"] },
    { label: "Next.js", category: "Technology", aliases: ["next.js", "nextjs"] },
    { label: "TypeScript", category: "Technology", aliases: ["typescript"] },
    { label: "JavaScript", category: "Technology", aliases: ["javascript"] },
    { label: "REST APIs", category: "Technology", aliases: ["rest api", "restful api", "api integration"] },
    { label: "WebSockets", category: "Technology", aliases: ["websocket", "real-time api", "realtime api"] },
    { label: "Go", category: "Technology", aliases: ["golang", "go language"] },
    { label: "Docker", category: "Technology", aliases: ["docker", "containerization", "containers"] },
    { label: "Cloud", category: "Technology", aliases: ["cloud", "azure", "aws", "gcp"] },
    { label: "Git", category: "Technology", aliases: ["git", "github", "version control"] },
    { label: "Figma", category: "Design", aliases: ["figma", "prototyping"] },
    { label: "UI/UX design", category: "Design", aliases: ["ui/ux", "ux design", "user experience", "wireframing"] },
    { label: "Operations management", category: "Operations", aliases: ["operations management", "business operations", "operational excellence"] },
    { label: "Process improvement", category: "Operations", aliases: ["process improvement", "process optimization", "process mapping"] },
    { label: "Project management", category: "Operations", aliases: ["project management", "program management", "project planning"] },
    { label: "Recruitment", category: "People", aliases: ["recruitment", "talent acquisition", "hiring", "applicant tracking system"] },
    { label: "Marketing", category: "Marketing", aliases: ["marketing", "brand strategy", "campaign management"] },
    { label: "Growth", category: "Marketing", aliases: ["growth", "growth strategy", "growth marketing", "acquisition"] },
    { label: "Communication", category: "General", aliases: ["communication", "written and verbal", "presentation skills"] },
    { label: "Problem solving", category: "General", aliases: ["problem solving", "problem-solving", "critical thinking"] },
    { label: "Documentation", category: "General", aliases: ["documentation", "technical writing", "business presentation"] },
];

const STOP_WORDS = new Set([
    "about", "after", "also", "among", "and", "are", "because", "been", "being", "build", "company", "could", "from",
    "have", "into", "job", "more", "must", "need", "our", "role", "should", "that", "the", "their", "them", "these",
    "they", "this", "through", "using", "what", "when", "where", "which", "will", "with", "work", "years", "your",
]);

const TRACK_RULES: Array<{ track: RoleTrack; label: string; terms: string[] }> = [
    { track: "product", label: "Product / APM", terms: ["product manager", "product analyst", "product intern", "apm", "roadmap", "user stories", "product strategy"] },
    { track: "analytics", label: "Business + Data Analytics", terms: ["business analyst", "data analyst", "analytics", "sql", "power bi", "insights", "dashboard"] },
    { track: "finance", label: "Finance + FinTech", terms: ["finance", "fintech", "financial", "banking", "payments", "trading", "investment"] },
    { track: "marketing", label: "Marketing + Growth", terms: ["marketing", "growth", "brand", "campaign", "seo", "acquisition"] },
    { track: "operations", label: "Operations + Program", terms: ["operations", "program manager", "project manager", "process improvement", "supply chain"] },
    { track: "people", label: "People + Talent", terms: ["human resources", "hr ", "recruiter", "talent acquisition", "people operations"] },
    { track: "technology", label: "Technology", terms: ["software engineer", "developer", "frontend", "backend", "full stack", "technical"] },
];

function normalize(value: string): string {
    return value
        .toLowerCase()
        .replace(/&/g, " and ")
        .replace(/[^a-z0-9+#./-]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function includesTerm(haystack: string, term: string): boolean {
    const normalizedTerm = normalize(term);
    if (!normalizedTerm) return false;
    return ` ${haystack} `.includes(` ${normalizedTerm} `) || haystack.includes(normalizedTerm);
}

function keywordMentioned(text: string, keyword: KeywordDefinition): boolean {
    const normalizedText = normalize(text);
    return [keyword.label, ...keyword.aliases].some((alias) => includesTerm(normalizedText, alias));
}

function countTerm(text: string, term: string): number {
    const normalizedText = normalize(text);
    const normalizedTerm = normalize(term);
    if (!normalizedTerm) return 0;
    return normalizedText.split(normalizedTerm).length - 1;
}

function profileAsText(profile: CandidateProfile): string {
    return [
        profile.headline,
        profile.summary,
        ...profile.skillGroups.flatMap((group) => group.items),
        ...profile.experiences.flatMap((experience) => [experience.role, experience.company, ...experience.bullets]),
        ...profile.projects.flatMap((project) => [project.name, project.subtitle, ...project.bullets]),
        ...profile.education.flatMap((education) => [education.qualification, education.institution, education.detail]),
        ...profile.certifications,
        ...profile.courses,
        ...profile.achievements,
        ...profile.additionalSections.flatMap((section) => [section.name, ...section.items]),
    ].join(" ");
}

function identifyRoleTrack(job: JobRecord): { track: RoleTrack; label: string } {
    const text = normalize(`${job.title} ${job.description}`);
    const ranked = TRACK_RULES.map((rule) => ({
        ...rule,
        score: rule.terms.reduce((total, term) => total + countTerm(text, term), 0),
    })).sort((left, right) => right.score - left.score);

    if (!ranked[0] || ranked[0].score === 0) return { track: "general", label: "General Business" };
    return { track: ranked[0].track, label: ranked[0].label };
}

function extractTopRequirements(description: string, keywords: KeywordDefinition[]): string[] {
    const candidates = description
        .replace(/\r/g, "\n")
        .split(/\n+|(?<=[.!?])\s+/)
        .map((sentence) => sentence.replace(/^[\s•*-]+/, "").trim())
        .filter((sentence) => sentence.length >= 28 && sentence.length <= 280);

    return candidates
        .map((sentence, index) => ({
            sentence,
            index,
            score:
                keywords.filter((keyword) => keywordMentioned(sentence, keyword)).length * 3 +
                (/required|must|responsib|qualification|experience/i.test(sentence) ? 2 : 0),
        }))
        .sort((left, right) => right.score - left.score || left.index - right.index)
        .slice(0, 5)
        .map((candidate) => candidate.sentence);
}

function rawPriorityTerms(description: string): string[] {
    const counts = new Map<string, number>();
    normalize(description)
        .split(" ")
        .filter((word) => word.length >= 5 && !STOP_WORDS.has(word) && !/^\d+$/.test(word))
        .forEach((word) => counts.set(word, (counts.get(word) ?? 0) + 1));

    return [...counts.entries()]
        .sort((left, right) => right[1] - left[1])
        .slice(0, 8)
        .map(([word]) => word);
}

function fitLabel(score: number): string {
    if (score >= 80) return "Strong alignment";
    if (score >= 65) return "Competitive alignment";
    if (score >= 45) return "Partial alignment";
    return "Stretch application";
}

function shortlistSteps(job: JobRecord, analysisTerms: string[], track: RoleTrack): string[] {
    const focus = analysisTerms.slice(0, 4).join(", ") || "the role's core requirements";
    const trackTask: Record<RoleTrack, string> = {
        product: "Prepare one product teardown and one prioritization case; explain the user problem, trade-offs, metric, and launch decision.",
        analytics: "Prepare a short analysis walkthrough: business question, data needed, method, insight, and recommendation.",
        finance: "Review the company's business model, revenue drivers, core financial concepts, and current sector news.",
        marketing: "Prepare one growth or campaign case with audience, channel, funnel metric, experiment, and expected learning.",
        operations: "Prepare one process-improvement story with baseline, bottleneck, intervention, and measurable result.",
        people: "Prepare one hiring or people-process case covering sourcing, screening, stakeholder alignment, and outcome.",
        technology: "Prepare to explain architecture and trade-offs from one project, then practice the likely technical fundamentals.",
        general: "Prepare two structured problem-solving examples with a clear situation, decision, action, and result.",
    };

    return [
        `Freeze a copy of the ${job.title || "role"} description and map each major requirement to one proof point from your resume.`,
        `Build a 90-second introduction around ${focus}; end with why ${job.company || "this company"}.`,
        `Research ${job.company || "the company"}: product, customer, revenue model, recent news, competitors, and interviewer background.`,
        trackTask[track],
        "Prepare five STAR stories: ownership, conflict, failure, ambiguity, and measurable impact. Keep each under two minutes.",
        "Send the recruiter a concise confirmation, ask for the interview format, and confirm whether an assessment or case round is included.",
    ];
}

function interviewQuestions(job: JobRecord, track: RoleTrack): string[] {
    const shared = [
        `Why ${job.company || "this company"}, and why this ${job.title || "role"} now?`,
        "Walk me through a project where you owned an ambiguous problem from definition to result.",
        "Tell me about a disagreement with a stakeholder. What changed because of your approach?",
    ];
    const roleQuestions: Record<RoleTrack, string[]> = {
        product: ["How would you prioritize competing feature requests?", "Choose one product metric for this role and explain why it matters."],
        analytics: ["How would you turn an unclear business question into an analysis plan?", "Describe a dashboard or analysis that changed a decision."],
        finance: ["How do you evaluate a business or financial opportunity with incomplete information?", "Which sector trend could most affect this company?"],
        marketing: ["How would you diagnose a weak conversion funnel?", "Design a low-cost experiment to acquire the first 1,000 users."],
        operations: ["How would you find and remove a process bottleneck?", "Which operating metric would you review every week?"],
        people: ["How would you improve a slow hiring funnel?", "How do you balance candidate experience with hiring speed?"],
        technology: ["Explain a technical trade-off you made and what you would change now.", "How would you debug a production issue with incomplete information?"],
        general: ["How do you structure an unfamiliar problem?", "What result are you most proud of, and how did you measure it?"],
    };
    return [...shared, ...roleQuestions[track]];
}

export function analyzeJob(profile: CandidateProfile, job: JobRecord): JobAnalysis {
    const jobText = `${job.title} ${job.description}`;
    const profileText = profileAsText(profile);
    const jobKeywords = KEYWORDS.filter((keyword) => keywordMentioned(jobText, keyword)).sort(
        (left, right) => countTerm(jobText, right.label) - countTerm(jobText, left.label),
    );
    const matched = jobKeywords.filter((keyword) => keywordMentioned(profileText, keyword));
    const missing = jobKeywords.filter((keyword) => !keywordMentioned(profileText, keyword));
    const role = identifyRoleTrack(job);
    const profileCompleteness = [profile.fullName, profile.summary, profile.experiences.length, profile.skillGroups.length].filter(Boolean).length / 4;
    const coverage = jobKeywords.length ? matched.length / jobKeywords.length : 0.45;
    const score = Math.max(0, Math.min(100, Math.round(coverage * 88 + profileCompleteness * 12)));
    const priorityKeywords = [
        ...jobKeywords.map((keyword) => keyword.label),
        ...rawPriorityTerms(job.description),
    ].filter((term, index, allTerms) => allTerms.indexOf(term) === index).slice(0, 14);

    const strengths = matched.length
        ? [
            `Your profile already demonstrates ${matched.slice(0, 5).map((keyword) => keyword.label).join(", ")}.`,
            `${matched.length} of ${jobKeywords.length || matched.length} detected role keywords are supported by existing resume evidence.`,
        ]
        : ["No direct keyword evidence was detected yet. Add your real skills and experience in Profile before downloading a resume."];

    const watchouts = missing.length
        ? [
            `Do not add unsupported terms just for ATS: ${missing.slice(0, 6).map((keyword) => keyword.label).join(", ")}.`,
            "If you genuinely have this experience, add a specific proof point in Profile and run the analysis again.",
        ]
        : ["Keyword coverage is strong; focus next on quantified proof, role level, and interview examples."],
        analysisTerms = priorityKeywords.slice(0, 6);

    return {
        jobId: job.id,
        score,
        fitLabel: fitLabel(score),
        roleTrack: role.track,
        roleLabel: role.label,
        matchedKeywords: matched.map((keyword) => keyword.label),
        missingKeywords: missing.map((keyword) => keyword.label),
        priorityKeywords,
        topRequirements: extractTopRequirements(job.description, jobKeywords),
        strengths,
        watchouts,
        shortlistSteps: shortlistSteps(job, analysisTerms, role.track),
        interviewQuestions: interviewQuestions(job, role.track),
        generatedAt: new Date().toISOString(),
    };
}

function relevanceScore(text: string, priorityKeywords: string[]): number {
    const normalizedText = normalize(text);
    const keywordScore = priorityKeywords.reduce(
        (total, keyword) => total + (includesTerm(normalizedText, keyword) ? 4 : 0),
        0,
    );
    const meaningfulWords = priorityKeywords.flatMap((keyword) => normalize(keyword).split(" ")).filter((word) => word.length >= 4);
    return keywordScore + meaningfulWords.reduce((total, word) => total + (includesTerm(normalizedText, word) ? 1 : 0), 0);
}

function rankBullets<T extends ExperienceEntry | ProjectEntry>(entry: T, terms: string[], maximum: number): T {
    const bullets = entry.bullets
        .map((bullet, index) => ({ bullet, index, score: relevanceScore(bullet, terms) }))
        .sort((left, right) => right.score - left.score || left.index - right.index)
        .slice(0, maximum)
        .map((candidate) => candidate.bullet);
    return { ...entry, bullets };
}

function tailorSummary(summary: string, jobTitle: string, matchedKeywords: string[]): string {
    const sentences = summary
        .split(/(?<=[.!?])\s+/)
        .map((sentence) => sentence.trim())
        .filter(Boolean);
    const evidenceSentences = sentences
        .filter((sentence) => !/\b(strong fit|seeking|targeting)\b/i.test(sentence))
        .slice(0, 2);
    const strengths = matchedKeywords
        .filter((keyword) => !["communication", "documentation", "problem solving"].includes(normalize(keyword)))
        .slice(0, 5);
    const strengthSentence = strengths.length
        ? `Relevant strengths for ${jobTitle || "this role"} include ${strengths.join(", ")}.`
        : "The profile emphasizes practical ownership, structured problem solving, and cross-functional execution.";
    return [...evidenceSentences, strengthSentence].join(" ");
}

function headlineTermsForRole(jobTitle: string, profileHeadline: string, matchedKeywords: string[]): string[] {
    const role = normalize(jobTitle);
    const generic = new Set(["communication", "documentation", "problem solving"]);
    const matched = matchedKeywords.filter((keyword) => {
        const term = normalize(keyword);
        if (!term || generic.has(term)) return false;
        if (role.includes(term) || term.includes(role)) return false;
        if (role.includes("product") && term.includes("product management")) return false;
        if (role.includes("analyst") && term === "data analysis") return false;
        return true;
    });
    const profileTerms = profileHeadline
        .split("|")
        .slice(1)
        .map((term) => term.trim())
        .filter((term) => term && !role.includes(normalize(term)));
    return [...matched, ...profileTerms]
        .filter((term, index, values) => values.findIndex((candidate) => normalize(candidate) === normalize(term)) === index)
        .slice(0, 2);
}

function tailorSkills(skillGroups: SkillGroup[], matchedKeywords: string[]): SkillGroup[] {
    return skillGroups
        .map((group) => ({
            ...group,
            items: group.items
                .map((item, index) => ({ item, index, score: relevanceScore(item, matchedKeywords) }))
                .sort((left, right) => right.score - left.score || left.index - right.index)
                .map((candidate) => candidate.item),
        }))
        .sort((left, right) => relevanceScore(right.items.join(" "), matchedKeywords) - relevanceScore(left.items.join(" "), matchedKeywords));
}

export function tailorResume(profile: CandidateProfile, job: JobRecord, analysis: JobAnalysis): TailoredResume {
    const baseHeadline = job.title.trim() || profile.headline.split("|")[0]?.trim() || "Candidate";
    const headlineTerms = headlineTermsForRole(baseHeadline, profile.headline, analysis.matchedKeywords);
    const headline = [baseHeadline, ...headlineTerms].filter(Boolean).join(" | ").toUpperCase();
    const terms = [...analysis.matchedKeywords, ...analysis.priorityKeywords];

    return {
        jobId: job.id,
        targetTitle: job.title,
        targetCompany: job.company,
        headline,
        summary: tailorSummary(profile.summary, job.title, analysis.matchedKeywords),
        skillGroups: tailorSkills(profile.skillGroups, analysis.matchedKeywords),
        experiences: profile.experiences.map((experience, index) => rankBullets(experience, terms, index === 0 ? 6 : 3)),
        projects: profile.projects
            .map((project) => ({ project: rankBullets(project, terms, 2), score: relevanceScore(`${project.name} ${project.subtitle} ${project.bullets.join(" ")}`, terms) }))
            .sort((left, right) => right.score - left.score)
            .slice(0, 3)
            .map(({ project }) => project),
        education: profile.education,
        certifications: profile.certifications,
        courses: profile.courses,
        achievements: profile.achievements,
        additionalSections: profile.additionalSections,
        selectedKeywords: analysis.matchedKeywords,
        generatedAt: new Date().toISOString(),
    };
}

type TaskSeed = {
    title: string;
    detail: string;
    category: PlanCategory;
    durationMinutes: number;
};

function rolePreparation(track: RoleTrack, keywords: string[]): TaskSeed[] {
    const focus = keywords.slice(0, 4).join(", ") || "the role's core skills";
    const tasks: Record<RoleTrack, TaskSeed[]> = {
        product: [
            { title: "Product sense case", detail: "Choose one company product. Define a user, pain point, solution, trade-off, and success metric.", category: "role", durationMinutes: 60 },
            { title: "Prioritization drill", detail: `Rank five hypothetical requests using impact, confidence, effort, and ${focus}.`, category: "role", durationMinutes: 45 },
            { title: "Metrics practice", detail: "Build one north-star metric and supporting activation, retention, and guardrail metrics.", category: "role", durationMinutes: 45 },
        ],
        analytics: [
            { title: "Business analysis case", detail: "Turn an ambiguous business problem into questions, data needs, analysis, and a recommendation.", category: "role", durationMinutes: 60 },
            { title: "SQL and dashboard review", detail: `Practice joins, grouping, funnels, and explaining an insight related to ${focus}.`, category: "role", durationMinutes: 60 },
            { title: "Insight presentation", detail: "Present one chart in three minutes: observation, implication, recommendation, limitation.", category: "role", durationMinutes: 30 },
        ],
        finance: [
            { title: "Finance fundamentals", detail: "Review statements, ratios, time value, valuation basics, and the role's domain vocabulary.", category: "role", durationMinutes: 60 },
            { title: "Sector briefing", detail: `Create a one-page view of the company, competitors, revenue drivers, risks, and ${focus}.`, category: "company", durationMinutes: 60 },
            { title: "Decision case", detail: "Make a recommendation from a small set of financial and qualitative facts; state assumptions.", category: "role", durationMinutes: 45 },
        ],
        marketing: [
            { title: "Growth funnel case", detail: "Map awareness to retention, identify one bottleneck, and propose a measurable experiment.", category: "role", durationMinutes: 60 },
            { title: "Customer and positioning", detail: `Define audience, job-to-be-done, value proposition, channels, and ${focus}.`, category: "role", durationMinutes: 45 },
            { title: "Campaign review", detail: "Critique one company campaign and propose a stronger hypothesis and KPI.", category: "company", durationMinutes: 45 },
        ],
        operations: [
            { title: "Process mapping case", detail: "Map a process, identify bottlenecks, propose controls, and choose an operating metric.", category: "role", durationMinutes: 60 },
            { title: "Estimation drill", detail: "Practice capacity, throughput, turnaround time, and prioritization calculations.", category: "aptitude", durationMinutes: 45 },
            { title: "Execution story", detail: `Prepare a STAR example showing ownership, coordination, and ${focus}.`, category: "interview", durationMinutes: 35 },
        ],
        people: [
            { title: "Hiring funnel case", detail: "Map sourcing, screening, interviews, offers, and joining; define conversion and speed metrics.", category: "role", durationMinutes: 60 },
            { title: "People scenario practice", detail: "Answer a conflict, confidentiality, and difficult stakeholder scenario with clear principles.", category: "interview", durationMinutes: 45 },
            { title: "Recruitment metrics", detail: `Review time-to-hire, source quality, offer acceptance, and ${focus}.`, category: "role", durationMinutes: 40 },
        ],
        technology: [
            { title: "Technical fundamentals", detail: `Review the concepts behind ${focus}, then explain each without jargon.`, category: "role", durationMinutes: 75 },
            { title: "Project deep dive", detail: "Prepare architecture, decisions, trade-offs, incident handling, and what you would improve.", category: "interview", durationMinutes: 60 },
            { title: "Practical problem", detail: "Complete one timed role-relevant coding or system problem and review mistakes.", category: "role", durationMinutes: 60 },
        ],
        general: [
            { title: "Role fundamentals", detail: `Review and explain ${focus} using examples from your own work.`, category: "role", durationMinutes: 60 },
            { title: "Structured case", detail: "Practice clarifying an ambiguous problem, stating assumptions, evaluating options, and recommending an action.", category: "role", durationMinutes: 45 },
            { title: "Impact stories", detail: "Prepare three concise examples with situation, action, measurable result, and learning.", category: "interview", durationMinutes: 45 },
        ],
    };
    return tasks[track];
}

function sharedPreparation(job: JobRecord): TaskSeed[] {
    return [
        { title: "JD evidence map", detail: "Match every must-have requirement to one honest proof point. Mark unsupported requirements as learning gaps.", category: "application", durationMinutes: 45 },
        { title: "Quantitative aptitude", detail: "Practice percentages, ratios, averages, profit and loss, time and work, and data interpretation.", category: "aptitude", durationMinutes: 50 },
        { title: "Logical reasoning", detail: "Practice arrangements, syllogisms, sequences, assumptions, and timed reasoning sets.", category: "aptitude", durationMinutes: 45 },
        { title: "Verbal ability", detail: "Practice reading comprehension, sentence correction, concise business writing, and vocabulary in context.", category: "aptitude", durationMinutes: 40 },
        { title: `${job.company || "Company"} research brief`, detail: "Capture product, customers, revenue model, leadership, competitors, recent news, and two thoughtful questions.", category: "company", durationMinutes: 60 },
        { title: "90-second introduction", detail: "Record and refine an introduction connecting your evidence to this role and company.", category: "interview", durationMinutes: 35 },
        { title: "STAR story bank", detail: "Write ownership, conflict, failure, ambiguity, teamwork, and impact stories; keep each under two minutes.", category: "interview", durationMinutes: 60 },
        { title: "Timed aptitude mock", detail: "Complete a mixed timed set, record accuracy and speed, then review every incorrect answer.", category: "aptitude", durationMinutes: 75 },
        { title: "Role mock interview", detail: "Run a 30-minute mock, answer aloud, review filler words and weak evidence, then repeat the weakest answer.", category: "interview", durationMinutes: 60 },
        { title: "Interview logistics", detail: "Confirm format, names, time zone, documents, device, audio, route, clothing, and backup connection.", category: "application", durationMinutes: 25 },
        { title: "Questions for the panel", detail: "Prepare questions about success in 90 days, team priorities, decision-making, feedback, and role scope.", category: "interview", durationMinutes: 30 },
    ];
}

export function createPreparationPlan(job: JobRecord, analysis: JobAnalysis, durationDays: 7 | 14): PreparationPlan {
    const seeds = [sharedPreparation(job)[0], ...rolePreparation(analysis.roleTrack, analysis.priorityKeywords), ...sharedPreparation(job).slice(1)];
    const expanded = durationDays === 14
        ? [...seeds, ...rolePreparation(analysis.roleTrack, analysis.priorityKeywords).map((task) => ({ ...task, title: `${task.title}: second pass`, detail: `Repeat at higher difficulty. ${task.detail}` }))]
        : seeds;
    const planId = `plan-${Date.now()}`;
    const tasks: PlanTask[] = expanded.map((seed, index) => {
        const day = Math.min(durationDays, 1 + Math.floor((index * durationDays) / expanded.length));
        const date = new Date();
        date.setDate(date.getDate() + day - 1);
        const materials = getPreparationMaterials(seed.title, seed.category, job.title, job.company);
        return {
            id: `${planId}-task-${index + 1}`,
            day,
            date: date.toISOString().slice(0, 10),
            title: seed.title,
            detail: seed.detail,
            category: seed.category,
            durationMinutes: seed.durationMinutes,
            ...materials,
            completed: false,
        };
    });

    return {
        id: planId,
        jobId: job.id,
        jobTitle: job.title,
        company: job.company,
        durationDays,
        createdAt: new Date().toISOString(),
        tasks,
    };
}