import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { EMPTY_PROFILE } from "../profile";
import { compareResume } from "../resume-compare";
import type { TailoredResume } from "../types";

const profile = {
    ...structuredClone(EMPTY_PROFILE),
    headline: "Business Analyst | SQL",
    summary: "I analyze operations data and communicate findings.",
    skillGroups: [{ id: "skills", name: "Analytics", items: ["Excel", "SQL", "Power BI"] }],
    experiences: [{
        id: "experience",
        role: "Business Analyst",
        company: "Evidence Labs",
        location: "",
        startDate: "2024",
        endDate: "Present",
        bullets: ["Built weekly reports for operations.", "Improved a process by 20%.", "Presented insights to leaders."],
    }],
    projects: [
        { id: "project-1", name: "Old Project", subtitle: "Dashboard", dates: "2023", bullets: ["Built an Excel dashboard."] },
        { id: "project-2", name: "Priority Project", subtitle: "SQL", dates: "2024", bullets: ["Analyzed customer behavior with SQL."] },
    ],
};

const resume: TailoredResume = {
    jobId: "job-1",
    targetTitle: "Product Analyst",
    targetCompany: "Example",
    headline: "PRODUCT ANALYST | SQL",
    summary: "I analyze operations data and communicate findings. Relevant strengths include SQL.",
    skillGroups: [{ id: "skills", name: "Analytics", items: ["SQL", "Excel"] }],
    experiences: [{
        ...profile.experiences[0],
        bullets: ["Built weekly reports for senior operations leaders.", "Presented insights to leaders."],
    }],
    projects: [profile.projects[1]],
    education: [],
    certifications: [],
    courses: [],
    achievements: [],
    additionalSections: [],
    selectedKeywords: ["SQL"],
    generatedAt: "2026-07-24T00:00:00.000Z",
};

describe("resume comparison", () => {
    it("detects edited fields, reordered skills, edited bullets, and omitted evidence", () => {
        const comparison = compareResume(profile, resume);

        assert.equal(comparison.tailored.headline.change, "edited");
        assert.equal(comparison.tailored.summary.change, "edited");
        assert.equal(comparison.tailored.skillGroups[0].items[0].change, "reordered");
        assert.equal(comparison.tailored.experiences[0].bullets[0].change, "edited");
        assert.equal(comparison.original.experiences[0].bullets[1].change, "omitted");
        assert.equal(comparison.original.projects[0].change, "omitted");
        assert.equal(comparison.tailored.projects[0].change, "unchanged");
        assert.ok(comparison.counts.edited >= 3);
        assert.ok(comparison.counts.omitted >= 2);
        assert.ok(comparison.counts.reordered >= 1);
    });

    it("is deterministic across repeated comparisons", () => {
        const runs = Array.from({ length: 4 }, () => compareResume(profile, resume));
        runs.slice(1).forEach((run) => assert.deepEqual(run, runs[0]));
    });
});