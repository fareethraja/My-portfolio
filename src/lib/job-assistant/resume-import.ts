import type { CandidateProfile, EducationEntry, ExperienceEntry, ProjectEntry, SkillGroup } from "./types";

const SECTION_NAMES = [
    "summary",
    "profile",
    "objective",
    "professional summary",
    "skills",
    "core skills",
    "technical skills",
    "product skills",
    "core product skills",
    "experience",
    "work experience",
    "professional experience",
    "employment history",
    "projects",
    "product projects",
    "product case studies / projects",
    "education",
    "certifications",
    "achievements",
    "awards",
];

function cleanLine(line: string): string {
    return line.replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
}

function normalizedHeading(line: string): string {
    return cleanLine(line).replace(/[:\s]+$/, "").toLowerCase();
}

function isHeading(line: string): boolean {
    return SECTION_NAMES.includes(normalizedHeading(line));
}

function sectionMap(lines: string[]): Map<string, string[]> {
    const sections = new Map<string, string[]>();
    let current = "header";
    sections.set(current, []);
    for (const line of lines) {
        if (isHeading(line)) {
            current = normalizedHeading(line);
            sections.set(current, []);
            continue;
        }
        sections.get(current)?.push(line);
    }
    return sections;
}

function findSection(sections: Map<string, string[]>, names: string[]): string[] {
    for (const name of names) {
        const match = sections.get(name);
        if (match?.length) return match;
    }
    return [];
}

function bulletText(line: string): string {
    return cleanLine(line).replace(/^[•●▪◦*\-–—]+\s*/, "");
}

function hasBulletMarker(line: string): boolean {
    return /^[\s]*[•●▪◦*\-–—]\s+/.test(line);
}

function isPageArtifact(line: string): boolean {
    return /\b(?:resume|curriculum vitae|cv)\s+(?:page\s*)?\d+$/i.test(cleanLine(line)) || /^page\s+\d+(?:\s+of\s+\d+)?$/i.test(cleanLine(line));
}

function parseDatedEntries(lines: string[], kind: "experience" | "project"): Array<ExperienceEntry | ProjectEntry> {
    const entries: Array<ExperienceEntry | ProjectEntry> = [];
    let heading = "";
    let bullets: string[] = [];

    function flush() {
        if (!heading && !bullets.length) return;
        const parts = heading.split(/\s*[|·]\s*/).map(cleanLine).filter(Boolean);
        const datePart = parts.find((part) => /(?:19|20)\d{2}|present|current/i.test(part)) ?? "";
        const labels = parts.filter((part) => part !== datePart);
        if (kind === "experience") {
            entries.push({
                id: `imported-experience-${entries.length + 1}`,
                role: labels[0] || "Professional Experience",
                company: labels[1] || "",
                location: labels[2] || "",
                startDate: datePart,
                endDate: "",
                bullets: bullets.length ? bullets : [heading].filter(Boolean),
            });
        } else {
            entries.push({
                id: `imported-project-${entries.length + 1}`,
                name: labels[0] || "Project",
                subtitle: labels[1] || "",
                dates: datePart,
                bullets: bullets.length ? bullets : [heading].filter(Boolean),
            });
        }
        heading = "";
        bullets = [];
    }

    for (const rawLine of lines) {
        const line = cleanLine(rawLine);
        if (!line || isPageArtifact(line)) continue;
        if (hasBulletMarker(rawLine)) {
            bullets.push(bulletText(line));
            continue;
        }
        if (bullets.length) {
            if (line.includes("|")) {
                flush();
                heading = line;
            } else {
                bullets[bullets.length - 1] = `${bullets[bullets.length - 1]} ${line}`;
            }
            continue;
        }
        heading = heading ? `${heading} ${line}` : line;
    }
    flush();
    return entries;
}

function parseSkills(lines: string[]): SkillGroup[] {
    const groups: SkillGroup[] = [];
    lines.forEach((rawLine) => {
        const line = bulletText(rawLine);
        const [possibleName, ...rest] = line.split(":");
        const hasNamedGroup = rest.length > 0;
        const value = hasNamedGroup ? rest.join(":") : possibleName;
        const items = value.split(/[,;|•]/).map(cleanLine).filter(Boolean);
        if (hasBulletMarker(rawLine) || hasNamedGroup || !groups.length) {
            groups.push({
                id: `imported-skills-${groups.length + 1}`,
                name: hasNamedGroup ? cleanLine(possibleName) : "Core Skills",
                items,
            });
        } else if (items.length) {
            groups[groups.length - 1].items.push(...items);
        }
    });
    if (!groups.length) return [{ id: "skills-core", name: "Core Skills", items: [] }];
    return groups;
}

