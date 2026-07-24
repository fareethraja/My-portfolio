import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { analyzeJob, tailorResume } from "../engine";
import { EMPTY_PROFILE } from "../profile";
import { compareResumeScores } from "../resume-score";
import type { JobRecord } from "../types";

const profile = {
    ...structuredClone(EMPTY_PROFILE),
    fullName: "Score Candidate",
    headline: "Business Analyst",
    summary: "Business analyst who prepares operational reports and communicates evidence to stakeholders across teams.",
    skillGroups: [{ id: "skills", name: "Analytics", items: ["SQL", "Microsoft Excel"] }],
    experiences: [{
        id: "experience",
        role: "Business Analyst",
        company: "Evidence Labs",
        location: "",
        startDate: "2024",
        endDate: "Present",
        bullets: [
            "Used SQL to reduce weekly reporting time by 25% for operations stakeholders.",
            "Coordinated routine administrative work across three teams.",
        ],
    }],
    education: [{ id: "education", institution: "Example University", qualification: "BBA", dates: "2020 - 2023", detail: "" }],
};

const job: JobRecord = {
    id: "job-score",
    title: "Product Analyst",
    company: "Example Company",
    location: "",
    url: "",
    description: "Analyze product metrics using SQL and Power BI, communicate insights to stakeholders, and support product decisions.",
    employmentType: "Full-time",
    postedAt: "",
    source: "Test",
    status: "saved",
    customStage: "",
    nextRoundAt: "",
    statusHistory: [],
    notes: "",
    savedAt: "",
    updatedAt: "",
};

describe("resume role-fit scoring", () => {
    it("scores only visible content and shows a deterministic tailored improvement", () => {
        const analysis = analyzeJob(profile, job);
        const resume = tailorResume(profile, job, analysis);
        const runs = Array.from({ length: 4 }, () => compareResumeScores(profile, resume, job, analysis));

        runs.slice(1).forEach((run) => assert.deepEqual(run, runs[0]));
        assert.ok(runs[0].regular.score >= 0 && runs[0].regular.score <= 100);
        assert.ok(runs[0].tailored.score >= 0 && runs[0].tailored.score <= 100);
        assert.ok(runs[0].tailored.score > runs[0].regular.score);
        assert.ok(runs[0].tailored.matchedKeywords.includes("SQL"));
        assert.ok(runs[0].tailored.missingKeywords.includes("Power BI"));
    });

    it("does not count raw source or unsupported terms as visible matches", () => {
        const profileWithRawStuffing = { ...profile, sourceText: "Power BI Power BI Power BI hidden crawler keywords" };
        const analysis = analyzeJob(profileWithRawStuffing, job);
        const resume = tailorResume(profileWithRawStuffing, job, analysis);
        const scores = compareResumeScores(profileWithRawStuffing, resume, job, analysis);
        const tailoredVisibleText = [
            resume.headline,
            resume.summary,
            ...resume.skillGroups.flatMap((group) => group.items),
            ...resume.experiences.flatMap((experience) => experience.bullets),
            ...resume.projects.flatMap((project) => project.bullets),
        ].join(" ");

        assert.ok(scores.regular.missingKeywords.includes("Power BI"));
        assert.ok(scores.tailored.missingKeywords.includes("Power BI"));
        assert.doesNotMatch(tailoredVisibleText, /Power BI/);
    });
});