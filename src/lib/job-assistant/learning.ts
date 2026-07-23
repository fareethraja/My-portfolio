import type { JobRecord, LearningDay, LearningRoadmap, StudyResource } from "./types";

type DayTemplate = Omit<LearningDay, "day" | "completed" | "resourceIndexes"> & {
    resourceIndexes?: number[];
};

type SkillKit = {
    aliases: string[];
    resources: StudyResource[];
    days: DayTemplate[];
};

const SQL_KIT: SkillKit = {
    aliases: ["sql", "mysql", "data analysis"],
    resources: [
        {
            title: "SQLBolt interactive lessons",
            provider: "SQLBolt",
            url: "https://sqlbolt.com/",
            note: "Short browser exercises covering queries, joins, aggregation, and data changes.",
        },
        {
            title: "PostgreSQL tutorial",
            provider: "PostgreSQL",
            url: "https://www.postgresql.org/docs/current/tutorial.html",
            note: "Primary documentation for relational concepts and practical SQL.",
        },
        {
            title: "SQL practice questions",
            provider: "HackerRank",
            url: "https://www.hackerrank.com/domains/sql",
            note: "Timed practice from basic SELECT statements through advanced queries.",
        },
    ],
    days: [
        {
            title: "Relational foundations + SELECT",
            objective: "Understand tables, rows, keys, and how a query turns a business question into a result set.",
            lesson: "Complete SQLBolt lessons 1-3. Learn SELECT, aliases, DISTINCT, WHERE, ORDER BY, and LIMIT.",
            practice: "Create a small jobs table and answer ten questions such as latest jobs, Bangalore roles, and distinct companies.",
            checkpoint: "Explain the difference between filtering, sorting, and limiting without looking at notes.",
            resourceIndexes: [0, 1],
        },
        {
            title: "Conditions + data quality",
            objective: "Write reliable filters and handle missing or inconsistent values.",
            lesson: "Study AND, OR, IN, BETWEEN, LIKE, NULL, CASE, and basic text/date functions.",
            practice: "Clean and categorize a 30-row application tracker using CASE and NULL handling.",
            checkpoint: "Write five filters from plain-English recruiter questions in under 15 minutes.",
            resourceIndexes: [0, 1],
        },
        {
            title: "JOINs that answer real questions",
            objective: "Combine related tables without duplicating or silently dropping records.",
            lesson: "Learn primary/foreign keys plus INNER, LEFT, and self joins. Draw the tables before querying.",
            practice: "Join jobs, applications, and interview rounds to show each company's current pipeline.",
            checkpoint: "Explain when LEFT JOIN is safer than INNER JOIN and diagnose one duplicate-row result.",
            resourceIndexes: [0, 1, 2],
        },
        {
            title: "Aggregation + business metrics",
            objective: "Calculate counts, averages, rates, and grouped summaries correctly.",
            lesson: "Practice COUNT, SUM, AVG, MIN/MAX, GROUP BY, HAVING, and conditional aggregation.",
            practice: "Calculate application count, shortlist rate, average days to response, and conversion by source.",
            checkpoint: "Turn three business KPIs into valid queries and state the denominator for each rate.",
            resourceIndexes: [0, 2],
        },
        {
            title: "Subqueries, CTEs + windows",
            objective: "Break complex analysis into readable steps and compare rows within a group.",
            lesson: "Study subqueries, WITH clauses, ROW_NUMBER, RANK, LAG, and running totals.",
            practice: "Rank jobs by fit inside each company and show week-over-week application progress.",
            checkpoint: "Solve one medium SQL challenge and explain why a CTE or window function improved it.",
            resourceIndexes: [1, 2],
        },
        {
            title: "Portfolio proof project",
            objective: "Produce interview-ready evidence instead of only completing tutorials.",
            lesson: "Design a three-table job-search schema, insert realistic sample data, and write 12 documented queries.",
            practice: "Publish a README or PDF with schema, five business questions, query screenshots, insights, and limitations.",
            checkpoint: "Walk through the project in five minutes: problem, schema, hardest query, insight, and next step.",
            resourceIndexes: [1],
        },
        {
            title: "Timed mock + evidence review",
            objective: "Demonstrate independent SQL ability under interview conditions.",
            lesson: "Review errors from the week, then complete a mixed basic/intermediate set without tutorial help.",
            practice: "Solve 8-10 HackerRank SQL questions in 75 minutes and record accuracy, errors, and corrections.",
            checkpoint: "Only mark SQL resume-ready when you can solve joins and aggregation unaided and explain your project.",
            resourceIndexes: [2],
        },
    ],
};

