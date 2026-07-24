import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { ROLE_CATALOG_TITLES, suggestRoles } from "../career";
import { EMPTY_PROFILE } from "../profile";
import type { CareerPreferences } from "../types";

function preferences(interestAreas: string[], workStyles: string[], industries: string[] = []): CareerPreferences {
    return {
        educationContext: "MBA in Business Management and Bachelor of Economics",
        interests: interestAreas.join("; "),
        interestAreas,
        workStyles,
        industries,
        targetLevel: "any",
        preferredLocation: "",
        preferredCountry: "",
        preferredCities: [],
        customLocation: "",
        remotePreference: "any",
        selectedRoleTitles: [],
        targetCompanies: [],
        recencyDays: 7,
    };
}

function titles(input: CareerPreferences): string[] {
    return suggestRoles(structuredClone(EMPTY_PROFILE), input).map((role) => role.title);
}

describe("role discovery intelligence", () => {
    it("provides a broad, unique role catalog", () => {
        assert.ok(ROLE_CATALOG_TITLES.length >= 30);
        assert.equal(new Set(ROLE_CATALOG_TITLES).size, ROLE_CATALOG_TITLES.length);
    });

    it("returns 12 deterministic suggestions", () => {
        const input = preferences(["Working with data and dashboards"], ["Analytical", "Deep focus"], ["SaaS"]);
        const runs = Array.from({ length: 4 }, () => titles(input));
        assert.equal(runs[0].length, 12);
        runs.slice(1).forEach((run) => assert.deepEqual(run, runs[0]));
    });

    it("changes top roles for finance, people, technology, and sustainability interests", () => {
        const finance = titles(preferences(["Finance, investing, and markets"], ["Analytical", "Deep focus"], ["Capital Markets"])).slice(0, 6);
        const people = titles(preferences(["Hiring, people, and workplace culture"], ["Coaching others", "Customer-facing"], ["HR and HR Tech"])).slice(0, 6);
        const technology = titles(preferences(["Technology, software, and systems"], ["Problem solving", "Quality and accuracy"], ["SaaS"])).slice(0, 6);
        const sustainability = titles(preferences(["Sustainability and social impact"], ["Independent research", "Writing and documentation"], ["Climate Tech"])).slice(0, 6);

        assert.ok(finance.some((title) => /Investment|Credit|Financial|FP&A/.test(title)));
        assert.ok(people.some((title) => /Talent|HR|People|Learning/.test(title)));
        assert.ok(technology.some((title) => /Quality Assurance|Technical Support|Implementation/.test(title)));
        assert.ok(sustainability.includes("Sustainability Analyst"));
        assert.ok(new Set(finance.filter((title) => people.includes(title))).size < 3);
        assert.ok(new Set(people.filter((title) => technology.includes(title))).size < 3);
    });
});