import type {
    JobRecord,
    NegotiationAdvice,
    OfferAnalysis,
    OfferCompensation,
    OfferFinding,
    OfferFindingSeverity,
    OfferNegotiationInputs,
    TakeHomeEstimate,
    TaxRegime,
} from "./types";

const NEW_REGIME_STANDARD_DEDUCTION = 75_000;
const OLD_REGIME_STANDARD_DEDUCTION = 50_000;
const NEW_REGIME_REBATE_LIMIT = 1_200_000;
const OLD_REGIME_REBATE_LIMIT = 500_000;
const CESS_RATE = 0.04;

type TaxSlab = { upper: number; rate: number };

const NEW_REGIME_SLABS: TaxSlab[] = [
    { upper: 400_000, rate: 0 },
    { upper: 800_000, rate: 0.05 },
    { upper: 1_200_000, rate: 0.1 },
    { upper: 1_600_000, rate: 0.15 },
    { upper: 2_000_000, rate: 0.2 },
    { upper: 2_400_000, rate: 0.25 },
    { upper: Number.POSITIVE_INFINITY, rate: 0.3 },
];

const OLD_REGIME_SLABS: TaxSlab[] = [
    { upper: 250_000, rate: 0 },
    { upper: 500_000, rate: 0.05 },
    { upper: 1_000_000, rate: 0.2 },
    { upper: Number.POSITIVE_INFINITY, rate: 0.3 },
];

export const EMPTY_OFFER_COMPENSATION: OfferCompensation = {
    statedCtcAnnual: 0,
    basicAnnual: 0,
    annualGrossSalary: 0,
    annualVariablePay: 0,
    variablePayoutPercent: 100,
    performanceBonusAnnual: 0,
    performanceBonusPayoutPercent: 0,
    joiningBonus: 0,
    retentionBonus: 0,
    retentionPayoutPercent: 100,
    employerPfAnnual: 0,
    employeePfAnnual: 0,
    gratuityAnnual: 0,
    insuranceBenefitsAnnual: 0,
    otherCtcAnnual: 0,
    otherTaxableIncomeAnnual: 0,
    professionalTaxMonthly: 0,
    otherDeductionMonthly: 0,
    oldRegimeDeductionsAnnual: 0,
    grossWasEstimated: false,
    employeePfWasEstimated: false,
};

export const EMPTY_NEGOTIATION_INPUTS: OfferNegotiationInputs = {
    currentCtcAnnual: 0,
    competingOfferAnnual: 0,
    marketMinimumAnnual: 0,
    marketMedianAnnual: 0,
    marketMaximumAnnual: 0,
    leverageNotes: "",
    priorities: [],
};

function cleanText(value: string): string {
    return value.replace(/\u00a0/g, " ").replace(/[ \t]+/g, " ").replace(/\n[ \t]+/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

function normalized(value: string): string {
    return value.toLowerCase().replace(/[^a-z0-9₹%./ -]+/g, " ").replace(/\s+/g, " ").trim();
}

function roundCurrency(value: number): number {
    return Number.isFinite(value) ? Math.max(0, Math.round(value)) : 0;
}

function parseMoneyCandidate(raw: string): number {
    const value = raw.toLowerCase().replace(/₹|inr|rs\.?/g, " ").trim();
    const numberMatch = value.match(/\d[\d,]*(?:\.\d+)?/);
    if (!numberMatch) return 0;
    const parsed = Number(numberMatch[0].replace(/,/g, ""));
    if (!Number.isFinite(parsed)) return 0;
    if (/crore|\bcr\b/.test(value)) return roundCurrency(parsed * 10_000_000);
    if (/lakh|lac|\blpa\b/.test(value)) return roundCurrency(parsed * 100_000);
    return roundCurrency(parsed);
}

function firstMoneyValue(value: string): { amount: number; index: number; end: number } | null {
    const pattern = /(?:₹|inr|rs\.?)?\s*\d[\d,]*(?:\.\d+)?\s*(?:crore|cr|lakh|lac|lpa)?/gi;
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(value))) {
        const amount = parseMoneyCandidate(match[0]);
        if (amount >= 1_000) return { amount, index: match.index, end: match.index + match[0].length };
    }
    return null;
}

function allMoneyValues(value: string): number[] {
    const pattern = /(?:₹|inr|rs\.?)?\s*\d[\d,]*(?:\.\d+)?\s*(?:crore|cr|lakh|lac|lpa)?/gi;
    const values: number[] = [];
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(value))) {
        const amount = parseMoneyCandidate(match[0]);
        if (amount >= 1_000) values.push(amount);
    }
    return values;
}

function findAnnualTableAmount(text: string, labels: string[]): number {
    const lines = cleanText(text).split("\n").map((line) => line.trim()).filter(Boolean);
    for (const line of lines) {
        const normalizedLine = normalized(line);
        const label = labels.find((candidate) => normalizedLine.includes(normalized(candidate)));
        if (!label) continue;
        const labelIndex = normalizedLine.indexOf(normalized(label));
        const values = allMoneyValues(line.slice(Math.max(0, labelIndex + label.length)));
        if (values.length) return values[values.length - 1];
    }
    return 0;
}

