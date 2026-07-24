import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { EMPTY_PROFILE } from "../profile";
import { openResumePrintView } from "../resume-export";
import type { TailoredResume } from "../types";

const resume: TailoredResume = {
    jobId: "job-1",
    targetTitle: "Product Analyst",
    targetCompany: "Example Labs",
    headline: "PRODUCT ANALYST | SQL",
    summary: "Evidence-based summary.",
    skillGroups: [],
    experiences: [],
    projects: [],
    education: [],
    certifications: [],
    courses: [],
    achievements: [],
    additionalSections: [],
    selectedKeywords: ["SQL"],
    generatedAt: "2026-07-24T00:00:00.000Z",
};

describe("resume print export", () => {
    it("keeps a writable popup handle without noopener and isolates the opener afterward", () => {
        const calls: Array<[string | URL | undefined, string | undefined, string | undefined]> = [];
        const writes: string[] = [];
        let closed = false;
        const popup = {
            opener: {} as unknown,
            document: {
                write(value: string) { writes.push(value); },
                close() { closed = true; },
            },
        };
        const profile = { ...structuredClone(EMPTY_PROFILE), fullName: "Test Candidate", email: "test@example.com" };

        const opened = openResumePrintView(profile, resume, (url, target, features) => {
            calls.push([url, target, features]);
            return popup;
        });

        assert.equal(opened, true);
        assert.deepEqual(calls, [["", "_blank", undefined]]);
        assert.equal(popup.opener, null);
        assert.equal(closed, true);
        assert.match(writes.join(""), /Test Candidate/);
        assert.match(writes.join(""), /window\.print\(\)/);
        assert.doesNotMatch(writes.join(""), /data-resume-change|Edited in tailored|Preview-only review|Omitted|Reordered/);
    });

    it("reports a blocked popup without writing", () => {
        assert.equal(openResumePrintView(EMPTY_PROFILE, resume, () => null), false);
    });
});