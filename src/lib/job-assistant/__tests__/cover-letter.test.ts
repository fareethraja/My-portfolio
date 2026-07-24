import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { createCoverLetter } from "../cover-letter";
import { buildCoverLetterDocx, openCoverLetterPrintView } from "../cover-letter-export";
import { analyzeJob } from "../engine";
import { EMPTY_PROFILE } from "../profile";
import type { JobRecord } from "../types";

const profile = {
    ...structuredClone(EMPTY_PROFILE),
    fullName: "Test Candidate",
    summary: "Business analyst with evidence in SQL reporting and stakeholder communication.",
    skillGroups: [{ id: "skills", name: "Analytics", items: ["SQL"] }],
    experiences: [{
        id: "experience",
        role: "Business Analyst",
        company: "Evidence Labs",
        location: "",
        startDate: "2024",
        endDate: "Present",
        bullets: ["Used SQL to reduce weekly reporting time by 25% for operations stakeholders."],
    }],
};

const job: JobRecord = {
    id: "job-1",
    title: "Product Analyst",
    company: "Example Company",
    location: "Chennai",
    url: "",
    description: "Use SQL and Power BI to analyze product metrics, collaborate with stakeholders, and communicate recommendations to product teams.",
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

describe("cover letter generation", () => {
    it("is deterministic and uses supported profile evidence", () => {
        const analysis = analyzeJob(profile, job);
        const generatedAt = "2026-07-24T00:00:00.000Z";
        const runs = Array.from({ length: 4 }, () => createCoverLetter(profile, job, analysis, generatedAt));

        runs.slice(1).forEach((run) => assert.deepEqual(run, runs[0]));
        assert.match(runs[0].body, /Product Analyst/);
        assert.match(runs[0].body, /Example Company/);
        assert.match(runs[0].body, /Used SQL to reduce weekly reporting time by 25%/);
        assert.match(runs[0].body, /SQL/);
        assert.doesNotMatch(runs[0].body, /Power BI/);
    });

    it("falls back without inventing experience when profile evidence is empty", () => {
        const empty = { ...structuredClone(EMPTY_PROFILE), fullName: "New Candidate", summary: "" };
        const analysis = analyzeJob(empty, job);
        const letter = createCoverLetter(empty, job, analysis, "2026-07-24T00:00:00.000Z");

        assert.match(letter.body, /transferable project and academic evidence/);
        assert.doesNotMatch(letter.body, /years of experience/i);
        assert.equal(letter.signOff, "Sincerely,\nNew Candidate");
    });

    it("exports a one-page DOCX with a safe filename", async () => {
        const analysis = analyzeJob(profile, job);
        const letter = createCoverLetter(profile, job, analysis, "2026-07-24T00:00:00.000Z");
        const result = await buildCoverLetterDocx(profile, letter);

        assert.equal(result.filename, "Test-Candidate-Example-Company-Cover-Letter.docx");
        assert.ok(result.blob.size > 1_000);
        assert.equal(result.blob.type, "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    });

    it("prints through an isolated popup and escapes edited HTML", () => {
        const analysis = analyzeJob(profile, job);
        const letter = {
            ...createCoverLetter(profile, job, analysis, "2026-07-24T00:00:00.000Z"),
            body: "Evidence paragraph.\n\n<script>alert('x')</script>",
        };
        const writes: string[] = [];
        let closed = false;
        const popup = {
            opener: {} as unknown,
            document: {
                write(value: string) { writes.push(value); },
                close() { closed = true; },
            },
        };

        const opened = openCoverLetterPrintView(profile, letter, () => popup);
        const html = writes.join("");
        assert.equal(opened, true);
        assert.equal(popup.opener, null);
        assert.equal(closed, true);
        assert.match(html, /&lt;script&gt;alert\(&#39;x&#39;\)&lt;\/script&gt;/);
        assert.doesNotMatch(html, /<script>alert\('x'\)<\/script>/);
        assert.match(html, /window\.print\(\)/);
    });
});