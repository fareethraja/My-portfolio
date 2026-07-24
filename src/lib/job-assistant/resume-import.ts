import type { AdditionalProfileSection, CandidateProfile, EducationEntry, ExperienceEntry, ProjectEntry, SkillGroup } from "./types";

const SECTION_ALIASES: Record<string, string[]> = {
    summary: ["summary", "professional summary", "profile", "profile summary", "personal profile", "career objective", "objective", "career summary", "executive summary", "about me"],
    skills: ["skills", "core skills", "technical skills", "product skills", "core product skills", "core competencies", "key skills", "areas of expertise", "tools and technologies", "professional skills", "skill set", "technical competencies", "expertise"],
    experience: ["experience", "work experience", "professional experience", "employment history", "career history", "internships and experience", "work history", "experience and internships", "professional background", "employment experience"],
    projects: ["projects", "product projects", "product case studies / projects", "academic projects", "personal projects", "selected projects", "portfolio projects", "key projects", "project experience", "projects undertaken", "case studies and projects"],
    education: ["education", "academic background", "educational qualifications", "qualifications", "education and qualifications", "education details", "academic qualifications", "educational background", "academic record", "education history"],
    certifications: ["certifications", "professional certifications", "licenses and certifications", "licences and certifications", "certificates", "credentials", "certifications and licenses", "certificates and credentials", "professional credentials"],
    courses: ["courses", "relevant coursework", "training", "courses and training", "professional development", "completed courses", "coursework", "training programs", "learning and development", "courses completed"],
    achievements: ["achievements", "awards", "honors", "honours", "awards and achievements", "accomplishments", "notable achievements", "recognition", "awards and honors", "awards and honours", "key achievements", "distinctions"],
    languages: ["languages", "language proficiency", "languages known", "language skills", "known languages", "communication languages"],
    volunteering: ["volunteer experience", "community involvement", "volunteering", "social work", "volunteer work", "leadership and volunteering", "community service", "volunteer activities", "civic engagement", "nonprofit experience"],
    publications: ["publications", "articles", "research publications", "papers", "writing"],
    memberships: ["memberships", "professional memberships", "associations"],
    activities: ["activities", "extracurricular activities", "co-curricular activities", "leadership activities"],
    interests: ["interests", "hobbies", "interests and hobbies"],
    ignore: ["declaration", "references", "personal declaration", "personal details", "additional information"],
};

const ADDITIONAL_SECTION_NAMES: Record<string, string> = {
    languages: "Languages",
    volunteering: "Volunteer Experience",
    publications: "Publications",
    memberships: "Memberships",
    activities: "Activities",
    interests: "Interests",
};

function cleanLine(line: string): string {
    return line.replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
}

function normalizedHeading(line: string): string {
    return cleanLine(line)
        .replace(/[:\s]+$/, "")
        .toLowerCase()
        .replace(/&/g, " and ")
        .replace(/\s*\/\s*/g, " / ")
        .replace(/\s+/g, " ")
        .trim();
}

function sectionKey(line: string): string | null {
    const heading = normalizedHeading(line);
    for (const [key, aliases] of Object.entries(SECTION_ALIASES)) {
        if (aliases.some((alias) => normalizedHeading(alias) === heading)) return key;
    }
    return null;
}

function sectionMap(lines: string[]): Map<string, string[]> {
    const sections = new Map<string, string[]>();
    let current = "header";
    sections.set(current, []);
    for (const line of lines) {
        const heading = sectionKey(line);
        if (heading) {
            current = heading;
            if (!sections.has(current)) sections.set(current, []);
            continue;
        }
        sections.get(current)?.push(line);
    }
    return sections;
}