function findAmount(text: string, labels: string[]): number {
    const source = cleanText(text);
    const lowerSource = source.toLowerCase();
    for (const label of labels) {
        let fromIndex = 0;
        while (fromIndex < lowerSource.length) {
            const index = lowerSource.indexOf(label.toLowerCase(), fromIndex);
            if (index < 0) break;
            const context = source.slice(index + label.length, index + label.length + 120);
            const money = firstMoneyValue(context);
            if (money && !/[.;]/.test(context.slice(0, money.index))) {
                let amount = money.amount;
                const nearby = [
                    source.slice(Math.max(0, index - 20), index + label.length),
                    context.slice(Math.max(0, money.index - 20), money.end + 22),
                ].join(" ");
                if (/per month|monthly|\/month|p\.m\.?/i.test(nearby)) amount *= 12;
                return roundCurrency(amount);
            }
            fromIndex = index + label.length;
        }
    }
    return 0;
}

function findPercentage(text: string, labels: string[]): number {
    const lines = cleanText(text).split("\n").filter((line) => labels.some((label) => normalized(line).includes(normalized(label))));
    for (const line of lines) {
        const match = line.match(/(\d{1,3}(?:\.\d+)?)\s*%/);
        if (match) return Math.min(100, Math.max(0, Number(match[1])));
    }
    return 100;
}

function findDate(text: string, labels: string[]): string {
    const lines = cleanText(text).split("\n");
    for (let index = 0; index < lines.length; index += 1) {
        const line = lines[index];
        if (!labels.some((label) => normalized(line).includes(normalized(label)))) continue;
        const context = `${line} ${lines[index + 1] ?? ""}`;
        const match = context.match(/(?:\d{1,2}[/-]\d{1,2}[/-](?:\d{2}|\d{4})|\d{1,2}(?:st|nd|rd|th)?\s+[A-Za-z]{3,9},?\s+\d{4}|[A-Za-z]{3,9}\s+\d{1,2},?\s+\d{4})/i);
        if (match) return match[0];
    }
    return "";
}

function findDurationDays(text: string, label: string): number {
    const compact = cleanText(text);
    const patterns = [
        new RegExp(`${label}[^.\\n]{0,80}?(?:[a-z]+\\s*)?\\(?(\\d+)\\)?\\s*(day|month)`, "i"),
        new RegExp(`(?:[a-z]+\\s*)?\\(?(\\d+)\\)?\\s*(day|month)[^.\\n]{0,50}?${label}`, "i"),
    ];
    for (const pattern of patterns) {
        const match = compact.match(pattern);
        if (!match) continue;
        const value = Number(match[1]);
        return match[2].toLowerCase().startsWith("month") ? value * 30 : value;
    }
    return 0;
}

function findProbationMonths(text: string): number {
    const match = cleanText(text).match(/probation[^.\n]{0,100}?(?:[a-z]+\s*)?\(?(\d+)\)?\s*(month|day)/i);
    if (!match) return 0;
    const value = Number(match[1]);
    return match[2].toLowerCase().startsWith("day") ? Math.max(1, Math.round(value / 30)) : value;
}

function findConfirmedNoticeDays(text: string): number {
    const source = cleanText(text);
    const match = source.match(/(?:terminate|termination)[^.\n]{0,180}?(?:providing|provide|giving)[^.\n]{0,60}?(?:[a-z]+\s*)?\(?(\d+)\)?\s*(day|month)[^.\n]{0,40}?notice/i);
    if (!match) return 0;
    const value = Number(match[1]);
    return match[2].toLowerCase().startsWith("month") ? value * 30 : value;
}

function findWorkMode(text: string): string {
    const value = normalized(text);
    if (/\bhybrid\b/.test(value)) return "Hybrid";
    if (/work from home|\bremote\b/.test(value)) return "Remote";
    if (/work from office|on site|onsite|office based/.test(value)) return "On-site";
    return "";
}

