import type {
    CandidateProfile,
    CareerPreferences,
    JobAnalysis,
    JobStatus,
    RoleSuggestion,
    RoleTrack,
    RoundGuidance,
    SearchLauncher,
} from "./types";
import { EXTENDED_ROLES } from "./extended-roles";
import { canonicalSearchLocation } from "./locations";

export type RoleDefinition = {
    id: string;
    title: string;
    track: RoleTrack;
    levels: Array<CareerPreferences["targetLevel"]>;
    summary: string;
    interestTerms: string[];
    industryTerms?: string[];
    evidenceTerms: string[];
    educationTerms: string[];
    workStyles: string[];
    expectedWork: string[];
    skills: string[];
};

const ROLE_CATALOG: RoleDefinition[] = [
    {
        id: "associate-product-manager",
        title: "Associate Product Manager",
        track: "product",
        levels: ["internship", "entry", "associate", "any"],
        summary: "Turn user and business problems into prioritized product work, then coordinate delivery and measure outcomes.",
        interestTerms: ["product", "user", "building", "technology", "problem", "startup", "innovation"],
        evidenceTerms: ["product management", "roadmap", "prioritization", "user stories", "requirements", "stakeholder", "agile", "metrics", "figma"],
        educationTerms: ["mba", "business", "engineering", "economics", "management", "marketing"],
        workStyles: ["Problem solving", "Cross-functional", "Building", "Customer-facing"],
        expectedWork: [
            "Clarify user problems through research, support data, and stakeholder conversations.",
            "Write requirements, user flows, stories, edge cases, and acceptance criteria.",
            "Prioritize a roadmap with engineering and design while explaining trade-offs.",
            "Review launches and product metrics, then decide what to improve next.",
        ],
        skills: ["Product discovery", "Prioritization", "Product metrics", "User stories", "Stakeholder management", "Agile", "Figma", "SQL"],
    },
    {
        id: "product-analyst",
        title: "Product Analyst",
        track: "analytics",
        levels: ["internship", "entry", "associate", "any"],
        summary: "Use product and customer data to explain behavior, diagnose funnels, and recommend product decisions.",
        interestTerms: ["product", "data", "analytics", "insight", "metrics", "customer", "experiment"],
        evidenceTerms: ["product metrics", "funnel", "activation", "retention", "conversion", "power bi", "excel", "data visualization", "sql"],
        educationTerms: ["mba", "economics", "statistics", "business", "engineering", "finance", "analytics"],
        workStyles: ["Analytical", "Problem solving", "Independent research", "Cross-functional"],
        expectedWork: [
            "Define metrics and build recurring dashboards for product teams.",
            "Analyze activation, retention, funnels, cohorts, and feature adoption.",
            "Investigate changes in behavior and turn findings into recommendations.",
            "Support experiments with hypotheses, success metrics, and result analysis.",
        ],
        skills: ["SQL", "Microsoft Excel", "Product metrics", "Funnel analysis", "Data visualization", "Power BI", "A/B testing", "Communication"],
    },
    {
        id: "business-analyst",
        title: "Business Analyst",
        track: "analytics",
        levels: ["internship", "entry", "associate", "any"],
        summary: "Translate business needs into clear process, data, and system requirements that teams can execute.",
        interestTerms: ["business", "analysis", "process", "requirements", "data", "stakeholder", "solution"],
        evidenceTerms: ["requirements", "stakeholder", "process", "documentation", "excel", "power bi", "user stories", "acceptance criteria", "sql"],
        educationTerms: ["mba", "business", "economics", "finance", "management", "engineering", "commerce"],
        workStyles: ["Analytical", "Problem solving", "Cross-functional", "Structured execution"],
        expectedWork: [
            "Interview stakeholders and document current problems, rules, and desired outcomes.",
            "Map processes, data flows, requirements, and acceptance criteria.",
            "Analyze operational or customer data and present recommendations.",
            "Coordinate with business and technical teams through testing and rollout.",
        ],
        skills: ["Requirements gathering", "Process mapping", "Microsoft Excel", "SQL", "Power BI", "User stories", "Documentation", "Stakeholder management"],
    },
    {
        id: "product-operations-associate",
        title: "Product Operations Associate",
        track: "operations",
        levels: ["internship", "entry", "associate", "any"],
        summary: "Make product teams run reliably through process, launch coordination, feedback systems, tooling, and reporting.",
        interestTerms: ["product", "operations", "process", "coordination", "execution", "systems", "quality"],
        evidenceTerms: ["operations", "documentation", "admin", "qa", "launch", "stakeholder", "metrics", "agile", "process improvement"],
        educationTerms: ["mba", "business", "management", "economics", "engineering", "operations"],
        workStyles: ["Structured execution", "Cross-functional", "Problem solving", "Building"],
        expectedWork: [
            "Coordinate release readiness, launch checklists, documentation, and feedback loops.",
            "Improve product-team workflows and maintain operating dashboards.",
            "Triage user or internal issues and route patterns into product decisions.",
            "Keep teams aligned on dependencies, owners, deadlines, and outcomes.",
        ],
        skills: ["Operations management", "Process improvement", "Project management", "Product metrics", "Documentation", "Agile", "Quality assurance", "Stakeholder management"],
    },
    {
        id: "growth-product-associate",
        title: "Growth Product Associate",
        track: "marketing",
        levels: ["internship", "entry", "associate", "any"],
        summary: "Improve acquisition, activation, engagement, and retention through product-led experiments and funnel analysis.",
        interestTerms: ["growth", "marketing", "product", "experiment", "customer", "funnel", "conversion"],
        evidenceTerms: ["funnel", "activation", "retention", "conversion", "onboarding", "market research", "metrics", "a/b testing", "growth"],
        educationTerms: ["mba", "marketing", "business", "economics", "management", "analytics"],
        workStyles: ["Analytical", "Building", "Customer-facing", "Fast-paced"],
        expectedWork: [
            "Map user funnels and identify the highest-value growth bottleneck.",
            "Design experiments across onboarding, engagement, pricing, and referrals.",
            "Coordinate copy, design, engineering, and analytics for rapid tests.",
            "Measure results and scale, revise, or stop experiments based on evidence.",
        ],
        skills: ["Funnel analysis", "Product metrics", "A/B testing", "Growth", "Onboarding", "Market research", "Data analysis", "Communication"],
    },
    {
        id: "financial-analyst",
        title: "Financial Analyst",
        track: "finance",
        levels: ["internship", "entry", "associate", "any"],
        summary: "Analyze financial performance, prepare forecasts and reports, and support decisions with disciplined quantitative work.",
        interestTerms: ["finance", "financial", "investment", "business", "numbers", "markets", "analysis"],
        evidenceTerms: ["financial analysis", "excel", "power bi", "economics", "finance", "data visualization", "reporting", "market research"],
        educationTerms: ["mba finance", "finance", "economics", "commerce", "accounting", "business"],
        workStyles: ["Analytical", "Independent research", "Structured execution", "Problem solving"],
        expectedWork: [
            "Prepare recurring financial and management reports with variance analysis.",
            "Build forecasts, scenarios, and decision models in spreadsheets.",
            "Research business drivers, sectors, competitors, and risks.",
            "Present concise findings and recommendations to business stakeholders.",
        ],
        skills: ["Financial analysis", "Microsoft Excel", "Financial modeling", "Power BI", "Data visualization", "Business communication", "Market research", "Accounting basics"],
    },
    {
        id: "data-analyst",
        title: "Junior Data Analyst",
        track: "analytics",
        levels: ["internship", "entry", "any"],
        summary: "Clean, query, analyze, and visualize data so teams can answer recurring business questions reliably.",
        interestTerms: ["data", "analytics", "numbers", "insight", "dashboard", "patterns", "research"],
        evidenceTerms: ["power bi", "excel", "data visualization", "analytics", "sql", "dax", "metrics"],
        educationTerms: ["economics", "statistics", "mathematics", "engineering", "business", "finance", "analytics"],
        workStyles: ["Analytical", "Independent research", "Problem solving", "Structured execution"],
        expectedWork: [
            "Clean and validate datasets before analysis.",
            "Write queries and spreadsheet calculations to answer business questions.",
            "Build dashboards and recurring reports with clear metric definitions.",
            "Explain insights, limitations, and recommended actions to non-technical teams.",
        ],
        skills: ["SQL", "Microsoft Excel", "Power BI", "Data cleaning", "Data visualization", "Statistics basics", "Business communication", "Problem solving"],
    },
    {
        id: "marketing-analyst",
        title: "Marketing Analyst",
        track: "marketing",
        levels: ["internship", "entry", "associate", "any"],
        summary: "Measure customer, campaign, channel, and market performance to improve marketing decisions.",
        interestTerms: ["marketing", "brand", "customer", "campaign", "research", "growth", "data"],
        evidenceTerms: ["marketing", "market research", "excel", "power bi", "funnel", "conversion", "data visualization", "presentation"],
        educationTerms: ["mba marketing", "marketing", "business", "economics", "communications", "management"],
        workStyles: ["Analytical", "Customer-facing", "Independent research", "Creative"],
        expectedWork: [
            "Track campaign, channel, acquisition, and conversion performance.",
            "Research customers, categories, competitors, and positioning.",
            "Build dashboards and presentations that explain marketing outcomes.",
            "Recommend audience, channel, messaging, or budget changes from evidence.",
        ],
        skills: ["Market research", "Microsoft Excel", "Power BI", "Funnel analysis", "Campaign metrics", "Data visualization", "Presentation", "Growth"],
    },
    {
        id: "operations-analyst",
        title: "Operations Analyst",
        track: "operations",
        levels: ["internship", "entry", "associate", "any"],
        summary: "Diagnose operational bottlenecks, track service metrics, and improve how work moves through a business.",
        interestTerms: ["operations", "process", "efficiency", "analysis", "quality", "coordination", "business"],
        evidenceTerms: ["operations", "process improvement", "excel", "power bi", "metrics", "reporting", "documentation", "project management"],
        educationTerms: ["mba", "operations", "business", "economics", "engineering", "management"],
        workStyles: ["Structured execution", "Analytical", "Problem solving", "Cross-functional"],
        expectedWork: [
            "Monitor throughput, quality, turnaround, utilization, and service metrics.",
            "Map workflows and investigate delays, errors, or avoidable cost.",
            "Coordinate process changes with operating teams and stakeholders.",
            "Document controls and report whether improvements sustained over time.",
        ],
        skills: ["Operations management", "Process improvement", "Microsoft Excel", "Power BI", "Project management", "Data analysis", "Documentation", "Stakeholder management"],
    },
    {
        id: "founders-office-associate",
        title: "Founder's Office Associate",
        track: "general",
        levels: ["internship", "entry", "associate", "any"],
        summary: "Work across high-priority strategy, product, growth, operations, and research problems for an early-stage leadership team.",
        interestTerms: ["startup", "strategy", "founder", "business", "building", "growth", "operations", "product"],
        evidenceTerms: ["presentation", "stakeholder", "roadmap", "market research", "operations", "product", "documentation", "analysis"],
        educationTerms: ["mba", "business", "economics", "management", "engineering", "finance", "marketing"],
        workStyles: ["Fast-paced", "Cross-functional", "Problem solving", "Building", "Independent research"],
        expectedWork: [
            "Research ambiguous business questions and turn them into decisions or execution plans.",
            "Own short, high-priority projects across product, growth, operations, and partnerships.",
            "Prepare founder-ready updates, analyses, presentations, and follow-through.",
            "Coordinate teams and remove blockers without waiting for a fixed job boundary.",
        ],
        skills: ["Problem solving", "Market research", "Business presentation", "Project management", "Data analysis", "Stakeholder management", "Execution", "Communication"],
    },
    {
        id: "talent-acquisition-associate",
        title: "Talent Acquisition Associate",
        track: "people",
        levels: ["internship", "entry", "associate", "any"],
        summary: "Manage sourcing, screening, candidate experience, and hiring coordination while improving funnel quality and speed.",
        interestTerms: ["people", "hiring", "recruitment", "interview", "communication", "hr", "talent"],
        evidenceTerms: ["recruitment", "hiring", "screening", "interview", "ats", "job descriptions", "recruitment metrics", "stakeholder"],
        educationTerms: ["mba", "human resources", "management", "business", "psychology", "commerce"],
        workStyles: ["Customer-facing", "Cross-functional", "Structured execution", "Fast-paced"],
        expectedWork: [
            "Source candidates and maintain accurate applicant tracking records.",
            "Screen profiles and conduct initial conversations against role criteria.",
            "Coordinate interviews, feedback, offers, and candidate communication.",
            "Track funnel metrics and improve sources, speed, and candidate experience.",
        ],
        skills: ["Recruitment", "Candidate screening", "Applicant tracking systems", "Interviewing", "Recruitment metrics", "Stakeholder management", "Communication", "Microsoft Excel"],
    },
    {
        id: "customer-success-associate",
        title: "Customer Success Associate",
        track: "general",
        levels: ["internship", "entry", "associate", "any"],
        summary: "Help customers adopt a product, resolve obstacles, and turn usage feedback into retention and product improvements.",
        interestTerms: ["customer", "helping", "communication", "product", "relationship", "problem", "support"],
        evidenceTerms: ["customer", "onboarding", "user experience", "communication", "product", "stakeholder", "documentation", "activation"],
        educationTerms: ["mba", "business", "marketing", "management", "communications", "economics"],
        workStyles: ["Customer-facing", "Problem solving", "Cross-functional", "Structured execution"],
        expectedWork: [
            "Onboard customers and help them reach an early success outcome.",
            "Monitor adoption, risks, questions, and renewal signals across accounts.",
            "Resolve issues with product and technical teams while communicating clearly.",
            "Synthesize customer feedback into documentation and product recommendations.",
        ],
        skills: ["Customer onboarding", "Communication", "Problem solving", "Product knowledge", "Account management", "Documentation", "Retention", "Stakeholder management"],
    },
];