function findSection(sections: Map<string, string[]>, name: string): string[] {
    return sections.get(name) ?? [];
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

function containsDate(value: string): boolean {
    return /(?:19|20)\d{2}|present|current/i.test(value);
}

function looksLikeEntryStart(lines: string[], index: number): boolean {
    const line = cleanLine(lines[index] ?? "");
    if (!line) return false;
    if (line.includes("|") || /\s+at\s+/i.test(line) || containsDate(line)) return true;
    return [lines[index + 1], lines[index + 2]].some((candidate) => containsDate(candidate ?? ""));
}

function parseDateRange(value: string): { startDate: string; endDate: string; dateText: string } {
    const match = value.match(/((?:[A-Za-z]{3,9}\s+)?(?:19|20)\d{2})\s*(?:-|–|—|to)\s*(Present|Current|(?:[A-Za-z]{3,9}\s+)?(?:19|20)\d{2})/i);
    if (match) return { startDate: cleanLine(match[1]), endDate: cleanLine(match[2]), dateText: match[0] };
    const single = value.match(/(?:[A-Za-z]{3,9}\s+)?(?:19|20)\d{2}|Present|Current/i)?.[0] ?? "";
    return { startDate: cleanLine(single), endDate: "", dateText: single };
}

function parseDatedEntries(lines: string[], kind: "experience" | "project"): Array<ExperienceEntry | ProjectEntry> {
    const entries: Array<ExperienceEntry | ProjectEntry> = [];
    let heading = "";
    let bullets: string[] = [];

    function flush() {
        if (!heading && !bullets.length) return;
        const dates = parseDateRange(heading);
        const withoutDates = dates.dateText ? heading.replace(dates.dateText, "") : heading;
        let labels = withoutDates.split(/\s*[|·]\s*/).map(cleanLine).filter(Boolean);
        if (labels.length === 1 && /\s+at\s+/i.test(labels[0])) labels = labels[0].split(/\s+at\s+/i).map(cleanLine).filter(Boolean);
        if (kind === "experience") {
            entries.push({
                id: `imported-experience-${entries.length + 1}`,
                role: labels[0] || "Professional Experience",
                company: labels[1] || "",
                location: labels[2] || "",
                startDate: dates.startDate,
                endDate: dates.endDate,
                bullets: bullets.length ? bullets : [heading].filter(Boolean),
            });
        } else {
            entries.push({
                id: `imported-project-${entries.length + 1}`,
                name: labels[0] || "Project",
                subtitle: labels[1] || "",
                dates: [dates.startDate, dates.endDate].filter(Boolean).join(" - "),
                bullets: bullets.length ? bullets : [heading].filter(Boolean),
            });
        }
        heading = "";
        bullets = [];
    }

    for (let index = 0; index < lines.length; index += 1) {
        const rawLine = lines[index];
        const line = cleanLine(rawLine);
        if (!line || isPageArtifact(line)) continue;
        if (hasBulletMarker(rawLine)) {
            bullets.push(bulletText(line));
            continue;
        }
        if (bullets.length) {
            if (looksLikeEntryStart(lines, index)) {
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

function parseListItems(lines: string[]): string[] {
    const items: string[] = [];
    const usesBullets = lines.some(hasBulletMarker);
    for (const rawLine of lines) {
        const line = bulletText(rawLine);
        if (!line || isPageArtifact(line)) continue;
        if (!usesBullets || hasBulletMarker(rawLine) || !items.length) items.push(line);
        else items[items.length - 1] = `${items[items.length - 1]} ${line}`;
    }
    return items;
}

function parseAdditionalSections(sections: Map<string, string[]>): AdditionalProfileSection[] {
    return Object.entries(ADDITIONAL_SECTION_NAMES).flatMap(([key, name]) => {
        const items = parseListItems(findSection(sections, key));
        return items.length ? [{ id: `imported-${key}`, name, items }] : [];
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
    const summaryLines = findSection(sections, "summary");
    const skillLines = findSection(sections, "skills");
    const experienceLines = findSection(sections, "experience");
    const projectLines = findSection(sections, "projects");
    const educationLines = findSection(sections, "education");
    const certifications = parseListItems(findSection(sections, "certifications"));
    const courses = parseListItems(findSection(sections, "courses"));
    const achievements = parseListItems(findSection(sections, "achievements"));
    const additionalSections = parseAdditionalSections(sections);
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
        courses: courses.length ? courses : current.courses,
        achievements: achievements.length ? achievements : current.achievements,
        additionalSections: additionalSections.length ? additionalSections : current.additionalSections,
    };
}