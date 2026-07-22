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
    "experience",
    "work experience",
    "professional experience",
    "employment history",
    "projects",
    "product projects",
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
        if (!line) continue;
        if (hasBulletMarker(rawLine) || (bullets.length > 0 && line.length > 55)) {
            bullets.push(bulletText(line));
            continue;
        }
        if (heading || bullets.length) flush();
        heading = line;
    }
    flush();
    return entries;
}

function parseSkills(lines: string[]): SkillGroup[] {
    const groups: SkillGroup[] = [];
    lines.forEach((line, index) => {
        const [possibleName, ...rest] = line.split(":");
        const hasNamedGroup = rest.length > 0;
        const value = hasNamedGroup ? rest.join(":") : possibleName;
        const items = value.split(/[,;|•]/).map(cleanLine).filter(Boolean);
        if (items.length) {
            groups.push({
                id: `imported-skills-${index + 1}`,
                name: hasNamedGroup ? cleanLine(possibleName) : "Core Skills",
                items,
            });
        }
    });
    if (!groups.length) return [{ id: "skills-core", name: "Core Skills", items: [] }];
    return groups;
}

function parseEducation(lines: string[]): EducationEntry[] {
    return lines
        .map(cleanLine)
        .filter(Boolean)
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
    const lines = text.split(/\r?\n/).map(cleanLine).filter(Boolean);
    const sections = sectionMap(lines);
    const header = sections.get("header") ?? [];
    const firstLine = header.find((line) => !/@|https?:|\+?\d[\d\s()-]{7}/.test(line));
    const email = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] ?? "";
    const phone = text.match(/(?:\+?\d[\d\s()-]{8,}\d)/)?.[0]?.trim() ?? "";
    const summaryLines = findSection(sections, ["professional summary", "summary", "profile", "objective"]);
    const skillLines = findSection(sections, ["product skills", "technical skills", "core skills", "skills"]);
    const experienceLines = findSection(sections, ["professional experience", "work experience", "experience", "employment history"]);
    const projectLines = findSection(sections, ["product projects", "projects"]);
    const educationLines = findSection(sections, ["education"]);
    const certifications = findSection(sections, ["certifications"]).map(bulletText).filter(Boolean);
    const achievements = findSection(sections, ["achievements", "awards"]).map(bulletText).filter(Boolean);
    const parsedExperiences = parseDatedEntries(experienceLines, "experience") as ExperienceEntry[];
    const parsedProjects = parseDatedEntries(projectLines, "project") as ProjectEntry[];

    return {
        ...current,
        fullName: firstLine || current.fullName,
        email: email || current.email,
        phone: phone || current.phone,
        linkedin: extractUrl(text, "linkedin.com") || current.linkedin,
        github: extractUrl(text, "github.com") || current.github,
        portfolio: extractUrl(text, "vercel.app") || current.portfolio,
        headline: header.find((line) => line !== firstLine && line.length >= 12 && !line.includes("@") && !line.includes("http")) || current.headline,
        summary: summaryLines.join(" ") || current.summary,
        sourceText: text.slice(0, 80_000),
        skillGroups: skillLines.length ? parseSkills(skillLines) : current.skillGroups,
        experiences: parsedExperiences.length ? parsedExperiences : current.experiences,
        projects: parsedProjects.length ? parsedProjects : current.projects,
        education: educationLines.length ? parseEducation(educationLines) : current.education,
        certifications: certifications.length ? certifications : current.certifications,
        achievements: achievements.length ? achievements : current.achievements,
    };
}