const ALL_ROLES = [...ROLE_CATALOG, ...EXTENDED_ROLES];

export const ROLE_CATALOG_TITLES = ALL_ROLES.map((role) => role.title).sort((left, right) => left.localeCompare(right));

const TRACK_INDUSTRY_TERMS: Record<RoleTrack, string[]> = {
    product: ["saas", "software", "consumer", "e-commerce", "fintech", "technology"],
    analytics: ["analytics", "consulting", "financial", "retail", "healthcare", "technology"],
    finance: ["banking", "financial", "fintech", "insurance", "investment", "capital markets"],
    marketing: ["advertising", "consumer", "retail", "media", "e-commerce", "saas"],
    operations: ["logistics", "manufacturing", "consulting", "retail", "professional services"],
    people: ["hr", "professional services", "consulting", "technology", "healthcare"],
    technology: ["software", "saas", "cloud", "cybersecurity", "ai", "technology"],
    general: ["consulting", "professional services", "saas", "consumer", "fintech"],
};

function normalize(value: string): string {
    return value.toLowerCase().replace(/[^a-z0-9+#.]+/g, " ").replace(/\s+/g, " ").trim();
}

function hasTerm(text: string, term: string): boolean {
    const normalizedText = normalize(text);
    const normalizedTerm = normalize(term);
    return Boolean(normalizedTerm && normalizedText.includes(normalizedTerm));
}

function profileText(profile: CandidateProfile): string {
    return [
        profile.headline,
        profile.summary,
        ...profile.skillGroups.flatMap((group) => [group.name, ...group.items]),
        ...profile.experiences.flatMap((experience) => [experience.role, experience.company, ...experience.bullets]),
        ...profile.projects.flatMap((project) => [project.name, project.subtitle, ...project.bullets]),
        ...profile.education.flatMap((education) => [education.qualification, education.institution, education.detail]),
        ...profile.certifications,
        ...profile.courses,
        ...profile.achievements,
        ...profile.additionalSections.flatMap((section) => [section.name, ...section.items]),
    ].join(" ");
}

function titleCase(value: string): string {
    return value.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function suggestRoles(profile: CandidateProfile, preferences: CareerPreferences): RoleSuggestion[] {
    const evidence = profileText(profile);
    const education = `${preferences.educationContext} ${profile.education.map((item) => `${item.qualification} ${item.institution}`).join(" ")}`;

    return ALL_ROLES
        .filter((role) => preferences.targetLevel === "any" || role.levels.includes(preferences.targetLevel))
        .map((role) => {
            const supportedSkills = role.skills.filter((skill) => hasTerm(evidence, skill));
            const bridgeSkills = role.skills.filter((skill) => !hasTerm(evidence, skill));
            const selectedInterestSignals = preferences.interestAreas.length ? preferences.interestAreas : [preferences.interests].filter(Boolean);
            const interestMatches = selectedInterestSignals.filter((signal) => role.interestTerms.some((term) => hasTerm(signal, term)));
            const industryTerms = role.industryTerms ?? TRACK_INDUSTRY_TERMS[role.track];
            const industryMatches = preferences.industries.filter((industry) => industryTerms.some((term) => hasTerm(industry, term) || hasTerm(term, industry)));
            const evidenceMatches = role.evidenceTerms.filter((term) => hasTerm(evidence, term));
            const educationMatches = role.educationTerms.filter((term) => hasTerm(education, term));
            const styleMatches = role.workStyles.filter((style) => preferences.workStyles.includes(style));
            const interestScore = Math.round((interestMatches.length / Math.max(1, selectedInterestSignals.length)) * 18);
            const industryScore = preferences.industries.length ? Math.min(7, industryMatches.length * 4) : 0;
            const interestsAndIndustryScore = Math.min(25, interestScore + industryScore);
            const profileEvidenceScore = Math.round((evidenceMatches.length / Math.max(1, role.evidenceTerms.length)) * 38);
            const educationScore = Math.min(12, educationMatches.length * 6);
            const workStyleScore = Math.round((styleMatches.length / Math.max(1, preferences.workStyles.length)) * 10);
            const score = Math.min(
                96,
                15 + interestsAndIndustryScore + profileEvidenceScore + educationScore + workStyleScore,
            );
            const fitReasons = [
                educationMatches.length ? `Education aligns through ${educationMatches.slice(0, 2).map(titleCase).join(" and ")}.` : "The degree is transferable, but this path needs role-specific proof.",
                evidenceMatches.length ? `Existing evidence includes ${evidenceMatches.slice(0, 4).map(titleCase).join(", ")}.` : "No direct work evidence was detected yet; begin with a small proof project.",
                interestMatches.length ? `Selected interests align through ${interestMatches.slice(0, 2).join(" and ")}.` : "Interest alignment is unclear; review the day-to-day work before choosing it.",
                industryMatches.length ? `Industry preference aligns through ${industryMatches.slice(0, 2).join(" and ")}.` : "No selected industry directly favors this role; the skills may still transfer.",
            ];

            return {
                id: role.id,
                title: role.title,
                track: role.track,
                fitScore: score,
                fitBreakdown: {
                    baseline: 15,
                    profileEvidence: profileEvidenceScore,
                    interestsAndIndustry: interestsAndIndustryScore,
                    education: educationScore,
                    workStyle: workStyleScore,
                },
                summary: role.summary,
                fitReasons,
                expectedWork: role.expectedWork,
                supportedSkills,
                bridgeSkills,
                youtubeSearchUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(`day in the life of a ${role.title}`)}`,
            };
        })
        .sort((left, right) => right.fitScore - left.fitScore)
        .slice(0, 12);
}

export function buildSearchLaunchers(preferences: CareerPreferences): SearchLauncher[] {
    const roles = preferences.selectedRoleTitles.length ? preferences.selectedRoleTitles : ["entry level jobs"];
    const roleQuery = roles.slice(0, 4).map((role) => `"${role}"`).join(" OR ");
    const location = preferences.preferredLocation.trim();
    const primaryLocation = canonicalSearchLocation(
        preferences.preferredCities[0] ?? "",
        preferences.preferredCountry,
    ) || location;
    const recencySeconds = preferences.recencyDays * 24 * 60 * 60;
    const encodedRoles = encodeURIComponent(roleQuery);
    const launchers: SearchLauncher[] = preferences.targetCompanies.slice(0, 10).map((company, index) => ({
        id: `target-${index}-${company}`,
        label: `${company} careers`,
        description: `Search this target company first for ${roles.slice(0, 2).join(" / ")}.`,
        url: `https://www.google.com/search?q=${encodeURIComponent(`${company} careers (${roleQuery}) ${location} posted last ${preferences.recencyDays} days`)}`,
        kind: "target" as const,
    }));

    launchers.push(
        {
            id: "linkedin",
            label: "LinkedIn Jobs",
            description: `Live results near ${primaryLocation || "your selected location"}, posted within ${preferences.recencyDays} days.`,
            url: `https://www.linkedin.com/jobs/search/?keywords=${encodedRoles}&location=${encodeURIComponent(primaryLocation)}&f_TPR=r${recencySeconds}`,
            kind: "board",
        },
        {
            id: "indeed",
            label: "Indeed",
            description: `Role search near ${primaryLocation || "your selected location"} with a ${preferences.recencyDays}-day age filter.`,
            url: `https://in.indeed.com/jobs?q=${encodedRoles}&l=${encodeURIComponent(primaryLocation)}&fromage=${preferences.recencyDays}&sort=date`,
            kind: "board",
        },
        {
            id: "naukri",
            label: "Naukri",
            description: "Recent India listings through a targeted site search.",
            url: `https://www.google.com/search?q=${encodeURIComponent(`site:naukri.com ${roleQuery} ${location} jobs posted ${preferences.recencyDays} days`)}`,
            kind: "board",
        },
        {
            id: "wellfound",
            label: "Wellfound",
            description: "Startup roles matched to your selected titles.",
            url: `https://www.google.com/search?q=${encodeURIComponent(`site:wellfound.com/jobs ${roleQuery} ${location}`)}`,
            kind: "board",
        },
        {
            id: "internshala",
            label: "Internshala",
            description: "Internship and fresher openings matching your role direction.",
            url: `https://www.google.com/search?q=${encodeURIComponent(`site:internshala.com ${roleQuery} ${location}`)}`,
            kind: "board",
        },
    );

    return launchers;
}

const ROUND_RESOURCES = {
    star: { label: "STAR interview method", url: "https://capd.mit.edu/resources/the-star-method-for-behavioral-interviews/" },
    aptitude: { label: "IndiaBIX aptitude practice", url: "https://www.indiabix.com/aptitude/questions-and-answers/" },
    case: { label: "Google case interview collection", url: "https://www.youtube.com/results?search_query=business+analyst+product+manager+case+interview+practice" },
    technical: { label: "Technical interview practice", url: "https://www.hackerrank.com/domains" },
};

export function getRoundGuidance(status: JobStatus, jobTitle: string, company: string, analysis?: JobAnalysis, customStage = ""): RoundGuidance {
    const roleFocus = analysis?.priorityKeywords.slice(0, 4).join(", ") || "the core role requirements";
    const companyName = company || "the company";
    const sharedResearch = `Review ${companyName}'s product, customers, business model, recent news, and competitors.`;
    const guidance: Record<JobStatus, RoundGuidance> = {
        saved: {
            title: "Application readiness",
            goal: "Decide whether this role deserves a tailored application.",
            checklist: ["Confirm eligibility, location, deadline, and role level.", "Map every must-have requirement to honest evidence.", "Find a referral or relevant recruiter before applying."],
            practice: ["Tailor the resume and review every generated statement.", `Write a three-line reason for ${companyName} and this ${jobTitle || "role"}.`],
            resources: [],
        },
        applied: {
            title: "Post-application follow-through",
            goal: "Improve visibility while preparing before an invitation arrives.",
            checklist: ["Save the exact JD and submitted resume.", "Record application date and contact person.", "Send one concise referral or recruiter note after 2-3 business days."],
            practice: [`Prepare a 90-second introduction around ${roleFocus}.`, sharedResearch],
            resources: [ROUND_RESOURCES.star],
        },
        recruiter_screen: {
            title: "Recruiter screening prep",
            goal: "Establish fit, clarity, availability, and realistic expectations in 20-30 minutes.",
            checklist: ["Prepare current status, notice period, location, compensation range, and availability.", "Know the role summary and why you applied.", "Prepare two questions on process, team, and role scope."],
            practice: ["Record a 90-second introduction and remove vague claims.", "Practice salary and relocation answers without sounding defensive."],
            resources: [ROUND_RESOURCES.star],
        },
        hr_round: {
            title: "HR round coach",
            goal: "Show motivation, communication, reliability, and culture alignment with concrete examples.",
            checklist: ["Prepare why company, why role, strengths, development area, and five-year direction.", "Review every transition in your resume.", "Prepare conflict, failure, teamwork, and ownership stories."],
            practice: ["Answer six behavioral questions aloud using STAR.", "Keep each example under two minutes and end with a result or learning."],
            resources: [ROUND_RESOURCES.star],
        },
        aptitude_round: {
            title: "Aptitude round coach",
            goal: "Improve timed accuracy across quantitative, logical, verbal, and data interpretation sections.",
            checklist: ["Confirm sections, duration, negative marking, calculator rules, and platform.", "Record baseline accuracy and time by topic.", "Prioritize high-frequency weak areas rather than random practice."],
            practice: ["Complete one timed mixed mock and review every wrong answer.", "Revise percentages, ratios, averages, profit/loss, time/work, arrangements, and reading comprehension."],
            resources: [ROUND_RESOURCES.aptitude],
        },
        assignment_round: {
            title: "Assignment / case round coach",
            goal: "Deliver a structured recommendation with explicit assumptions, evidence, trade-offs, and next steps.",
            checklist: ["Restate objective, audience, format, deadline, and evaluation criteria.", "Separate facts, assumptions, analysis, and recommendation.", "Proofread numbers, citations, visuals, and file access before submission."],
            practice: [`Run one timed case related to ${roleFocus}.`, "Present the answer in seven minutes and handle three challenge questions."],
            resources: [ROUND_RESOURCES.case],
        },
        technical_round: {
            title: "Technical round coach",
            goal: "Demonstrate fundamentals, applied decisions, debugging, and honest technical depth.",
            checklist: [`Review ${roleFocus} and the technical terms in your resume.`, "Prepare one project architecture and one production issue story.", "Say what you know, clarify assumptions, and reason aloud when uncertain."],
            practice: ["Complete one timed role-relevant problem without tutorial help.", "Explain a project trade-off, failure mode, test strategy, and improvement."],
            resources: [ROUND_RESOURCES.technical],
        },
        manager_round: {
            title: "Hiring-manager round coach",
            goal: "Show judgment, ownership, role depth, and how you would create value in the first 90 days.",
            checklist: [sharedResearch, "Prepare the three problems you expect this role to own.", "Bring questions about priorities, decisions, feedback, and success measures."],
            practice: ["Build a 30/60/90-day outline with learning, delivery, and outcome milestones.", "Practice trade-off, ambiguity, stakeholder conflict, and prioritization scenarios."],
            resources: [ROUND_RESOURCES.star, ROUND_RESOURCES.case],
        },
        final_round: {
            title: "Final round coach",
            goal: "Close remaining risk, demonstrate consistent motivation, and evaluate mutual fit.",
            checklist: ["Review notes and feedback from every previous round.", "Keep all dates, claims, preferences, and salary answers consistent.", "Prepare leadership-level questions and a concise closing statement."],
            practice: ["Run a full mock from introduction through closing questions.", "Prepare one new example for any weak area exposed earlier."],
            resources: [ROUND_RESOURCES.star],
        },
        other_round: {
            title: customStage.trim() ? `${customStage.trim()} coach` : "Custom round coach",
            goal: "Clarify the round format, evaluation criteria, and evidence expected before preparing.",
            checklist: ["Ask the recruiter for duration, participants, format, and expected preparation.", "Map likely evaluation criteria to your strongest proof points.", sharedResearch],
            practice: [`Run a mock tailored to ${customStage.trim() || "this round"} and ${roleFocus}.`, "Prepare a concise opening, three examples, and thoughtful closing questions."],
            resources: [ROUND_RESOURCES.star],
        },
        offer: {
            title: "Offer evaluation",
            goal: "Verify the complete offer and make a deliberate decision without losing momentum.",
            checklist: ["Review fixed, variable, benefits, probation, notice, location, work mode, title, and joining date.", "Confirm every verbal promise in writing.", "Compare role learning, manager, scope, stability, and compensation."],
            practice: ["Prepare a respectful, evidence-based negotiation request.", "Plan resignation, documents, references, relocation, and first-week logistics."],
            resources: [],
        },
        rejected: {
            title: "Rejection review",
            goal: "Capture useful learning, preserve the relationship, and redirect effort quickly.",
            checklist: ["Record the stage and likely gap while memory is fresh.", "Request concise feedback once, professionally.", "Thank useful contacts and keep the door open."],
            practice: ["Write one lesson and one concrete change for the next application.", "Identify three similar roles and continue the pipeline within 24 hours."],
            resources: [],
        },
        withdrawn: {
            title: "Withdrawal closeout",
            goal: "Exit professionally and retain your own decision record.",
            checklist: ["Notify the recruiter promptly and briefly.", "Record the reason privately for future role filtering.", "Thank anyone who referred or supported the application."],
            practice: ["Update career preferences so similar mismatches are filtered earlier."],
            resources: [],
        },
    };
    return guidance[status];
}