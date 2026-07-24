import type { CandidateProfile, CoverLetterDraft, JobAnalysis, JobRecord } from "./types";

function normalize(value: string): string {
    return value.toLowerCase().replace(/[^a-z0-9+#.]+/g, " ").replace(/\s+/g, " ").trim();
}

function sentence(value: string): string {
    const clean = value.trim();
    if (!clean) return "";
    return /[.!?]$/.test(clean) ? clean : `${clean}.`;
}

function firstSentence(value: string): string {
    return sentence(value.split(/(?<=[.!?])\s+/).map((item) => item.trim()).find(Boolean) ?? "");
}

function relevanceScore(value: string, keywords: string[]): number {
    const text = normalize(value);
    return keywords.reduce((score, keyword) => score + (text.includes(normalize(keyword)) ? 1 : 0), 0);
}

function joinedList(values: string[]): string {
    if (values.length <= 1) return values[0] ?? "";
    if (values.length === 2) return `${values[0]} and ${values[1]}`;
    return `${values.slice(0, -1).join(", ")}, and ${values.at(-1)}`;
}

export function createCoverLetter(
    profile: CandidateProfile,
    job: JobRecord,
    analysis: JobAnalysis,
    generatedAt = new Date().toISOString(),
): CoverLetterDraft {
    const supportedKeywords = analysis.matchedKeywords.slice(0, 4);
    const experienceEvidence = profile.experiences
        .flatMap((experience, experienceIndex) => experience.bullets.map((bullet, bulletIndex) => ({
            bullet,
            company: experience.company,
            role: experience.role,
            score: relevanceScore(`${experience.role} ${experience.company} ${bullet}`, supportedKeywords),
            order: experienceIndex * 100 + bulletIndex,
        })))
        .sort((left, right) => right.score - left.score || left.order - right.order)[0];
    const projectEvidence = profile.projects
        .flatMap((project, projectIndex) => project.bullets.map((bullet, bulletIndex) => ({
            bullet,
            name: project.name,
            score: relevanceScore(`${project.name} ${project.subtitle} ${bullet}`, supportedKeywords),
            order: projectIndex * 100 + bulletIndex,
        })))
        .sort((left, right) => right.score - left.score || left.order - right.order)[0];

    const paragraphs = [
        `I am applying for the ${job.title || "open position"} role at ${job.company || "your organization"}. ${firstSentence(profile.summary)}`.trim(),
        experienceEvidence
            ? `A relevant example from my experience as ${experienceEvidence.role}${experienceEvidence.company ? ` at ${experienceEvidence.company}` : ""}: ${sentence(experienceEvidence.bullet)}`
            : "My profile contains transferable project and academic evidence that I would be glad to discuss in relation to this role.",
        projectEvidence?.score
            ? `I have also applied related skills through ${projectEvidence.name}: ${sentence(projectEvidence.bullet)}`
            : "",
        supportedKeywords.length
            ? `The role's emphasis on ${joinedList(supportedKeywords)} aligns with evidence already present in my profile. I would welcome the opportunity to apply that foundation while learning the team’s specific context and standards.`
            : "I would welcome the opportunity to understand the team’s priorities and explain how my existing evidence could transfer to this role.",
        "Thank you for considering my application. I would value the opportunity to discuss the role and the evidence behind my experience.",
    ].filter(Boolean);

    return {
        jobId: job.id,
        targetTitle: job.title,
        targetCompany: job.company,
        recipient: `Hiring Manager\n${job.company}`.trim(),
        subject: `Application for ${job.title}`.trim(),
        salutation: "Dear Hiring Manager,",
        body: paragraphs.join("\n\n"),
        signOff: `Sincerely,\n${profile.fullName}`.trim(),
        generatedAt,
    };
}