function compensationFromText(text: string): OfferCompensation {
    const tableCtc = findAnnualTableAmount(text, ["total cost to company", "annual ctc", "total ctc", "cost to company"]);
    const tableBasic = findAnnualTableAmount(text, ["basic"]);
    const tableGross = findAnnualTableAmount(text, ["total earnings (a)", "total earnings"]);
    const tableVariablePay = findAnnualTableAmount(text, ["variable pay", "annual incentive", "target bonus"]);
    const tablePerformanceBonus = findAnnualTableAmount(text, ["performance bonus"]);
    const tableJoiningBonus = findAnnualTableAmount(text, ["joining bonus", "sign on bonus", "sign-on bonus"]);
    const tableRetentionBonus = findAnnualTableAmount(text, ["retention bonus"]);
    const tableEmployeePf = findAnnualTableAmount(text, ["pf employee", "employee pf"]);
    const tableEmployerPf = findAnnualTableAmount(text, ["pf - employer", "pf employer", "employer pf"]);
    const tableGratuity = findAnnualTableAmount(text, ["gratuity"]);
    const tableInsurance = findAnnualTableAmount(text, ["insurance premium", "medical insurance", "health insurance", "insurance benefit"]);
    const tableOtherCtc = findAnnualTableAmount(text, ["other ctc benefits", "other ctc component", "other benefits"]);
    const compensation: OfferCompensation = {
        ...EMPTY_OFFER_COMPENSATION,
        statedCtcAnnual: tableCtc || findAmount(text, ["total cost to company", "annual ctc", "total ctc", "cost to company"]),
        basicAnnual: tableBasic || findAmount(text, ["basic salary", "basic pay", "annual basic"]),
        annualGrossSalary: tableGross || findAmount(text, ["annual gross salary", "gross annual salary", "gross salary", "annual fixed pay", "fixed compensation", "total fixed pay", "fixed pay"]),
        annualVariablePay: tableVariablePay || findAmount(text, ["variable pay", "annual incentive", "target bonus"]),
        performanceBonusAnnual: tablePerformanceBonus || findAmount(text, ["performance bonus"]),
        performanceBonusPayoutPercent: 0,
        joiningBonus: tableJoiningBonus || findAmount(text, ["joining bonus", "sign on bonus", "sign-on bonus"]),
        retentionBonus: tableRetentionBonus || findAmount(text, ["retention bonus"]),
        retentionPayoutPercent: 100,
        employerPfAnnual: tableEmployerPf || findAmount(text, ["employer pf", "employer provident fund", "company contribution to pf"]),
        employeePfAnnual: tableEmployeePf || findAmount(text, ["employee pf", "employee provident fund", "employee contribution to pf"]),
        gratuityAnnual: tableGratuity || findAmount(text, ["gratuity"]),
        insuranceBenefitsAnnual: tableInsurance || findAmount(text, ["insurance premium", "medical insurance", "health insurance", "insurance benefit"]),
        otherCtcAnnual: tableOtherCtc || findAmount(text, ["other ctc benefits", "other ctc component", "other benefits"]),
        variablePayoutPercent: findPercentage(text, ["variable pay", "performance bonus", "target bonus"]),
    };

    if (compensation.statedCtcAnnual) {
        const componentTotal =
            compensation.annualGrossSalary +
            compensation.annualVariablePay +
            compensation.joiningBonus +
            compensation.retentionBonus +
            compensation.employerPfAnnual +
            compensation.gratuityAnnual +
            compensation.insuranceBenefitsAnnual +
            compensation.otherCtcAnnual;
        if (componentTotal > compensation.statedCtcAnnual * 1.05) {
            compensation.annualGrossSalary = 0;
        }
    }

    if (!compensation.employeePfAnnual && compensation.basicAnnual) {
        compensation.employeePfAnnual = roundCurrency(compensation.basicAnnual * 0.12);
        compensation.employeePfWasEstimated = true;
    }

    if (!compensation.annualGrossSalary && compensation.statedCtcAnnual) {
        const nonCashAndConditional =
            compensation.annualVariablePay +
            compensation.joiningBonus +
            compensation.retentionBonus +
            compensation.employerPfAnnual +
            compensation.gratuityAnnual +
            compensation.insuranceBenefitsAnnual +
            compensation.otherCtcAnnual;
        compensation.annualGrossSalary = Math.max(0, compensation.statedCtcAnnual - nonCashAndConditional);
        compensation.grossWasEstimated = true;
    }

    return compensation;
}

function snippetAround(text: string, pattern: RegExp, radius = 150): string {
    const match = pattern.exec(text);
    if (!match || match.index === undefined) return "";
    const start = Math.max(0, match.index - radius);
    const end = Math.min(text.length, match.index + match[0].length + radius);
    return cleanText(`${start > 0 ? "..." : ""}${text.slice(start, end)}${end < text.length ? "..." : ""}`);
}