function parseEducation(lines: string[]): EducationEntry[] {
    const entries: string[] = [];
    const usesBullets = lines.some(hasBulletMarker);
    for (const rawLine of lines) {
        const line = bulletText(rawLine);
        if (!line || isPageArtifact(line)) continue;
        if (!usesBullets || hasBulletMarker(rawLine) || !entries.length) entries.push(line);
        else entries[entries.length - 1] = `${entries[entries.length - 1]} ${line}`;
    }
    return entries
        .map((line, index) => {
            const parts = line.split(/\s*[|·]\s*/).map(cleanLine).filter(Boolean);
            return {
                id: `imported-education-${index + 1}`,
                institution: parts[0] || line,
                qualification: parts[1] || "",
                dates: parts.find((part) => /(?:19|20)\d{2}|present|current/i.test(part)) ?? "",
                detail: parts.slice(2).filter((part) => !/(?:19|20)\d{2}|present|current/i.test(part)).join(" | "),
            };
        });
}

function extractUrl(text: string, host: string): string {
    return text.match(new RegExp(`https?:\\/\\/[^\\s|]*${host}[^\\s|]*`, "i"))?.[0] ?? "";
}

export function importProfileFromText(text: string, current: CandidateProfile): CandidateProfile {
    const lines = text.split(/\r?\n/).map(cleanLine).filter((line) => line && !isPageArtifact(line));
    const sections = sectionMap(lines);
    const header = sections.get("header") ?? [];
    const firstLine = header.find((line) => !/@|https?:|\+?\d[\d\s()-]{7}/.test(line));
    const fullName = firstLine?.replace(/\s+([A-Z])$/, (suffix, initial: string) => firstLine.charAt(0).toUpperCase() === initial ? "" : suffix).trim();
    const email = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] ?? "";
    const phone = text.match(/(?:\+?\d[\d\s()-]{8,}\d)/)?.[0]?.trim() ?? "";
    const summaryLines = findSection(sections, ["professional summary", "summary", "profile", "objective"]);
    const skillLines = findSection(sections, ["core product skills", "product skills", "technical skills", "core skills", "skills"]);
    const experienceLines = findSection(sections, ["professional experience", "work experience", "experience", "employment history"]);
    const projectLines = findSection(sections, ["product case studies / projects", "product projects", "projects"]);
    const educationLines = findSection(sections, ["education"]);
    const certifications = findSection(sections, ["certifications"]).map(bulletText).filter(Boolean);
    const achievements = findSection(sections, ["achievements", "awards"]).map(bulletText).filter(Boolean);
    const parsedExperiences = parseDatedEntries(experienceLines, "experience") as ExperienceEntry[];
    const parsedProjects = parseDatedEntries(projectLines, "project") as ProjectEntry[];
    const contactLine = header.find((line) => line.includes("|") && (line.includes("@") || /\+?\d[\d\s()-]{7}/.test(line))) ?? "";
    const inferredLocation = contactLine.split("|").map(cleanLine).find((part) => part && !/@|\+?\d/.test(part)) ?? "";
    const headlineIndex = header.findIndex((line) => line !== firstLine && line.length >= 12 && line.length < 100 && !/@|https?:/.test(line));
    const headlineParts = headlineIndex >= 0 ? [header[headlineIndex]] : [];
    if (headlineIndex >= 0 && header[headlineIndex + 1]?.length < 50 && !/[.!?]$/.test(header[headlineIndex + 1]) && !/@|https?:/.test(header[headlineIndex + 1])) {
        headlineParts.push(header[headlineIndex + 1]);
    }
    const inferredSummary = headlineIndex >= 0
        ? header.slice(headlineIndex + headlineParts.length).filter((line) => !/@|https?:/.test(line)).join(" ")
        : "";

    return {
        ...current,
        fullName: fullName || current.fullName,
        email: email || current.email,
        phone: phone || current.phone,
        linkedin: extractUrl(text, "linkedin.com") || current.linkedin,
        github: extractUrl(text, "github.com") || current.github,
        portfolio: extractUrl(text, "vercel.app") || current.portfolio,
        location: inferredLocation || current.location,
        headline: headlineParts.join(" ") || current.headline,
        summary: summaryLines.join(" ") || inferredSummary || current.summary,
        sourceText: text.slice(0, 80_000),
        skillGroups: skillLines.length ? parseSkills(skillLines) : current.skillGroups,
        experiences: parsedExperiences.length ? parsedExperiences : current.experiences,
        projects: parsedProjects.length ? parsedProjects : current.projects,
        education: educationLines.length ? parseEducation(educationLines) : current.education,
        certifications: certifications.length ? certifications : current.certifications,
        achievements: achievements.length ? achievements : current.achievements,
    };
}