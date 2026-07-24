import type { CandidateProfile, ExperienceEntry, ProjectEntry, SkillGroup, TailoredResume } from "./types";

export type ResumeChangeKind = "unchanged" | "edited" | "added" | "omitted" | "reordered";

export type ComparedText = {
    text: string;
    counterpart: string;
    change: ResumeChangeKind;
};

export type ComparedGroup = {
    id: string;
    name: string;
    change: ResumeChangeKind;
    items: ComparedText[];
};

export type ComparedEntry = {
    id: string;
    title: string;
    subtitle: string;
    dates: string;
    change: ResumeChangeKind;
    bullets: ComparedText[];
};

export type ComparedResumeSide = {
    headline: ComparedText;
    summary: ComparedText;
    skillGroups: ComparedGroup[];
    experiences: ComparedEntry[];
    projects: ComparedEntry[];
};

export type ResumeComparison = {
    original: ComparedResumeSide;
    tailored: ComparedResumeSide;
    counts: Record<Exclude<ResumeChangeKind, "unchanged">, number>;
};

function normalize(value: string): string {
    return value.toLowerCase().replace(/[^a-z0-9+#.]+/g, " ").replace(/\s+/g, " ").trim();
}

function similarity(left: string, right: string): number {
    const leftWords = new Set(normalize(left).split(" ").filter((word) => word.length > 2));
    const rightWords = new Set(normalize(right).split(" ").filter((word) => word.length > 2));
    if (!leftWords.size || !rightWords.size) return 0;
    const intersection = [...leftWords].filter((word) => rightWords.has(word)).length;
    return (2 * intersection) / (leftWords.size + rightWords.size);
}

function compareField(original: string, tailored: string): { original: ComparedText; tailored: ComparedText } {
    const change: ResumeChangeKind = normalize(original) === normalize(tailored) ? "unchanged" : "edited";
    return {
        original: { text: original, counterpart: tailored, change },
        tailored: { text: tailored, counterpart: original, change },
    };
}

function compareTextLists(original: string[], tailored: string[]): { original: ComparedText[]; tailored: ComparedText[] } {
    const originalResults: Array<ComparedText | undefined> = Array(original.length);
    const tailoredResults: Array<ComparedText | undefined> = Array(tailored.length);
    const usedOriginal = new Set<number>();
    const usedTailored = new Set<number>();
    const exactPairs: Array<{ originalIndex: number; tailoredIndex: number }> = [];

    tailored.forEach((value, tailoredIndex) => {
        const originalIndex = original.findIndex((candidate, index) => !usedOriginal.has(index) && normalize(candidate) === normalize(value));
        if (originalIndex < 0) return;
        exactPairs.push({ originalIndex, tailoredIndex });
        usedOriginal.add(originalIndex);
        usedTailored.add(tailoredIndex);
    });

    exactPairs.forEach(({ originalIndex, tailoredIndex }) => {
        const reordered = exactPairs.some((other) =>
            (originalIndex - other.originalIndex) * (tailoredIndex - other.tailoredIndex) < 0,
        );
        const change: ResumeChangeKind = reordered ? "reordered" : "unchanged";
        const value = tailored[tailoredIndex];
        originalResults[originalIndex] = { text: original[originalIndex], counterpart: value, change };
        tailoredResults[tailoredIndex] = { text: value, counterpart: original[originalIndex], change };
    });

    tailored.forEach((value, tailoredIndex) => {
        if (usedTailored.has(tailoredIndex)) return;
        const candidates = original
            .map((candidate, originalIndex) => ({ originalIndex, score: usedOriginal.has(originalIndex) ? 0 : similarity(candidate, value) }))
            .sort((left, right) => right.score - left.score);
        const best = candidates[0];
        if (!best || best.score < 0.5) return;
        const originalValue = original[best.originalIndex];
        originalResults[best.originalIndex] = { text: originalValue, counterpart: value, change: "edited" };
        tailoredResults[tailoredIndex] = { text: value, counterpart: originalValue, change: "edited" };
        usedOriginal.add(best.originalIndex);
        usedTailored.add(tailoredIndex);
    });

    original.forEach((value, index) => {
        if (!originalResults[index]) originalResults[index] = { text: value, counterpart: "", change: "omitted" };
    });
    tailored.forEach((value, index) => {
        if (!tailoredResults[index]) tailoredResults[index] = { text: value, counterpart: "", change: "added" };
    });

    return {
        original: originalResults as ComparedText[],
        tailored: tailoredResults as ComparedText[],
    };
}

function relativeReorder(id: string, originalIds: string[], tailoredIds: string[]): boolean {
    const commonIds = new Set(originalIds.filter((candidate) => tailoredIds.includes(candidate)));
    const originalOrder = originalIds.filter((candidate) => commonIds.has(candidate));
    const tailoredOrder = tailoredIds.filter((candidate) => commonIds.has(candidate));
    return originalOrder.indexOf(id) !== tailoredOrder.indexOf(id);
}

function groupChange(originalName: string, tailoredName: string, reordered: boolean): ResumeChangeKind {
    if (normalize(originalName) !== normalize(tailoredName)) return "edited";
    return reordered ? "reordered" : "unchanged";
}

function compareSkillGroups(original: SkillGroup[], tailored: SkillGroup[]): { original: ComparedGroup[]; tailored: ComparedGroup[] } {
    const tailoredById = new Map(tailored.map((group) => [group.id, group]));
    const originalById = new Map(original.map((group) => [group.id, group]));
    const originalIds = original.map((group) => group.id);
    const tailoredIds = tailored.map((group) => group.id);

    return {
        original: original.map((group) => {
            const match = tailoredById.get(group.id);
            if (!match) return { id: group.id, name: group.name, change: "omitted", items: group.items.map((text) => ({ text, counterpart: "", change: "omitted" })) };
            const items = compareTextLists(group.items, match.items);
            return { id: group.id, name: group.name, change: groupChange(group.name, match.name, relativeReorder(group.id, originalIds, tailoredIds)), items: items.original };
        }),
        tailored: tailored.map((group) => {
            const match = originalById.get(group.id);
            if (!match) return { id: group.id, name: group.name, change: "added", items: group.items.map((text) => ({ text, counterpart: "", change: "added" })) };
            const items = compareTextLists(match.items, group.items);
            return { id: group.id, name: group.name, change: groupChange(match.name, group.name, relativeReorder(group.id, originalIds, tailoredIds)), items: items.tailored };
        }),
    };
}

type ComparableEntry = ExperienceEntry | ProjectEntry;

function entryTitle(entry: ComparableEntry): string {
    return "role" in entry ? entry.role : entry.name;
}

function entrySubtitle(entry: ComparableEntry): string {
    return "company" in entry ? entry.company : entry.subtitle;
}

function entryDates(entry: ComparableEntry): string {
    return "startDate" in entry ? [entry.startDate, entry.endDate].filter(Boolean).join(" - ") : entry.dates;
}

function compareEntries(original: ComparableEntry[], tailored: ComparableEntry[]): { original: ComparedEntry[]; tailored: ComparedEntry[] } {
    const tailoredById = new Map(tailored.map((entry) => [entry.id, entry]));
    const originalById = new Map(original.map((entry) => [entry.id, entry]));
    const originalIds = original.map((entry) => entry.id);
    const tailoredIds = tailored.map((entry) => entry.id);

    function status(left: ComparableEntry, right: ComparableEntry): ResumeChangeKind {
        const metadataChanged = [entryTitle(left), entrySubtitle(left), entryDates(left)].some((value, index) => normalize(value) !== normalize([entryTitle(right), entrySubtitle(right), entryDates(right)][index]));
        if (metadataChanged) return "edited";
        return relativeReorder(left.id, originalIds, tailoredIds) ? "reordered" : "unchanged";
    }

    return {
        original: original.map((entry) => {
            const match = tailoredById.get(entry.id);
            if (!match) return { id: entry.id, title: entryTitle(entry), subtitle: entrySubtitle(entry), dates: entryDates(entry), change: "omitted", bullets: entry.bullets.map((text) => ({ text, counterpart: "", change: "omitted" })) };
            const bullets = compareTextLists(entry.bullets, match.bullets);
            return { id: entry.id, title: entryTitle(entry), subtitle: entrySubtitle(entry), dates: entryDates(entry), change: status(entry, match), bullets: bullets.original };
        }),
        tailored: tailored.map((entry) => {
            const match = originalById.get(entry.id);
            if (!match) return { id: entry.id, title: entryTitle(entry), subtitle: entrySubtitle(entry), dates: entryDates(entry), change: "added", bullets: entry.bullets.map((text) => ({ text, counterpart: "", change: "added" })) };
            const bullets = compareTextLists(match.bullets, entry.bullets);
            return { id: entry.id, title: entryTitle(entry), subtitle: entrySubtitle(entry), dates: entryDates(entry), change: status(match, entry), bullets: bullets.tailored };
        }),
    };
}

export function compareResume(profile: CandidateProfile, resume: TailoredResume): ResumeComparison {
    const headline = compareField(profile.headline, resume.headline);
    const summary = compareField(profile.summary, resume.summary);
    const skills = compareSkillGroups(profile.skillGroups, resume.skillGroups);
    const experiences = compareEntries(profile.experiences, resume.experiences);
    const projects = compareEntries(profile.projects, resume.projects);
    const original: ComparedResumeSide = { headline: headline.original, summary: summary.original, skillGroups: skills.original, experiences: experiences.original, projects: projects.original };
    const tailored: ComparedResumeSide = { headline: headline.tailored, summary: summary.tailored, skillGroups: skills.tailored, experiences: experiences.tailored, projects: projects.tailored };
    const counts: ResumeComparison["counts"] = { edited: 0, added: 0, omitted: 0, reordered: 0 };

    const record = (change: ResumeChangeKind) => { if (change !== "unchanged") counts[change] += 1; };
    [tailored.headline, tailored.summary].forEach((item) => record(item.change));
    tailored.skillGroups.forEach((group) => { record(group.change); group.items.forEach((item) => record(item.change)); });
    tailored.experiences.forEach((entry) => { record(entry.change); entry.bullets.forEach((item) => record(item.change)); });
    tailored.projects.forEach((entry) => { record(entry.change); entry.bullets.forEach((item) => record(item.change)); });
    original.skillGroups.forEach((group) => { if (group.change === "omitted") record("omitted"); group.items.filter((item) => item.change === "omitted").forEach(() => record("omitted")); });
    original.experiences.forEach((entry) => { if (entry.change === "omitted") record("omitted"); entry.bullets.filter((item) => item.change === "omitted").forEach(() => record("omitted")); });
    original.projects.forEach((entry) => { if (entry.change === "omitted") record("omitted"); entry.bullets.filter((item) => item.change === "omitted").forEach(() => record("omitted")); });

    return { original, tailored, counts };
}