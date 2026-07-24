import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { EMPTY_PROFILE } from "../profile";
import { importProfileFromText } from "../resume-import";
import { RESUME_CORPUS } from "./resume-corpus";

describe("resume text import corpus", () => {
    it("contains exactly 50 varied resume cases", () => {
        assert.equal(RESUME_CORPUS.length, 50);
        assert.equal(new Set(RESUME_CORPUS.map((item) => item.text)).size, 50);
    });

    for (const { id, text, expectedName } of RESUME_CORPUS) {
        it(`routes sections accurately for ${id}`, () => {
            const profile = importProfileFromText(text, structuredClone(EMPTY_PROFILE));
            const allSkills = profile.skillGroups.flatMap((group) => group.items).join(" ");
            const additionalByName = new Map(profile.additionalSections.map((section) => [section.name, section.items]));

            assert.equal(profile.fullName, expectedName);
            assert.match(profile.email, /@example\.com$/);
            assert.match(profile.summary, /solves customer and operations problems/);
            assert.match(allSkills, /SQL/);
            assert.match(allSkills, /dashboard design/);
            assert.equal(profile.experiences.length, 1);
            assert.match(profile.experiences[0].bullets.join(" "), /20%/);
            assert.equal(profile.projects.length, 1);
            assert.equal(profile.education.length, 1);
            assert.equal(profile.certifications.length, 2);
            assert.doesNotMatch(profile.certifications.join(" "), /Financial Modeling/);
            assert.deepEqual(profile.courses, ["Financial Modeling and Valuation", "Advanced SQL for Business"]);
            assert.equal(profile.achievements.length, 1);
            assert.equal(additionalByName.get("Languages")?.length, 2);
            assert.equal(additionalByName.get("Volunteer Experience")?.length, 1);
            assert.equal(additionalByName.get("Publications")?.length, 1);
            assert.equal(additionalByName.has("Declaration"), false);
        });
    }
});