import type { CandidateProfile, JobAnalysis, JobRecord, TailoredResume } from "./types";

export type ResumeFitBreakdown = {
    keywordCoverage: number;
    titleAlignment: number;
    relevanceFocus: number;
    evidenceQuality: number;
    structure: number;
};

export type ResumeFitScore = {
    score: number;
    matchedKeywords: string[];
    missingKeywords: string[];
    breakdown: ResumeFitBreakdown;
    relevantEvidenceCount: number;
    totalEvidenceCount: number;
};

export type ResumeScoreComparison = {
    regular: ResumeFitScore;
    tailored: ResumeFitScore;
    delta: number;
};

type ScorableResume = {
    headline: string;
    summary: string;
    skills: string[];
    evidence: string[];
    educationCount: number;
    supportingSections: string[];
};

const TITLE_STOP_WORDS = new Set(["and", "the", "for", "with", "junior", "senior", "associate", "intern", "internship"]);

function normalize(value: string): string {
    return value.toLowerCase().replace(/[^a-z0-9+#.]+/g, " ").replace(/\s+/g, " ").trim();
}

function includesTerm(text: string, term: string): boolean {
    const source = normalize(text);
    const target = normalize(term);
    return Boolean(target && (` ${source} `.includes(` ${target} `) || source.includes(target)));
}

function unique(values: string[]): string[] {
    return values.filter((value, index) => value && values.findIndex((candidate) => normalize(candidate) === normalize(value)) === index);
}

function fromProfile(profile: CandidateProfile): ScorableResume {
    return {
        headline: profile.headline,
        summary: profile.summary,
        skills: profile.skillGroups.flatMap((group) => group.items),
        evidence: [
            ...profile.experiences.flatMap((experience) => experience.bullets),
            ...profile.projects.flatMap((project) => project.bullets),
        ],
        educationCount: profile.education.length,
        supportingSections: [
            ...profile.certifications,
            ...profile.courses,
            ...profile.achievements,
            ...profile.additionalSections.flatMap((section) => section.items),
        ],
    };
}

function fromTailored(resume: TailoredResume): ScorableResume {
    return {
        headline: resume.headline,
        summary: resume.summary,
        skills: resume.skillGroups.flatMap((group) => group.items),
        evidence: [
            ...resume.experiences.flatMap((experience) => experience.bullets),
            ...resume.projects.flatMap((project) => project.bullets),
        ],
        educationCount: resume.education.length,
        supportingSections: [
            ...resume.certifications,
            ...resume.courses,
            ...resume.achievements,
            ...resume.additionalSections.flatMap((section) => section.items),
        ],
    };
}

function scoreDocument(document: ScorableResume, job: JobRecord, analysis: JobAnalysis): ResumeFitScore {
    const keywords = unique([...analysis.matchedKeywords, ...analysis.missingKeywords]);
    const fallbackTerms = unique(analysis.priorityKeywords).slice(0, 8);
    const scoredKeywords = keywords.length ? keywords : fallbackTerms;
    const visibleText = [document.headline, document.summary, ...document.skills, ...document.evidence, ...document.supportingSections].join(" ");
    const matchedKeywords = scoredKeywords.filter((keyword) => includesTerm(visibleText, keyword));
    const missingKeywords = scoredKeywords.filter((keyword) => !includesTerm(visibleText, keyword));
    const keywordCoverage = Math.round((matchedKeywords.length / Math.max(1, scoredKeywords.length)) * 55);

    const titleTerms = normalize(job.title).split(" ").filter((term) => term.length >= 3 && !TITLE_STOP_WORDS.has(term));
    const titleMatches = titleTerms.filter((term) => includesTerm(document.headline, term)).length;
    const titleAlignment = Math.round((titleMatches / Math.max(1, titleTerms.length)) * 15);

    const relevantEvidence = document.evidence.filter((line) => matchedKeywords.some((keyword) => includesTerm(line, keyword)));
    const relevanceFocus = document.evidence.length
        ? Math.round((relevantEvidence.length / document.evidence.length) * 15)
        : 0;
    const quantifiedEvidence = relevantEvidence.filter((line) => /(?:\d[\d,.]*|%|₹|\$|£|€)/.test(line));
    const evidenceQuality = Math.min(10, relevantEvidence.length * 2 + quantifiedEvidence.length * 2);

    const structureSignals = [
        Boolean(document.headline.trim()),
        document.summary.trim().length >= 80,
        document.skills.length > 0,
        document.evidence.length > 0,
        document.educationCount > 0 || document.supportingSections.length > 0,
    ];
    const structure = structureSignals.filter(Boolean).length;
    const score = Math.min(100, keywordCoverage + titleAlignment + relevanceFocus + evidenceQuality + structure);

    return {
        score,
        matchedKeywords,
        missingKeywords,
        breakdown: { keywordCoverage, titleAlignment, relevanceFocus, evidenceQuality, structure },
        relevantEvidenceCount: relevantEvidence.length,
        totalEvidenceCount: document.evidence.length,
    };
}

export function compareResumeScores(
    profile: CandidateProfile,
    resume: TailoredResume,
    job: JobRecord,
    analysis: JobAnalysis,
): ResumeScoreComparison {
    const regular = scoreDocument(fromProfile(profile), job, analysis);
    const tailored = scoreDocument(fromTailored(resume), job, analysis);
    return { regular, tailored, delta: tailored.score - regular.score };
}