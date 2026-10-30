import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { CASE_STUDIES, getCaseStudy } from "../../case-studies";
import { FAREETH_PROFILE, createInitialWorkspace } from "../profile";

describe("portfolio experience and case study accuracy", () => {
    it("uses the confirmed employment dates and graduated MBA status", () => {
        const current = FAREETH_PROFILE.experiences.filter((entry) => entry.endDate === "Present");
        assert.equal(current.length, 1);
        assert.equal(current[0].company, "Kumaran Systems");
        assert.equal(current[0].startDate, "Sep 2026");
        for (const id of ["experience-finverse", "experience-niyantha"]) {
            assert.equal(FAREETH_PROFILE.experiences.find((entry) => entry.id === id)?.endDate, "Aug 2026");
        }
        assert.equal(getCaseStudy("finverse")?.timeline, "Feb 2026 - Aug 2026");
        const mba = FAREETH_PROFILE.education.find((entry) => entry.id === "education-mba");
        assert.equal(mba?.dates, "Oct 2024 - Aug 2026");
        assert.match(mba?.qualification ?? "", /Finance Gold Medalist/);
        assert.match(mba?.detail ?? "", /Best Outgoing Student/);
    });

    it("keeps employer cases anonymized with explicit attribution and status", () => {
        for (const slug of ["enterprise-ai", "ai-developer-tool"]) {
            const cs = getCaseStudy(slug);
            assert.ok(cs);
            assert.ok(cs.status && cs.disclosure && cs.context && cs.decision && cs.outcome);
            assert.ok(cs.observations?.length);
            assert.ok(cs.approach.length && cs.learnings.length);
            assert.equal(cs.impact.length, 0);
            assert.equal(cs.links.length, 0);
            assert.doesNotMatch(JSON.stringify(cs), /\bK-?AI\b|\bK-Agent\b|\bK-Suite\b/i);
            assert.match(cs.outcome, /not|no|do not/i);
        }
        assert.match(getCaseStudy("enterprise-ai")?.summary ?? "", /proposed/i);
        assert.match(getCaseStudy("ai-developer-tool")?.decision ?? "", /not independently approved/i);
    });

    it("preserves existing stories and adds Placement Desk without exposing private access", () => {
        const slugs = CASE_STUDIES.map((entry) => entry.slug);
        assert.equal(new Set(slugs).size, slugs.length);
        for (const slug of ["finverse", "smartslot", "roomspace", "placement-desk"]) {
            assert.ok(getCaseStudy(slug));
        }
        assert.doesNotMatch(JSON.stringify(getCaseStudy("placement-desk")), /\/job-assistant\//);
        assert.equal(getCaseStudy("not-a-case-study"), undefined);
    });

    it("initializes the updated owner profile without leaking it to other workspaces", () => {
        const owner = createInitialWorkspace(true);
        const visitor = createInitialWorkspace(false);
        assert.equal(owner.profile.experiences[0].company, "Kumaran Systems");
        assert.equal(visitor.profile.experiences.length, 0);
        owner.profile.experiences[0].company = "Local edit";
        assert.equal(FAREETH_PROFILE.experiences[0].company, "Kumaran Systems");
    });

    it("preserves confirmed leadership scale and the college-to-state SDG progression", () => {
        const achievements = FAREETH_PROFILE.achievements.join(" ");
        for (const phrase of ["co-founded IRA 2K24", "400 student organizers", "2,500 visitors", "over 20 events", "sponsorship funding", "Orphic 2025", "Krupacon International Conference 2025", "Emerging Entrepreneur"]) {
            assert.ok(achievements.includes(phrase), phrase);
        }
        assert.match(achievements, /college-level SDG Championship 2022.*state level/);
        assert.doesNotMatch(achievements, /SDG.*finale/);
    });
});
