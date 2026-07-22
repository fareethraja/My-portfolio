import type { PlanCategory, StudyResource } from "./types";

export type PreparationMaterials = {
    studyNotes: string[];
    practiceQuestions: string[];
    resources: StudyResource[];
};

const RESOURCE = {
    indiaBixAptitude: {
        title: "Quantitative aptitude practice",
        provider: "IndiaBIX",
        url: "https://www.indiabix.com/aptitude/questions-and-answers/",
        note: "Topic-wise placement questions with worked answers.",
    },
    indiaBixLogic: {
        title: "Logical reasoning practice",
        provider: "IndiaBIX",
        url: "https://www.indiabix.com/logical-reasoning/questions-and-answers/",
        note: "Syllogism, arrangements, statements, assumptions, and sequences.",
    },
    indiaBixVerbal: {
        title: "Verbal ability practice",
        provider: "IndiaBIX",
        url: "https://www.indiabix.com/verbal-ability/questions-and-answers/",
        note: "Grammar, comprehension, vocabulary, and sentence correction.",
    },
    khanArithmetic: {
        title: "Arithmetic foundations",
        provider: "Khan Academy",
        url: "https://www.khanacademy.org/math/arithmetic",
        note: "Concept lessons and exercises for percentages, ratios, averages, and rates.",
    },
    mitStar: {
        title: "The STAR method for behavioral interviews",
        provider: "MIT Career Advising",
        url: "https://capd.mit.edu/resources/the-star-method-for-behavioral-interviews/",
        note: "A concise, credible structure for evidence-based behavioral answers.",
    },
    googleWarmup: {
        title: "Interview Warmup",
        provider: "Google",
        url: "https://grow.google/certificates/interview-warmup/",
        note: "Practice answering interview questions aloud and review answer patterns.",
    },
    atlassianProduct: {
        title: "Product management guide",
        provider: "Atlassian",
        url: "https://www.atlassian.com/agile/product-management",
        note: "Product strategy, roadmaps, prioritization, delivery, and team responsibilities.",
    },
    productDiscovery: {
        title: "Product discovery resources",
        provider: "Product Talk",
        url: "https://www.producttalk.org/product-discovery/",
        note: "Problem discovery, opportunities, assumptions, interviews, and solution testing.",
    },
    sqlBolt: {
        title: "Interactive SQL lessons",
        provider: "SQLBolt",
        url: "https://sqlbolt.com/",
        note: "Browser exercises covering SELECT, filtering, joins, and aggregation.",
    },
    powerBi: {
        title: "Power BI learning paths",
        provider: "Microsoft Learn",
        url: "https://learn.microsoft.com/en-us/training/powerplatform/power-bi/",
        note: "Official data import, modeling, DAX, visualization, and reporting modules.",
    },
    finance: {
        title: "Finance and capital markets",
        provider: "Khan Academy",
        url: "https://www.khanacademy.org/economics-finance-domain/core-finance",
        note: "Statements, interest, risk, valuation, and capital-market foundations.",
    },
    marketing: {
        title: "Digital marketing courses",
        provider: "HubSpot Academy",
        url: "https://academy.hubspot.com/courses",
        note: "Free courses covering funnels, content, campaigns, email, and reporting.",
    },
    processMap: {
        title: "Flowchart and process mapping",
        provider: "American Society for Quality",
        url: "https://asq.org/quality-resources/flowchart",
        note: "Symbols, process boundaries, decision points, and improvement use cases.",
    },
    mdn: {
        title: "Learn web development",
        provider: "MDN",
        url: "https://developer.mozilla.org/en-US/docs/Learn_web_development",
        note: "Standards-based technical foundations, examples, and exercises.",
    },
    hackerRank: {
        title: "Technical practice domains",
        provider: "HackerRank",
        url: "https://www.hackerrank.com/domains",
        note: "Timed SQL, programming, algorithms, and problem-solving exercises.",
    },
    writing: {
        title: "Writing concisely",
        provider: "Purdue OWL",
        url: "https://owl.purdue.edu/owl/general_writing/academic_writing/conciseness/index.html",
        note: "Practical guidance for precise, readable business communication.",
    },
};