const PRODUCT_KIT: SkillKit = {
    aliases: ["product management", "product roadmapping", "feature prioritization", "product discovery", "user stories", "acceptance criteria", "requirements gathering", "stakeholder management", "cross-functional collaboration", "go-to-market", "market research", "user research", "jira", "agile"],
    resources: [
        {
            title: "Product management guide",
            provider: "Atlassian",
            url: "https://www.atlassian.com/agile/product-management",
            note: "Practical overview of product roles, strategy, roadmaps, and agile delivery.",
        },
        {
            title: "Product discovery handbook",
            provider: "Product Talk",
            url: "https://www.producttalk.org/product-discovery/",
            note: "Discovery concepts, opportunity mapping, and continuous customer learning.",
        },
        {
            title: "Jira fundamentals",
            provider: "Atlassian University",
            url: "https://university.atlassian.com/student/collection/850385-learning-paths",
            note: "Official learning paths for Jira and agile teamwork.",
        },
    ],
    days: [
        { title: "Problem + user", objective: "Define whose problem matters and why.", lesson: "Study product discovery, jobs-to-be-done, and problem statements.", practice: "Interview or observe two target users and write a problem brief.", checkpoint: "State the user, context, pain, current alternative, and evidence in 60 seconds.", resourceIndexes: [0, 1] },
        { title: "Outcomes + metrics", objective: "Connect a problem to measurable product outcomes.", lesson: "Learn north-star, input, activation, retention, conversion, and guardrail metrics.", practice: "Build a metric tree for the target company's product.", checkpoint: "Defend one metric and name one way it could be gamed.", resourceIndexes: [0] },
        { title: "Discovery + options", objective: "Generate options before committing to features.", lesson: "Study assumptions, opportunity solution trees, and lightweight validation.", practice: "Create three solutions and a test for the riskiest assumption in each.", checkpoint: "Explain why your preferred option is still only a hypothesis.", resourceIndexes: [1] },
        { title: "Prioritization + roadmap", objective: "Make transparent trade-offs under constraints.", lesson: "Learn impact/effort, RICE, sequencing, dependencies, and outcome roadmaps.", practice: "Prioritize ten requests and publish a now/next/later roadmap.", checkpoint: "Handle a stakeholder challenge without hiding behind a framework score.", resourceIndexes: [0] },
        { title: "Delivery artifacts", objective: "Translate intent into buildable work.", lesson: "Study PRDs, user stories, acceptance criteria, edge cases, and Jira workflow.", practice: "Write one concise PRD and split it into stories with acceptance criteria.", checkpoint: "An engineer should be able to identify scope, behavior, and open questions.", resourceIndexes: [0, 2] },
        { title: "Case study proof", objective: "Turn the skill into observable evidence.", lesson: "Structure a case around problem, evidence, options, decision, execution, and result.", practice: "Build a six-slide teardown or case study for the target company.", checkpoint: "Deliver it in seven minutes and answer two trade-off questions.", resourceIndexes: [0, 1] },
        { title: "Mock product round", objective: "Demonstrate structured judgment aloud.", lesson: "Review weak areas and rehearse clarification, structure, trade-offs, and metrics.", practice: "Complete one product sense and one execution case under time limits.", checkpoint: "Mark the skill resume-ready only when you can show the artifact and defend decisions.", resourceIndexes: [0, 1] },
    ],
};

