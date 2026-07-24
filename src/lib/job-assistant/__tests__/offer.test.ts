import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import { resolve } from "node:path";
import { describe, it } from "node:test";

import { calculateTakeHome, parseOfferLetter } from "../offer";

function fixture(name: string): string {
    return readFileSync(resolve(process.cwd(), "src/lib/job-assistant/__tests__/fixtures", name), "utf8");
}

function stableAnalysis(text: string) {
    const offer = parseOfferLetter(text, undefined, "Regression fixture");
    return {
        source: offer.source,
        jobId: offer.jobId,
        fileName: offer.fileName,
        rawText: offer.rawText,
        details: offer.details,
        compensation: offer.compensation,
        findings: offer.findings,
        newRegime: calculateTakeHome(offer.compensation, "new"),
        oldRegime: calculateTakeHome(offer.compensation, "old"),
    };
}

function expectFourIdenticalRuns(text: string) {
    const runs = Array.from({ length: 4 }, () => stableAnalysis(text));
    for (const run of runs.slice(1)) assert.deepEqual(run, runs[0]);
    return runs[0];
}

function assertCompensation(actual: Record<string, unknown>, expected: Record<string, unknown>) {
    for (const [key, value] of Object.entries(expected)) assert.equal(actual[key], value, key);
}

describe("offer analysis", () => {
    it("is deterministic and reconciles a balanced offer", () => {
        const result = expectFourIdenticalRuns(fixture("offer-good.txt"));

        assertCompensation(result.compensation, {
            statedCtcAnnual: 800_916,
            basicAnnual: 360_000,
            annualGrossSalary: 690_000,
            annualVariablePay: 60_000,
            employerPfAnnual: 21_600,
            employeePfAnnual: 21_600,
            gratuityAnnual: 17_316,
            insuranceBenefitsAnnual: 12_000,
            grossWasEstimated: false,
            employeePfWasEstimated: false,
        });
        assert.equal(result.newRegime.regularMonthlyInHand, 55_700);
        assert.equal(result.details.workMode, "Hybrid");
        assert.equal(result.details.probationMonths, 3);
        assert.equal(result.details.noticeDays, 30);
        assert.equal(result.findings.filter((finding) => finding.severity === "warning").length, 0);
    });

    it("is deterministic and flags an exploitative offer", () => {
        const result = expectFourIdenticalRuns(fixture("offer-exploitative.txt"));
        const titles = new Set(result.findings.map((finding) => finding.title));

        assertCompensation(result.compensation, {
            statedCtcAnnual: 600_000,
            annualGrossSalary: 300_000,
            annualVariablePay: 120_000,
            joiningBonus: 50_000,
            employeePfAnnual: 28_800,
        });
        assert.equal(result.details.probationMonths, 6);
        assert.equal(result.details.noticeDays, 120);
        [
            "Service commitment or bond",
            "Bonus clawback",
            "Post-employment non-compete",
            "Post-employment non-solicit restrictions",
            "Full-and-final settlement forfeiture",
            "Experience and relieving documents may be withheld",
            "120-day notice period",
            "Immediate termination language",
            "Broad transfer or location right",
            "Shift flexibility expected",
            "Outside-work restriction",
            "Large variable-pay share",
        ].forEach((title) => assert.equal(titles.has(title), true, title));
        assert.ok(result.findings.filter((finding) => finding.severity === "warning").length >= 8);
    });

    it("keeps monthly gross separate from annual CTC in mobile-style text", () => {
        const result = expectFourIdenticalRuns(fixture("offer-iqol-style.txt"));

        assertCompensation(result.compensation, {
            statedCtcAnnual: 624_252,
            basicAnnual: 180_000,
            annualGrossSalary: 352_000,
            annualVariablePay: 150_000,
            employerPfAnnual: 21_600,
            employeePfAnnual: 21_600,
            gratuityAnnual: 8_652,
            insuranceBenefitsAnnual: 12_000,
            grossWasEstimated: false,
        });
        assert.ok(Math.abs(result.compensation.annualGrossSalary / 12 - 29_333.33) < 0.1);
        assert.equal(result.newRegime.regularMonthlyInHand, 27_533);
        assert.ok(result.newRegime.averageMonthlyEquivalent > result.newRegime.regularMonthlyInHand);
    });
});