function addFinding(
    findings: OfferFinding[],
    severity: OfferFindingSeverity,
    title: string,
    explanation: string,
    excerpt: string,
    question: string,
) {
    if (findings.some((finding) => finding.title === title)) return;
    findings.push({
        id: `${severity}-${findings.length + 1}-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
        severity,
        title,
        explanation,
        excerpt,
        question,
    });
}

function scanFindings(text: string, compensation: OfferCompensation, noticeDays: number): OfferFinding[] {
    const findings: OfferFinding[] = [];
    const source = cleanText(text);

    const bondPattern = /service bond|service agreement|minimum service period|liquidated damages|training (?:cost|expense)[^.\n]{0,80}(?:repay|recover|refund)/i;
    if (bondPattern.test(source)) addFinding(findings, "warning", "Service commitment or bond", "This may require repayment or damages if you leave before a stated period. Verify amount, trigger, pro-rating, and enforceability with a qualified employment lawyer.", snippetAround(source, bondPattern), "What exact amount is repayable, does it reduce monthly, and which exits waive it?");

    const clawbackPattern = /(?:joining|sign-on|retention) bonus[^.\n]{0,180}(?:repay|repaid|repayment|refund|recover|reimburse|clawback)|(?:repay|repaid|repayment|refund|recover|reimburse)[^.\n]{0,180}(?:joining|sign-on|retention) bonus/i;
    if (clawbackPattern.test(source)) addFinding(findings, "warning", "Bonus clawback", "A one-time bonus may need to be returned if you leave or are terminated within a defined window. Check whether repayment is gross or net of tax.", snippetAround(source, clawbackPattern), "Is repayment based on the gross or post-tax bonus, and is it waived for employer-initiated termination?");

    const nonCompetePattern = /non[- ]compete|restriction on competition|shall not (?:join|work for|engage with)[^.\n]{0,120}(?:competitor|competing)/i;
    if (nonCompetePattern.test(source)) addFinding(findings, "warning", "Post-employment non-compete", "The clause may limit future work by time, geography, industry, or customer. Its enforceability is fact-specific; obtain legal advice before relying on assumptions.", snippetAround(source, nonCompetePattern), "What duration, geography, competitors, and activities does this restriction actually cover?");

    const nonSolicitPattern = /non[- ]solicitation|shall not[^.\n]{0,180}(?:solicit|entice|hire)[^.\n]{0,120}(?:customer|employee)/i;
    if (nonSolicitPattern.test(source)) addFinding(findings, "warning", "Post-employment non-solicit restrictions", "Customer and employee restrictions can continue well after exit and may be broader than the role requires. Review duration, definitions, and permitted professional contact.", snippetAround(source, nonSolicitPattern), "Which customers and employees are restricted, for how long, and does ordinary professional networking count as solicitation?");

    const settlementForfeitPattern = /forfeit[^.\n]{0,180}(?:full and final|settlement|pending salary|reimbursement)|(?:full and final|settlement)[^.\n]{0,180}forfeit/i;
    if (settlementForfeitPattern.test(source)) addFinding(findings, "warning", "Full-and-final settlement forfeiture", "The letter claims the company may withhold earned salary, reimbursements, or other dues for notice non-compliance, including in some employer-initiated exits. This is a material financial and legal risk requiring written clarification and qualified legal review.", snippetAround(source, settlementForfeitPattern, 240), "Please remove or narrow the forfeiture language and confirm that earned salary and statutory dues will be paid regardless of separation type.");

    const documentsWithheldPattern = /no\s+obligation\s+to\s+issue\s+(?:an?\s+)?(?:experience|relieving|recommendation) letter|no\s+obligation\s+to\s+issue[\s\S]{0,260}?(?:experience|relieving|recommendation)|withhold[\s\S]{0,120}?(?:experience|relieving) letter/i;
    if (documentsWithheldPattern.test(source)) addFinding(findings, "warning", "Experience and relieving documents may be withheld", "The company reserves a right to withhold employment documents after a notice dispute. This can affect background verification and future joining.", snippetAround(source, documentsWithheldPattern, 220), "Under exactly which circumstances can experience or relieving documents be withheld, and can this clause be removed or limited?");

    if (noticeDays) {
        addFinding(
            findings,
            noticeDays > 90 ? "warning" : noticeDays > 60 ? "clarify" : "standard",
            `${noticeDays}-day notice period`,
            noticeDays > 90 ? "A long notice period can reduce mobility and may affect future joining timelines." : "Notice is a normal employment term, but check whether it is mutual and whether pay in lieu or buyout is allowed.",
            snippetAround(source, /notice period|notice of termination|termination notice/i),
            "Is the notice mutual, can either side pay in lieu, and is buyout permitted during probation and after confirmation?",
        );
    } else {
        addFinding(findings, "clarify", "Notice period not detected", "The parser could not find a clear notice period. This affects exit timing and future job switches.", "", "Please confirm the notice period during and after probation, plus buyout terms.");
    }

    const probationNotice = source.match(/probation[\s\S]{0,420}?either party[\s\S]{0,140}?(\d+)\s*(?:\([a-z]+\))?\s*days?'?[\s\S]{0,40}?(?:written )?notice/i);
    if (probationNotice && Number(probationNotice[1]) !== noticeDays) addFinding(findings, "clarify", "Different notice period during probation", `The probation notice appears to be ${probationNotice[1]} days, while the post-confirmation notice appears to be ${noticeDays || "different"} days.`, snippetAround(source, /probation[^.\n]{0,180}notice/i), "Please confirm the employee and employer notice periods during probation and after written confirmation, including pay-in-lieu or buyout rights.");

    const probationExtensionPattern = /probation[^.\n]{0,180}extend(?:ed)?[^.\n]{0,100}(?:discretion|management)/i;
    if (probationExtensionPattern.test(source)) addFinding(findings, "clarify", "Probation may be extended at management discretion", "The probation end may depend on written confirmation and can be extended without a stated maximum period or objective criteria.", snippetAround(source, probationExtensionPattern), "What is the maximum probation length, what criteria apply, and when will written confirmation be issued?");

    const discretionaryPattern = /(?:variable pay|bonus|incentive)[^.\n]{0,160}(?:discretion|not guaranteed|subject to|company performance|management decision)/i;
    if (discretionaryPattern.test(source)) addFinding(findings, "clarify", "Variable pay is conditional", "The displayed CTC may assume a payout that is not guaranteed. Ask for target, historical payout, eligibility, timing, and treatment on exit.", snippetAround(source, discretionaryPattern), "What was the average payout for this role/team in the last two cycles, and must I be employed on payout day?");

    const terminationPattern = /terminate[^.\n]{0,130}(?:without notice|without cause|immediately)|summary dismissal/i;
    if (terminationPattern.test(source)) addFinding(findings, "warning", "Immediate termination language", "The employer may reserve broad immediate-termination rights. Review the listed triggers, due process, and final-pay treatment.", snippetAround(source, terminationPattern), "Which specific events permit termination without notice, and is there an investigation or response process?");

    const transferPattern = /transfer[^.\n]{0,160}(?:location|office|department|affiliate|group company)|liable to be transferred|work at any location/i;
    if (transferPattern.test(source)) addFinding(findings, "clarify", "Broad transfer or location right", "The employer may change your city, entity, team, or assignment. Confirm practical limits and relocation support.", snippetAround(source, transferPattern), "Can location or employing entity change without consent, and what relocation support applies?");

    const shiftPattern = /night shift|rotational shift|shift timing|work shifts|24x7/i;
    if (shiftPattern.test(source)) addFinding(findings, "clarify", "Shift flexibility expected", "Hours may include rotating, late, weekend, or client-aligned shifts. Confirm actual schedule, transport, allowance, and change notice.", snippetAround(source, shiftPattern), "What are the normal and maximum shift windows, frequency of rotation, transport, and shift allowance?");

    const exclusivityPattern = /exclusive employment|outside employment|moonlighting|other employment|prior written (?:consent|approval)[^.\n]{0,100}(?:work|employment|business)/i;
    if (exclusivityPattern.test(source)) addFinding(findings, "clarify", "Outside-work restriction", "Side projects, freelancing, directorships, or teaching may need approval. Clarify whether non-commercial portfolio work is allowed.", snippetAround(source, exclusivityPattern), "Are open-source, portfolio, teaching, or non-competing side projects permitted with disclosure?");

    const payConfidentialityPattern = /(?:remuneration|compensation)[^.\n]{0,160}confidential|shall not divulge[^.\n]{0,120}(?:remuneration|compensation)/i;
    if (payConfidentialityPattern.test(source)) addFinding(findings, "clarify", "Compensation confidentiality restriction", "The letter restricts disclosure of compensation or employment terms. Clarify permitted disclosure to family, legal/tax advisers, lenders, regulators, and where protected by law.", snippetAround(source, payConfidentialityPattern), "Please confirm the permitted disclosures and that this clause does not restrict legal rights or required disclosures.");

    const policyChangePattern = /polic(?:y|ies)[\s\S]{0,160}?(?:amended|changed|modified)[\s\S]{0,80}?time to time/i;
    if (policyChangePattern.test(source)) addFinding(findings, "clarify", "Employment policies may change over time", "Important leave, bonus, conduct, or benefit terms may sit outside the letter and change under company policy.", snippetAround(source, policyChangePattern), "Please share the current HR, leave, incentive, ESOP, and retention policies and explain how material changes are communicated.");

    const nonDisparagementPattern = /shall not at any time[\s\S]{0,180}?(?:disparage|defame|denigrate)/i;
    if (nonDisparagementPattern.test(source)) addFinding(findings, "clarify", "Ongoing non-disparagement obligation", "The restriction appears to continue during and after employment and may be drafted broadly. It should not prevent truthful statements, protected disclosures, legal claims, or cooperation with authorities.", snippetAround(source, nonDisparagementPattern), "Please confirm express exceptions for truthful statements, legal rights, protected disclosures, and regulatory or court processes.");

    const ipPattern = /intellectual property|work product|invention assignment|proprietary rights/i;
    if (ipPattern.test(source)) addFinding(findings, "standard", "Intellectual-property assignment", "Work created in employment is commonly assigned to the employer, but overbroad language can touch pre-existing or personal projects.", snippetAround(source, ipPattern), "Can pre-existing projects be listed in an annexure and are unrelated personal projects excluded?");

    const backgroundPattern = /background verification|background check|reference check|contingent upon.*verification/i;
    if (backgroundPattern.test(source)) addFinding(findings, "standard", "Offer is verification-dependent", "The offer can remain conditional until education, employment, identity, or reference checks finish. Ensure dates and documents match your application.", snippetAround(source, backgroundPattern), "Which checks remain pending and when does the offer become unconditional?");

    const arbitrationPattern = /arbitration|exclusive jurisdiction|governing law/i;
    if (arbitrationPattern.test(source)) addFinding(findings, "clarify", "Dispute forum is specified", "The document may choose arbitration, governing law, or a court location that affects cost and process if a dispute arises.", snippetAround(source, arbitrationPattern), "Which law, city, language, cost-sharing rule, and dispute process apply?");

    const reviewPattern = /salary review|compensation review|annual appraisal|performance review/i;
    if (reviewPattern.test(source)) addFinding(findings, "positive", "Compensation review is mentioned", "A review process is useful, but it is not necessarily a guaranteed increase. Confirm first eligibility date and cycle rules.", snippetAround(source, reviewPattern), "When is my first eligible review and is any increase guaranteed or solely performance/budget dependent?");

    const insurancePattern = /medical insurance|health insurance|group insurance|family coverage/i;
    if (insurancePattern.test(source)) addFinding(findings, "positive", "Insurance benefit is mentioned", "Insurance adds value beyond cash compensation. Verify coverage, dependants, waiting periods, co-pay, and whether premium is included in CTC.", snippetAround(source, insurancePattern), "What is the sum insured, dependant coverage, co-pay, and employee premium contribution?");

    const flexiblePattern = /hybrid|work from home|remote work|flexible working/i;
    if (flexiblePattern.test(source)) addFinding(findings, "positive", "Flexible work language is present", "The offer references hybrid, remote, or flexible work. Confirm whether this is contractual or policy-based and therefore changeable.", snippetAround(source, flexiblePattern), "How many office days are expected, which office applies, and can the policy change unilaterally?");

    const variableShare = compensation.statedCtcAnnual ? compensation.annualVariablePay / compensation.statedCtcAnnual : 0;
    if (variableShare >= 0.2) addFinding(findings, "warning", "Large variable-pay share", `${Math.round(variableShare * 100)}% of stated CTC appears variable, so guaranteed monthly cash may be materially lower than the headline package.`, "", "Can more of the package move into fixed gross salary, or is a first-year minimum payout guaranteed?");
    else if (compensation.annualVariablePay > 0 && !discretionaryPattern.test(source)) addFinding(findings, "clarify", "Variable-pay mechanics need confirmation", "Variable pay was detected, but target rules and payout conditions may not be fully clear from the parsed text.", "", "Please share the variable-pay policy, target formula, payout frequency, and historical payout range.");

    if ((compensation.performanceBonusAnnual ?? 0) > 0) addFinding(findings, "warning", "Large discretionary performance bonus outside fixed salary", `${formatInr(compensation.performanceBonusAnnual)} is described separately and subject to individual, organizational, and management discretion. The calculator defaults its expected payout to 0% until evidence supports another assumption.`, snippetAround(source, /performance bonus[^.\n]{0,220}/i), "Is this amount inside or outside stated CTC, what were actual payouts for comparable employees, and which objective formula determines payment?");
    if ((compensation.retentionBonus ?? 0) > 0) addFinding(findings, "clarify", "Retention bonus requires continuous service", `${formatInr(compensation.retentionBonus)} appears payable only after completing the stated service period and policy conditions.`, snippetAround(source, /retention bonus[^.\n]{0,220}/i), "What exact service date, active-employment requirement, repayment rule, and termination treatment apply to the retention bonus?");

    if (compensation.employerPfAnnual || compensation.gratuityAnnual || compensation.insuranceBenefitsAnnual) {
        addFinding(findings, "standard", "CTC includes non-monthly components", "Employer PF, gratuity, and insurance may add long-term value but are not normal monthly bank-credit amounts.", "", "Can HR share a sample monthly payslip showing employee deductions and recurring net pay?");
    }

    if (!compensation.statedCtcAnnual && !compensation.annualGrossSalary) addFinding(findings, "clarify", "Compensation breakup not detected", "No reliable CTC or annual gross number was found. Do not rely on the take-home estimate until the salary table is entered manually.", "", "Please provide annual fixed gross, variable target, employer contributions, gratuity, insurance, and monthly employee deductions separately.");
    if (compensation.grossWasEstimated) addFinding(findings, "clarify", "Cash gross was inferred from CTC", "The parser estimated annual cash gross by subtracting detected non-cash and conditional components from stated CTC. Verify it against the employer's salary annexure.", "", "Is the annual gross salary shown here the amount before employee PF, professional tax, and TDS?");

    return findings.sort((left, right) => {
        const order: Record<OfferFindingSeverity, number> = { warning: 0, clarify: 1, standard: 2, positive: 3 };
        return order[left.severity] - order[right.severity];
    });
}

export function parseOfferLetter(text: string, job?: JobRecord, fileName = "Pasted offer letter"): OfferAnalysis {
    const source = cleanText(text).slice(0, 150_000);
    const compensation = compensationFromText(source);
    const noticeDays = findConfirmedNoticeDays(source) || findDurationDays(source, "notice(?: period)?");
    const probationMonths = findProbationMonths(source);

    return {
        id: `offer-${Date.now()}`,
        source: job ? "tracked" : "standalone",
        jobId: job?.id ?? "",
        fileName,
        rawText: source,
        analyzedAt: new Date().toISOString(),
        details: {
            company: job?.company ?? "",
            role: job?.title ?? "",
            location: job?.location ?? "",
            workMode: findWorkMode(source),
            joiningDate: findDate(source, ["date of joining", "joining date", "joining on or before", "start date", "commencement date"]),
            acceptanceDeadline: findDate(source, ["acceptance", "accept this offer", "accept the offer", "valid until", "offer expiry"]),
            probationMonths,
            noticeDays,
        },
        compensation,
        findings: scanFindings(source, compensation, noticeDays),
        negotiation: { ...EMPTY_NEGOTIATION_INPUTS },
        notes: "",
    };
}

export function refreshOfferFindings(offer: OfferAnalysis): OfferAnalysis {
    return {
        ...offer,
        analyzedAt: new Date().toISOString(),
        findings: scanFindings(offer.rawText, offer.compensation, offer.details.noticeDays),
    };
}

function slabTax(income: number, slabs: TaxSlab[]): number {
    let tax = 0;
    let lower = 0;
    for (const slab of slabs) {
        if (income <= lower) break;
        tax += Math.min(income, slab.upper) - lower > 0 ? (Math.min(income, slab.upper) - lower) * slab.rate : 0;
        lower = slab.upper;
    }
    return roundCurrency(tax);
}

function surchargeRate(income: number, regime: TaxRegime): number {
    if (income > 50_000_000) return regime === "new" ? 0.25 : 0.37;
    if (income > 20_000_000) return 0.25;
    if (income > 10_000_000) return 0.15;
    if (income > 5_000_000) return 0.1;
    return 0;
}

export function calculateTakeHome(compensation: OfferCompensation, regime: TaxRegime): TakeHomeEstimate {
    const expectedVariablePay = roundCurrency(
        (compensation.annualVariablePay ?? 0) * Math.min(100, Math.max(0, compensation.variablePayoutPercent ?? 100)) / 100 +
        (compensation.performanceBonusAnnual ?? 0) * Math.min(100, Math.max(0, compensation.performanceBonusPayoutPercent ?? 0)) / 100,
    );
    const expectedRetentionPay = roundCurrency(
        (compensation.retentionBonus ?? 0) * Math.min(100, Math.max(0, compensation.retentionPayoutPercent ?? 100)) / 100,
    );
    const annualCashGross = roundCurrency(
        compensation.annualGrossSalary +
        expectedVariablePay +
        compensation.joiningBonus +
        expectedRetentionPay +
        compensation.otherTaxableIncomeAnnual,
    );
    const standardDeduction = regime === "new" ? NEW_REGIME_STANDARD_DEDUCTION : OLD_REGIME_STANDARD_DEDUCTION;
    const additionalDeductions = regime === "old" ? compensation.oldRegimeDeductionsAnnual : 0;
    const taxableIncome = roundCurrency(annualCashGross - standardDeduction - additionalDeductions);
    const normalTax = slabTax(taxableIncome, regime === "new" ? NEW_REGIME_SLABS : OLD_REGIME_SLABS);

    let incomeTaxBeforeCess = normalTax;
    if (regime === "new") {
        if (taxableIncome <= NEW_REGIME_REBATE_LIMIT) incomeTaxBeforeCess = 0;
        else incomeTaxBeforeCess = Math.min(normalTax, taxableIncome - NEW_REGIME_REBATE_LIMIT);
    } else if (taxableIncome <= OLD_REGIME_REBATE_LIMIT) {
        incomeTaxBeforeCess = Math.max(0, normalTax - Math.min(normalTax, 12_500));
    }

    const surchargeRateValue = surchargeRate(taxableIncome, regime);
    const surcharge = roundCurrency(incomeTaxBeforeCess * surchargeRateValue);
    const cess = roundCurrency((incomeTaxBeforeCess + surcharge) * CESS_RATE);
    const annualTax = roundCurrency(incomeTaxBeforeCess + surcharge + cess);
    const annualProfessionalTax = roundCurrency(compensation.professionalTaxMonthly * 12);
    const annualOtherDeductions = roundCurrency(compensation.otherDeductionMonthly * 12);
    const annualNetCash = roundCurrency(
        annualCashGross - annualTax - compensation.employeePfAnnual - annualProfessionalTax - annualOtherDeductions,
    );
    const averageMonthlyEquivalent = roundCurrency(annualNetCash / 12);
    const regularMonthlyInHand = roundCurrency(
        compensation.annualGrossSalary / 12 -
        compensation.employeePfAnnual / 12 -
        compensation.professionalTaxMonthly -
        compensation.otherDeductionMonthly -
        annualTax / 12,
    );
    const assumptions = [
        `FY 2026-27 ${regime === "new" ? "new/default" : "old"} regime for a resident salaried individual below 60.`,
        `${regime === "new" ? "₹75,000" : "₹50,000"} salary standard deduction applied.`,
        `In-CTC variable pay assumed at ${Math.round(compensation.variablePayoutPercent ?? 100)}% and additional performance bonus at ${Math.round(compensation.performanceBonusPayoutPercent ?? 0)}%.`,
        `Retention bonus assumed at ${Math.round(compensation.retentionPayoutPercent ?? 100)}% and included only in the annual/monthly-equivalent view, not regular monthly salary.`,
        "Salary/bonus treated as normal-rate income; no capital gains, crypto, lottery, rental, or other special-rate income included.",
        "Professional tax, PF, and other payroll deductions use the editable values above rather than state/employer guesses.",
    ];
    const warnings: string[] = [];
    if (!compensation.annualGrossSalary) warnings.push("Annual gross salary is zero; enter the recurring cash salary before relying on this result.");
    if (compensation.grossWasEstimated) warnings.push("Annual gross was inferred from CTC, not read as a confirmed salary-table value.");
    if (compensation.employeePfWasEstimated) warnings.push("Employee PF was estimated at 12% of annual basic pay; replace it with the employer's actual payroll deduction because statutory caps and company policy can differ.");
    if (taxableIncome > 5_000_000) warnings.push("Surcharge is approximated, but marginal relief at surcharge thresholds is not modeled; verify on the official Income Tax estimator.");
    if (regime === "old" && !compensation.oldRegimeDeductionsAnnual) warnings.push("Old-regime comparison includes only the ₹50,000 standard deduction because no eligible exemptions/deductions were entered.");

    return {
        regime,
        financialYear: "2026-27",
        annualCashGross,
        expectedVariablePay,
        taxableIncome,
        incomeTaxBeforeCess,
        surcharge,
        cess,
        annualTax,
        annualEmployeePf: compensation.employeePfAnnual,
        annualProfessionalTax,
        annualOtherDeductions,
        annualNetCash,
        regularMonthlyInHand,
        averageMonthlyEquivalent,
        effectiveTaxRate: annualCashGross ? annualTax / annualCashGross : 0,
        assumptions,
        warnings,
    };
}

function nearestThousand(value: number): number {
    return Math.max(0, Math.round(value / 1_000) * 1_000);
}

function offerAnnualValue(offer: OfferAnalysis): number {
    if (offer.compensation.statedCtcAnnual) return offer.compensation.statedCtcAnnual;
    return roundCurrency(
        offer.compensation.annualGrossSalary +
        offer.compensation.annualVariablePay +
        offer.compensation.joiningBonus +
        offer.compensation.retentionBonus +
        offer.compensation.employerPfAnnual +
        offer.compensation.gratuityAnnual +
        offer.compensation.insuranceBenefitsAnnual +
        offer.compensation.otherCtcAnnual,
    );
}

export function buildNegotiationAdvice(offer: OfferAnalysis): NegotiationAdvice {
    const inputs = offer.negotiation;
    const currentOffer = offerAnnualValue(offer);
    const hasMarketData = inputs.marketMedianAnnual > 0 || (inputs.marketMinimumAnnual > 0 && inputs.marketMaximumAnnual > 0);
    const marketReference = inputs.marketMedianAnnual || (inputs.marketMinimumAnnual + inputs.marketMaximumAnnual) / 2;
    const rationale: string[] = [];
    let recommendation: NegotiationAdvice["recommendation"] = "clarify-first";
    let marketPosition = "Add a credible market range before estimating negotiation headroom.";
    let suggestedAskLow = 0;
    let suggestedAskHigh = 0;

    if (!currentOffer) {
        rationale.push("Enter stated CTC or the full compensation breakup before discussing a number.");
    } else if (hasMarketData) {
        if (currentOffer < (inputs.marketMinimumAnnual || marketReference * 0.9)) {
            recommendation = "strong-case";
            marketPosition = "The offer is below the market range you entered.";
            suggestedAskLow = Math.max(currentOffer * 1.08, inputs.marketMinimumAnnual || marketReference * 0.9);
            suggestedAskHigh = Math.min(currentOffer * 1.2, Math.max(marketReference, suggestedAskLow));
            rationale.push("A market-gap discussion is reasonable if the sources match role level, location, company type, and fixed-versus-total pay.");
        } else if (currentOffer < marketReference * 0.97) {
            recommendation = "consider-asking";
            marketPosition = "The offer is below the midpoint of the market range you entered.";
            suggestedAskLow = Math.max(currentOffer * 1.05, Math.min(marketReference, currentOffer * 1.1));
            suggestedAskHigh = Math.min(currentOffer * 1.15, Math.max(marketReference, suggestedAskLow));
            rationale.push("There may be moderate room if your interview evidence and role scope support the market midpoint.");
        } else if (inputs.marketMaximumAnnual && currentOffer > inputs.marketMaximumAnnual) {
            recommendation = "optional";
            marketPosition = "The offer is above the market range you entered.";
            rationale.push("A salary ask is not necessary based on this range; focus on role clarity or non-cash terms only if they matter to you.");
        } else {
            recommendation = "optional";
            marketPosition = "The offer sits within the market range you entered.";
            suggestedAskLow = currentOffer * 1.04;
            suggestedAskHigh = currentOffer * 1.08;
            rationale.push("Negotiation is optional. A modest ask needs a role-scope, competing-offer, or specialist-skill reason rather than market data alone.");
        }
    }

    if (inputs.competingOfferAnnual > currentOffer && currentOffer > 0) {
        recommendation = recommendation === "strong-case" ? recommendation : "consider-asking";
        suggestedAskLow = Math.max(suggestedAskLow, inputs.competingOfferAnnual);
        suggestedAskHigh = Math.max(suggestedAskHigh, Math.min(inputs.competingOfferAnnual * 1.05, currentOffer * 1.2));
        rationale.push("A written competing offer is concrete leverage, but compare fixed pay, variable certainty, role quality, and location before quoting it.");
    }
    if (inputs.currentCtcAnnual > 0 && currentOffer > 0) {
        const hike = (currentOffer - inputs.currentCtcAnnual) / inputs.currentCtcAnnual;
        rationale.push(`The offer represents an approximately ${Math.round(hike * 100)}% change from the current CTC entered; CTC-to-CTC is only useful when both structures are comparable.`);
    }
    if (inputs.leverageNotes.trim()) rationale.push(`Candidate evidence: ${inputs.leverageNotes.trim()}`);

    suggestedAskLow = nearestThousand(suggestedAskLow);
    suggestedAskHigh = nearestThousand(Math.max(suggestedAskLow, suggestedAskHigh));
    const askText = suggestedAskLow
        ? suggestedAskLow === suggestedAskHigh
            ? formatInr(suggestedAskLow)
            : `${formatInr(suggestedAskLow)}-${formatInr(suggestedAskHigh)}`
        : "a compensation structure aligned with the role scope and verified market range";
    const companyName = offer.details.company || "the company";
    const companySentence = /[.!?]$/.test(companyName) ? companyName : `${companyName}.`;
    const hrReply = [
        "Subject: Offer discussion",
        "",
        "Hi [HR name],",
        "",
        `Thank you for sharing the offer for the ${offer.details.role || "role"} position at ${companySentence} I am genuinely excited about the opportunity and the team’s work.`,
        "",
        `After reviewing the role scope and compensation structure, could we discuss whether there is flexibility to move the total compensation toward ${askText}? My request is based on [relevant market sources / competing offer / role-specific evidence], especially [one or two concrete strengths].`,
        "",
        "I understand there may be an internal band, and I am open to discussing the fixed/variable mix, joining bonus, first review timeline, or other terms if the base band is fixed. This is a request for discussion, not a condition of my interest.",
        "",
        "Thank you again. I would be happy to discuss this briefly at your convenience.",
        "",
        "Best regards,",
        "[Your name]",
    ].join("\n");

    return {
        offerAnnual: currentOffer,
        marketPosition,
        recommendation,
        suggestedAskLow,
        suggestedAskHigh,
        rationale,
        nonCashOptions: [
            "Higher fixed pay or lower variable-pay share",
            "Joining bonus or guaranteed first-year variable payout",
            "Earlier written compensation review (for example, after 6 months)",
            "Role title, level, scope, reporting line, or learning budget",
            "Hybrid/remote terms, relocation support, leave, notice buyout, or joining date",
        ],
        hrReply,
    };
}

export function formatInr(value: number): string {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(roundCurrency(value));
}