const ANALYTICS_KIT: SkillKit = {
    aliases: ["power bi", "data visualization", "product metrics", "funnel analysis", "a/b testing", "microsoft excel"],
    resources: [
        { title: "Power BI learning path", provider: "Microsoft Learn", url: "https://learn.microsoft.com/en-us/training/powerplatform/power-bi/", note: "Official modules for importing, modeling, visualizing, and sharing data." },
        { title: "Excel video training", provider: "Microsoft Support", url: "https://support.microsoft.com/en-us/office/excel-video-training-9bc05390-e94c-46af-a5b3-d7c22f6990bb", note: "Official lessons covering formulas, tables, charts, and PivotTables." },
        { title: "A/B testing course", provider: "Udacity", url: "https://www.udacity.com/course/ab-testing--ud257", note: "Free experimentation course covering design, metrics, and result interpretation." },
    ],
    days: [
        { title: "Questions before tools", objective: "Translate a job problem into decisions and metrics.", lesson: "Study KPI definitions, dimensions, measures, and leading versus lagging indicators.", practice: "Write five business questions and define each metric precisely.", checkpoint: "State numerator, denominator, time window, and decision for every KPI.", resourceIndexes: [0, 1] },
        { title: "Clean + model data", objective: "Create analysis-ready data with traceable transformations.", lesson: "Learn types, missing values, joins/relationships, star schemas, and validation.", practice: "Clean one public dataset and document every transformation.", checkpoint: "Reconcile row counts and explain relationship cardinality.", resourceIndexes: [0] },
        { title: "Core calculations", objective: "Produce reliable summaries and comparisons.", lesson: "Practice spreadsheet formulas or DAX measures for rates, trends, and cohorts.", practice: "Calculate five role-relevant KPIs and validate them manually.", checkpoint: "Explain filter context and one calculation error you prevented.", resourceIndexes: [0, 1] },
        { title: "Visual decisions", objective: "Choose charts that reveal rather than decorate.", lesson: "Study chart selection, scales, labels, color, accessibility, and misleading patterns.", practice: "Build a one-page dashboard with a clear hierarchy and one recommended action.", checkpoint: "A viewer should identify the main insight in ten seconds.", resourceIndexes: [0, 1] },
        { title: "Experiment thinking", objective: "Evaluate causal claims with sensible guardrails.", lesson: "Study hypotheses, randomization, sample size, significance, and practical impact.", practice: "Design an A/B test with primary metric, guardrails, duration, and decision rule.", checkpoint: "Explain correlation versus causation and one peeking risk.", resourceIndexes: [2] },
        { title: "Analysis project", objective: "Create evidence that can be reviewed in an interview.", lesson: "Combine a business question, cleaned dataset, analysis, dashboard, and recommendation.", practice: "Publish the file plus a one-page executive summary and data limitations.", checkpoint: "Present the insight and recommendation in five minutes without reading slides.", resourceIndexes: [0, 1] },
        { title: "Timed case + review", objective: "Work accurately under assessment conditions.", lesson: "Review errors, shortcuts, and common chart/calculation traps.", practice: "Complete a 60-minute dataset-to-recommendation case and compare with your checklist.", checkpoint: "Mark the skill resume-ready only with a shareable file and defensible calculations.", resourceIndexes: [0, 1, 2] },
    ],
};

const TECHNOLOGY_KIT: SkillKit = {
    aliases: ["artificial intelligence", "prompt design", "azure openai", "react", "next.js", "typescript", "javascript", "rest apis", "websockets", "go", "docker", "cloud", "git"],
    resources: [
        { title: "MDN Learn Web Development", provider: "MDN", url: "https://developer.mozilla.org/en-US/docs/Learn_web_development", note: "Structured, standards-based web development learning material." },
        { title: "GitHub Skills", provider: "GitHub", url: "https://skills.github.com/", note: "Hands-on courses for Git, GitHub, collaboration, and automation." },
        { title: "Docker Get Started", provider: "Docker", url: "https://docs.docker.com/get-started/", note: "Official guided introduction to containers and Docker workflows." },
    ],
    days: [
        { title: "Mental model", objective: "Understand the skill's purpose, vocabulary, and boundaries.", lesson: "Read the official introduction and map inputs, outputs, runtime, and common use cases.", practice: "Explain the skill in plain language and set up a minimal working environment.", checkpoint: "Run a hello-world example without copying unexplained commands.", resourceIndexes: [0, 1, 2] },
        { title: "Core syntax + workflow", objective: "Use the most common operations correctly.", lesson: "Work through foundational syntax, tooling, and debugging guidance.", practice: "Complete five small exercises and record each error and fix.", checkpoint: "Rebuild two exercises from memory.", resourceIndexes: [0, 1, 2] },
        { title: "Data + integration", objective: "Connect the skill to real inputs and another component.", lesson: "Study data structures, APIs/files, validation, and error handling.", practice: "Build a small integration that handles success, loading, empty, and failure states.", checkpoint: "Explain the data flow and one security consideration.", resourceIndexes: [0] },
        { title: "Testing + debugging", objective: "Diagnose failures systematically.", lesson: "Learn logs, breakpoints, tests, common failure modes, and dependency boundaries.", practice: "Write tests or a test checklist, then intentionally break and repair the project.", checkpoint: "Demonstrate one bug diagnosis from symptom to root cause.", resourceIndexes: [0, 1] },
        { title: "Production concerns", objective: "Recognize performance, security, deployment, and maintenance trade-offs.", lesson: "Study configuration, secrets, accessibility, performance, and deployment basics.", practice: "Run a production build and document three risks plus mitigations.", checkpoint: "Explain what changes between a tutorial and production use.", resourceIndexes: [1, 2] },
        { title: "Role-aligned project", objective: "Create a small but reviewable proof artifact.", lesson: "Scope one workflow using the target skill, with a README and explicit decisions.", practice: "Build, test, deploy or package the project, and capture screenshots or output.", checkpoint: "Give a five-minute walkthrough covering architecture, trade-offs, and next steps.", resourceIndexes: [0, 1, 2] },
        { title: "Independent challenge", objective: "Show the skill without tutorial dependence.", lesson: "Review notes, then close tutorials and work from requirements only.", practice: "Complete a timed extension or debugging task and document your reasoning.", checkpoint: "Mark resume-ready only if the project works and you can answer follow-up questions.", resourceIndexes: [0, 1, 2] },
    ],
};