function companyResources(company: string): StudyResource[] {
    const query = encodeURIComponent(`${company} company product customers business model recent news competitors`);
    const news = encodeURIComponent(`${company} company news`);
    return [
        {
            title: `${company} company research`,
            provider: "Google Search",
            url: `https://www.google.com/search?q=${query}`,
            note: "Use primary company pages first, then corroborate market claims.",
        },
        {
            title: `${company} recent news`,
            provider: "Google News",
            url: `https://news.google.com/search?q=${news}`,
            note: "Review launches, funding, leadership, regulation, and market events.",
        },
    ];
}

export function getPreparationMaterials(
    taskTitle: string,
    category: PlanCategory,
    jobTitle: string,
    company: string,
): PreparationMaterials {
    const title = taskTitle.toLowerCase();

    if (title.includes("quantitative") || title.includes("aptitude mock") || title.includes("estimation")) {
        return {
            studyNotes: [
                "Percentage change = (new - old) / old × 100. Reverse percentages must divide by the remaining multiplier, not subtract the percentage.",
                "A ratio compares parts; convert a:b into fractions a/(a+b) and b/(a+b) before allocating totals.",
                "For averages, total = average × count. When one value changes, update the total first and divide again.",
                "For work/rate problems, rate = 1/time and combined rates add. For speed, distance = speed × time; keep units consistent.",
                "In timed tests, complete direct questions first, mark long calculations, and reserve the final minutes for review rather than new guesses.",
            ],
            practiceQuestions: [
                "A value rises 20% and then falls 20%. What is the net percentage change, and why is it not zero?",
                "A team completes work in 12 days and another in 18 days. How long do they take together?",
                "From a small table, calculate conversion rate, percentage-point change, and relative percentage change.",
            ],
            resources: [RESOURCE.khanArithmetic, RESOURCE.indiaBixAptitude],
        };
    }

    if (title.includes("logical reasoning")) {
        return {
            studyNotes: [
                "Translate every statement into a constraint before solving. Do not add assumptions that the question never states.",
                "For arrangements, draw fixed positions first, then relative positions, and branch only when a condition creates genuine alternatives.",
                "For syllogisms, test whether a conclusion must be true in every valid diagram; a conclusion that is merely possible is not guaranteed.",
                "For statement-assumption questions, identify what must be believed for the statement or action to make sense.",
            ],
            practiceQuestions: [
                "Create a six-person seating grid with two fixed positions and three relative-position rules.",
                "Test: All A are B; some B are C. Which conclusions about A and C are guaranteed?",
                "After each timed set, classify errors as misunderstood rule, missed constraint, or time pressure.",
            ],
            resources: [RESOURCE.indiaBixLogic],
        };
    }

    if (title.includes("verbal ability")) {
        return {
            studyNotes: [
                "Read the question before a long passage so you know whether to seek the main idea, an inference, tone, or a specific fact.",
                "An inference must be supported by the passage; avoid answers that are broadly true but not evidenced in the text.",
                "For sentence correction, check subject-verb agreement, tense consistency, pronoun reference, parallel structure, and unnecessary words.",
                "Business writing should lead with the decision or request, support it with evidence, and end with a clear next action.",
            ],
            practiceQuestions: [
                "Summarize a 300-word article in three sentences without losing the conclusion.",
                "Rewrite a 100-word email into 60 words while retaining request, deadline, and context.",
                "Complete one timed comprehension set and explain why each rejected option is wrong.",
            ],
            resources: [RESOURCE.indiaBixVerbal, RESOURCE.writing],
        };
    }

    if (title.includes("product sense")) {
        return {
            studyNotes: [
                "Begin with the business objective and target user; do not jump directly to features.",
                "Describe the user's job, context, pain, current workaround, and evidence that the pain is important.",
                "Generate multiple solution directions, compare impact and risk, then choose one with explicit trade-offs.",
                "Define one outcome metric, supporting input metrics, and a guardrail that catches harm or gaming.",
            ],
            practiceQuestions: [
                `Improve one core workflow in a product relevant to ${company}.`,
                "How would you choose between serving a frequent low-value user and a rare high-value user?",
                "What assumption would you test before engineering begins?",
            ],
            resources: [RESOURCE.atlassianProduct, RESOURCE.productDiscovery],
        };
    }

    if (title.includes("prioritization")) {
        return {
            studyNotes: [
                "Start with strategy and constraints; a scoring framework cannot decide which objective matters.",
                "RICE uses Reach × Impact × Confidence / Effort. Keep scales consistent and expose weak confidence rather than hiding it.",
                "Separate mandatory work, risk reduction, experiments, and growth bets before comparing discretionary features.",
                "A roadmap should communicate outcomes, sequence, dependencies, and what is intentionally not being done.",
            ],
            practiceQuestions: [
                "Prioritize five requests when one is a compliance deadline, one improves retention, and one supports a major client.",
                "Show how your ranking changes when engineering effort doubles for the top item.",
                "Explain the decision to the stakeholder whose request was deferred.",
            ],
            resources: [RESOURCE.atlassianProduct],
        };
    }

    if (title.includes("metrics practice") || title.includes("insight presentation")) {
        return {
            studyNotes: [
                "A north-star metric should represent delivered user value, not only activity or revenue.",
                "Pair lagging outcomes such as retention or revenue with leading inputs such as activation and successful task completion.",
                "Every metric needs a precise event, population, denominator, time window, and owner.",
                "When presenting an insight, separate observation, likely explanation, decision implication, and uncertainty.",
            ],
            practiceQuestions: [
                `Define activation, retention, and one guardrail metric for a ${jobTitle} case at ${company}.`,
                "How could a team improve the chosen metric while harming users?",
                "Present one chart in 90 seconds: what changed, why it matters, and what to do next.",
            ],
            resources: [RESOURCE.atlassianProduct, RESOURCE.powerBi],
        };
    }

    if (title.includes("sql") || title.includes("dashboard") || title.includes("business analysis")) {
        return {
            studyNotes: [
                "Translate the business question into grain, dimensions, measures, filters, and the decision the analysis should support.",
                "Use WHERE for row filtering before aggregation and HAVING for filtering grouped results after aggregation.",
                "Choose INNER JOIN when unmatched records should disappear and LEFT JOIN when the left-side population must be preserved.",
                "Validate row counts, nulls, duplicate keys, date ranges, and totals before drawing conclusions.",
            ],
            practiceQuestions: [
                "Write a query for weekly applications, shortlisted applications, and shortlist rate by source.",
                "Explain how a one-to-many join can inflate a total and how you would detect it.",
                "Turn one ambiguous stakeholder request into five analysis questions and a recommendation format.",
            ],
            resources: [RESOURCE.sqlBolt, RESOURCE.powerBi],
        };
    }

    if (title.includes("finance fundamentals") || title.includes("decision case")) {
        return {
            studyNotes: [
                "The income statement explains performance over a period, the balance sheet shows resources and obligations at a point in time, and cash flow explains actual cash movement.",
                "Profit is not cash: revenue recognition, working capital, capex, debt, and non-cash expenses create differences.",
                "Compare margins, growth, liquidity, leverage, return metrics, and cash conversion with peers and prior periods.",
                "A recommendation should state assumptions, base/upside/downside scenarios, major risks, and the decision threshold.",
            ],
            practiceQuestions: [
                "Explain how inventory growth can increase profit but reduce operating cash flow.",
                "Build a three-scenario revenue and margin model from five stated assumptions.",
                "Which ratio would you use to assess liquidity, leverage, and operating efficiency, and why?",
            ],
            resources: [RESOURCE.finance],
        };
    }

    if (title.includes("growth funnel") || title.includes("customer and positioning") || title.includes("campaign")) {
        return {
            studyNotes: [
                "Define the audience and job-to-be-done before choosing channels or messages.",
                "A funnel stage needs a clear event and denominator; diagnose the largest valuable loss, not merely the lowest percentage.",
                "An experiment requires a hypothesis, target segment, change, primary metric, guardrails, duration, and decision rule.",
                "Positioning explains who the product is for, what problem it solves, the category, differentiated value, and proof.",
            ],
            practiceQuestions: [
                `Map acquisition through retention for ${company} and choose one bottleneck to investigate.`,
                "Write a positioning statement for one user segment and identify the evidence needed to support it.",
                "Design a low-cost experiment and state what result would cause you to stop it.",
            ],
            resources: [RESOURCE.marketing],
        };
    }

    if (title.includes("process mapping") || title.includes("hiring funnel") || title.includes("recruitment metrics")) {
        return {
            studyNotes: [
                "Define process start/end, customer, input, output, owner, steps, decisions, handoffs, queues, and exceptions.",
                "Measure volume, throughput, cycle time, waiting time, defect/rework rate, conversion, and service level.",
                "A bottleneck is the constrained step limiting system throughput; improving a non-bottleneck may only create more queue.",
                "For hiring, measure source quality, stage conversion, time in stage, interviewer capacity, offer acceptance, and joining rate.",
            ],
            practiceQuestions: [
                "Map a five-stage process and identify where work waits rather than where people appear busiest.",
                "Calculate stage conversion and time-to-hire from a small candidate funnel.",
                "Propose one control metric and one outcome metric for the improvement.",
            ],
            resources: [RESOURCE.processMap, RESOURCE.powerBi],
        };
    }

    if (title.includes("technical fundamentals") || title.includes("practical problem") || title.includes("project deep dive")) {
        return {
            studyNotes: [
                "Explain architecture as client, interface, service, data store, external dependency, and deployment boundary.",
                "For each decision, state the requirement, options considered, chosen trade-off, failure mode, and how it was validated.",
                "Debug from evidence: reproduce, narrow scope, inspect logs/inputs, form a falsifiable hypothesis, test the smallest change, and prevent recurrence.",
                "Security and reliability answers should include authentication, authorization, validation, secrets, timeouts, retries, observability, and rollback.",
            ],
            practiceQuestions: [
                "Draw one project architecture and identify its single points of failure.",
                "Explain a production defect from symptom through root cause and prevention.",
                "Complete one timed task, then review correctness, complexity, tests, and communication.",
            ],
            resources: [RESOURCE.mdn, RESOURCE.hackerRank],
        };
    }

    if (title.includes("research brief") || title.includes("sector briefing")) {
        return {
            studyNotes: [
                "Build the brief from primary sources: company site, product, pricing, investor information, leadership, careers, and official announcements.",
                "Separate facts from hypotheses. For each market claim, record the date and source.",
                "Understand customer, problem, product, business model, distribution, competitors, strategic priorities, risks, and recent changes.",
                "Convert research into interview value: two informed observations, one role-relevant opportunity, and two thoughtful questions.",
            ],
            practiceQuestions: [
                `Explain ${company}'s customer, product, and likely revenue model in 90 seconds.`,
                "Name two direct competitors and one substitute, then explain the difference.",
                "Which recent event could change this team's priorities?",
            ],
            resources: companyResources(company),
        };
    }

    if (title.includes("90-second introduction")) {
        return {
            studyNotes: [
                "Use present-past-future: current identity, two relevant proof points, then why this role and company.",
                "Choose evidence that matches the job rather than retelling every education and employment date.",
                "Use numbers only when you can explain the denominator, timeframe, and your contribution.",
                "End in roughly 75-100 seconds and leave natural openings for follow-up questions.",
            ],
            practiceQuestions: [
                `Record three versions of your introduction for ${jobTitle} at ${company}.`,
                "Remove one generic adjective and replace it with evidence.",
                "Can a listener explain your fit in one sentence after hearing the answer?",
            ],
            resources: [RESOURCE.mitStar, RESOURCE.googleWarmup],
        };
    }

    if (title.includes("star story") || title.includes("impact stories") || title.includes("execution story")) {
        return {
            studyNotes: [
                "Situation gives only the context needed to understand the problem; Task names your responsibility and constraint.",
                "Action should be most of the answer and use 'I' for your decisions while crediting team contributions accurately.",
                "Result should include outcome, evidence, stakeholder effect, and what you learned or changed afterward.",
                "Prepare stories for ownership, conflict, failure, ambiguity, influence, teamwork, customer focus, and measurable impact.",
            ],
            practiceQuestions: [
                "Tell me about a time you disagreed with a stakeholder and changed the outcome.",
                "Describe a failure, the earliest signal you missed, and the system change you made.",
                "Explain an ambiguous problem you structured without waiting for perfect information.",
            ],
            resources: [RESOURCE.mitStar, RESOURCE.googleWarmup],
        };
    }

    if (title.includes("mock interview")) {
        return {
            studyNotes: [
                "Simulate the real format: timed opening, role questions, behavioral questions, candidate questions, and closing.",
                "Review structure, evidence, accuracy, concision, filler words, and whether each answer directly addressed the question.",
                "Do not memorize paragraphs. Memorize story facts and frameworks so the answer remains conversational.",
                "Repeat only the weakest two answers immediately; a full second mock can hide the specific correction.",
            ],
            practiceQuestions: [
                `Why ${company}, why ${jobTitle}, and why now?`,
                "What is the hardest trade-off you made, and what evidence changed your decision?",
                "What would your first 30 days in this role focus on?",
            ],
            resources: [RESOURCE.googleWarmup, RESOURCE.mitStar],
        };
    }

    if (title.includes("jd evidence map")) {
        return {
            studyNotes: [
                "Separate requirements into must-have, preferred, responsibility, domain, tool, behavior, and eligibility categories.",
                "For every must-have, record one proof point with context, action, result, and where it appears in the resume.",
                "Mark gaps honestly as learn, clarify, or disqualifying. Do not hide unsupported terms in the resume.",
                "Prioritize evidence that is recent, repeated, measurable, and close to the role's actual work.",
            ],
            practiceQuestions: [
                "Which three requirements are most likely to decide shortlisting?",
                "Which claim in your resume would an interviewer ask you to demonstrate?",
                "What gap needs a learning roadmap before you can claim it?",
            ],
            resources: [RESOURCE.mitStar, RESOURCE.atlassianProduct],
        };
    }

    if (title.includes("questions for the panel")) {
        return {
            studyNotes: [
                "Ask questions whose answers affect your decision or reveal how success is defined; avoid facts easily found on the website.",
                "Strong topics include first-90-day outcomes, team priorities, decision rights, customer contact, feedback, constraints, and why the role is open.",
                "Tailor questions to the interviewer: recruiter for process, manager for outcomes, peer for collaboration, leader for strategy.",
            ],
            practiceQuestions: [
                "What would make someone exceptional in this role after six months?",
                "Which current team trade-off is hardest, and how would this role contribute?",
                "How are decisions made when customer, business, and engineering priorities conflict?",
            ],
            resources: [RESOURCE.mitStar],
        };
    }

    if (title.includes("interview logistics")) {
        return {
            studyNotes: [
                "Confirm date, time zone, duration, platform/address, interviewers, format, assessment rules, and required documents.",
                "For video, test camera, microphone, headphones, charging, bandwidth, account login, screen sharing, and a backup hotspot.",
                "Keep the JD, submitted resume, examples, questions, water, charger, identification, and recruiter contact accessible.",
                "For on-site rounds, plan route, security entry, arrival 15-20 minutes early, clothing, and a delay contact message.",
            ],
            practiceQuestions: [
                "Run a five-minute device and screen-share rehearsal.",
                "Write the message you would send if delayed or disconnected.",
                "Confirm which resume version and job description will be discussed.",
            ],
            resources: [RESOURCE.googleWarmup],
        };
    }

    return {
        studyNotes: [
            "Clarify the objective, audience, constraints, evidence, and expected decision before beginning.",
            "Structure the answer into problem, evidence, options, trade-offs, recommendation, risk, and next step.",
            "Use one real example from your profile and identify what you would verify before acting.",
        ],
        practiceQuestions: [
            `How does this topic affect success in the ${jobTitle} role?`,
            "What assumption is most likely to make your answer wrong?",
            "Explain the concept in two minutes without jargon.",
        ],
        resources: category === "company"
            ? companyResources(company)
            : [RESOURCE.googleWarmup, RESOURCE.mitStar],
    };
}