const BUSINESS_KIT: SkillKit = {
    aliases: ["financial analysis", "fintech", "payments", "trading", "risk management", "operations management", "process improvement", "project management", "recruitment", "marketing", "growth", "communication", "problem solving", "documentation", "figma", "ui/ux design"],
    resources: [
        { title: "OpenLearn business courses", provider: "The Open University", url: "https://www.open.edu/openlearn/money-business/free-courses", note: "Free, structured business, finance, management, and communication modules." },
        { title: "HubSpot Academy", provider: "HubSpot", url: "https://academy.hubspot.com/courses", note: "Free practical courses across marketing, sales, service, and operations." },
        { title: "Figma Learn", provider: "Figma", url: "https://help.figma.com/hc/en-us/categories/360002051613-Get-started", note: "Official product design and prototyping guidance." },
    ],
    days: [
        { title: "Foundations + vocabulary", objective: "Understand the skill's core concepts and how this role uses them.", lesson: "Complete an introductory module and build a one-page glossary.", practice: "Map ten JD phrases to concrete actions or outputs.", checkpoint: "Explain the skill and its business value in 90 seconds.", resourceIndexes: [0, 1, 2] },
        { title: "Framework + process", objective: "Apply a repeatable method instead of relying on intuition.", lesson: "Study one established framework and its limitations.", practice: "Apply the framework to a small company-relevant scenario.", checkpoint: "State assumptions and where the framework could mislead you.", resourceIndexes: [0, 1, 2] },
        { title: "Tools + execution", objective: "Produce the common artifact expected in the role.", lesson: "Learn the relevant tool workflow and quality checklist.", practice: "Create a first draft artifact from a realistic brief.", checkpoint: "Check accuracy, clarity, audience, and actionability.", resourceIndexes: [0, 1, 2] },
        { title: "Analysis + decisions", objective: "Use evidence to compare alternatives.", lesson: "Study metrics, risks, trade-offs, and recommendation structure.", practice: "Compare three options and write a one-page recommendation.", checkpoint: "Defend the recommendation against one opposing viewpoint.", resourceIndexes: [0, 1] },
        { title: "Stakeholder simulation", objective: "Communicate the work to different audiences.", lesson: "Review concise writing, presentation structure, and objection handling.", practice: "Present the same recommendation to an executive and an execution team.", checkpoint: "Each version should end with a clear decision or next action.", resourceIndexes: [0, 1] },
        { title: "Portfolio proof", objective: "Create tangible evidence aligned to the target job.", lesson: "Study strong examples, then define scope, audience, and evaluation criteria.", practice: "Build a role-specific case study, analysis, process map, or campaign brief.", checkpoint: "Get one peer review and incorporate the highest-value correction.", resourceIndexes: [0, 1, 2] },
        { title: "Mock assessment", objective: "Demonstrate the skill under time pressure.", lesson: "Review mistakes and rehearse a concise walkthrough of your artifact.", practice: "Complete a timed case and answer five likely follow-up questions aloud.", checkpoint: "Mark resume-ready only with an artifact and an interview-ready explanation.", resourceIndexes: [0, 1, 2] },
    ],
};

const SKILL_KITS = [SQL_KIT, PRODUCT_KIT, ANALYTICS_KIT, TECHNOLOGY_KIT, BUSINESS_KIT];

function selectSkillKit(skill: string): SkillKit {
    const normalized = skill.toLowerCase();
    return SKILL_KITS.find((kit) => kit.aliases.some((alias) => normalized.includes(alias) || alias.includes(normalized))) ?? BUSINESS_KIT;
}

export function createLearningRoadmap(skill: string, job: JobRecord | undefined, roleLabel: string): LearningRoadmap {
    const kit = selectSkillKit(skill);
    const roadmapId = `learning-${Date.now()}`;

    return {
        id: roadmapId,
        jobId: job?.id ?? "",
        skill,
        roleLabel,
        createdAt: new Date().toISOString(),
        resources: kit.resources,
        days: kit.days.map((day, index) => ({
            ...day,
            day: index + 1,
            resourceIndexes: day.resourceIndexes ?? kit.resources.map((_, resourceIndex) => resourceIndex),
            completed: false,
        })),
        verified: false,
        evidenceNote: "",
    };
}