import {
    AlignmentType,
    BorderStyle,
    Document,
    ExternalHyperlink,
    HeadingLevel,
    LevelFormat,
    Packer,
    Paragraph,
    TabStopPosition,
    TabStopType,
    TextRun,
} from "docx";

import type { CandidateProfile, TailoredResume } from "./types";

const NAVY = "18302A";
const GRAY = "4B5563";
const SECTION_BORDER = { style: BorderStyle.SINGLE, size: 5, color: "96A39D", space: 2 };

function safeFilename(value: string): string {
    return value
        .replace(/[^a-z0-9]+/gi, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 70) || "Tailored-Resume";
}

function link(label: string, url: string): ExternalHyperlink | TextRun {
    if (!url) return new TextRun({ text: label, size: 18, color: GRAY });
    return new ExternalHyperlink({
        link: url,
        children: [new TextRun({ text: label, size: 18, color: "245D47", underline: {} })],
    });
}

function sectionTitle(text: string): Paragraph {
    return new Paragraph({
        heading: HeadingLevel.HEADING_2,
        border: { bottom: SECTION_BORDER },
        spacing: { before: 130, after: 55 },
        children: [new TextRun({ text, bold: true, color: NAVY, size: 20, allCaps: true })],
    });
}

function bullet(text: string): Paragraph {
    return new Paragraph({
        numbering: { reference: "resume-bullets", level: 0 },
        spacing: { after: 28, line: 235 },
        children: [new TextRun({ text, size: 18, color: "111827" })],
    });
}

function roleHeader(role: string, company: string, dates: string, location = ""): Paragraph {
    return new Paragraph({
        tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
        spacing: { before: 55, after: 25 },
        children: [
            new TextRun({ text: role, bold: true, size: 19, color: "111827" }),
            new TextRun({ text: company ? ` | ${company}` : "", size: 19, color: "111827" }),
            new TextRun({ text: location ? ` | ${location}` : "", size: 18, color: GRAY }),
            new TextRun({ text: `\t${dates}`, size: 18, color: GRAY }),
        ],
    });
}

export async function buildResumeDocx(profile: CandidateProfile, resume: TailoredResume): Promise<{ blob: Blob; filename: string }> {
    const children: Paragraph[] = [
        new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 20 },
            children: [new TextRun({ text: profile.fullName, bold: true, color: NAVY, size: 30 })],
        }),
        new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 35 },
            children: [new TextRun({ text: resume.headline, bold: true, color: "245D47", size: 19 })],
        }),
        new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 30 },
            children: [
                new TextRun({ text: [profile.location, profile.phone, profile.email].filter(Boolean).join(" | "), size: 18, color: GRAY }),
            ],
        }),
        new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 65 },
            children: [
                link("Portfolio", profile.portfolio),
                new TextRun({ text: " | ", size: 18, color: GRAY }),
                link("LinkedIn", profile.linkedin),
                new TextRun({ text: profile.github ? " | " : "", size: 18, color: GRAY }),
                ...(profile.github ? [link("GitHub", profile.github)] : []),
            ],
        }),
        sectionTitle("Professional Summary"),
        new Paragraph({ spacing: { after: 45, line: 235 }, children: [new TextRun({ text: resume.summary, size: 18, color: "111827" })] }),
        sectionTitle("Core Skills"),
        ...resume.skillGroups
            .filter((group) => group.items.length)
            .map((group) => new Paragraph({
                spacing: { after: 28, line: 225 },
                children: [
                    new TextRun({ text: `${group.name}: `, bold: true, size: 18, color: "111827" }),
                    new TextRun({ text: group.items.join(", "), size: 18, color: "111827" }),
                ],
            })),
        sectionTitle("Experience"),
    ];

    resume.experiences.forEach((experience) => {
        children.push(roleHeader(experience.role, experience.company, [experience.startDate, experience.endDate].filter(Boolean).join(" - "), experience.location));
        children.push(...experience.bullets.map(bullet));
    });

    if (resume.projects.length) {
        children.push(sectionTitle("Selected Projects"));
        resume.projects.forEach((project) => {
            children.push(roleHeader(project.name, project.subtitle, project.dates));
            children.push(...project.bullets.map(bullet));
        });
    }

    if (resume.education.length) {
        children.push(sectionTitle("Education"));
        resume.education.forEach((education) => {
            children.push(roleHeader(education.qualification, education.institution, education.dates));
            if (education.detail) {
                children.push(new Paragraph({ spacing: { after: 20 }, children: [new TextRun({ text: education.detail, size: 18, color: GRAY })] }));
            }
        });
    }

    if (resume.certifications.length) {
        children.push(sectionTitle("Certifications"), ...resume.certifications.map(bullet));
    }
    if (resume.achievements.length) {
        children.push(sectionTitle("Achievements"), ...resume.achievements.map(bullet));
    }

    const document = new Document({
        numbering: {
            config: [{
                reference: "resume-bullets",
                levels: [{
                    level: 0,
                    format: LevelFormat.BULLET,
                    text: "•",
                    alignment: AlignmentType.LEFT,
                    style: { paragraph: { indent: { left: 300, hanging: 180 } } },
                }],
            }],
        },
        styles: {
            default: {
                document: { run: { font: "Aptos", size: 18, color: "111827" } },
            },
        },
        sections: [{
            properties: {
                page: {
                    margin: { top: 620, right: 650, bottom: 620, left: 650 },
                },
            },
            children,
        }],
    });

    const blob = await Packer.toBlob(document);
    return {
        blob,
        filename: safeFilename(`${profile.fullName}-${resume.targetCompany || resume.targetTitle}-Resume`) + ".docx",
    };
}

function escapeHtml(value: string): string {
    return value.replace(/[&<>'"]/g, (character) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;",
    })[character] ?? character);
}

export function openResumePrintView(profile: CandidateProfile, resume: TailoredResume): boolean {
    const popup = window.open("", "_blank", "noopener,noreferrer");
    if (!popup) return false;

    const section = (title: string, content: string) => `<section><h2>${escapeHtml(title)}</h2>${content}</section>`;
    const bullets = (values: string[]) => `<ul>${values.map((value) => `<li>${escapeHtml(value)}</li>`).join("")}</ul>`;
    const experiences = resume.experiences.map((experience) => `
        <div class="entry"><div class="entry-head"><strong>${escapeHtml(experience.role)}${experience.company ? ` | ${escapeHtml(experience.company)}` : ""}</strong><span>${escapeHtml([experience.startDate, experience.endDate].filter(Boolean).join(" - "))}</span></div>${bullets(experience.bullets)}</div>
    `).join("");
    const projects = resume.projects.map((project) => `
        <div class="entry"><div class="entry-head"><strong>${escapeHtml(project.name)}${project.subtitle ? ` | ${escapeHtml(project.subtitle)}` : ""}</strong><span>${escapeHtml(project.dates)}</span></div>${bullets(project.bullets)}</div>
    `).join("");
    const education = resume.education.map((item) => `
        <div class="entry"><div class="entry-head"><strong>${escapeHtml(item.qualification)} | ${escapeHtml(item.institution)}</strong><span>${escapeHtml(item.dates)}</span></div><p>${escapeHtml(item.detail)}</p></div>
    `).join("");

    popup.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(profile.fullName)} Resume</title><style>
        @page{size:A4;margin:12mm 14mm}*{box-sizing:border-box}body{margin:0;color:#17211c;font:10.2pt/1.34 Arial,sans-serif}header{text-align:center}h1{margin:0;font-size:20pt;letter-spacing:0}header h3{margin:3px 0;color:#245d47;font-size:10.5pt}header p{margin:3px 0;color:#4b5563;font-size:9pt}a{color:#245d47}section{break-inside:auto}h2{margin:9px 0 4px;border-bottom:1px solid #7f8c86;color:#18302a;font-size:10.5pt;letter-spacing:.05em;text-transform:uppercase}p{margin:3px 0}.entry{break-inside:avoid;margin:4px 0}.entry-head{display:flex;justify-content:space-between;gap:12px}.entry-head span{white-space:nowrap;color:#4b5563}ul{margin:2px 0 4px;padding-left:18px}li{margin:1.5px 0}.skills p{margin:2px 0}@media screen{body{max-width:210mm;margin:24px auto;padding:14mm;box-shadow:0 2px 24px #0002}}
    </style></head><body><header><h1>${escapeHtml(profile.fullName)}</h1><h3>${escapeHtml(resume.headline)}</h3><p>${escapeHtml([profile.location, profile.phone, profile.email].filter(Boolean).join(" | "))}</p><p>${[profile.portfolio, profile.linkedin, profile.github].filter(Boolean).map((url) => `<a href="${escapeHtml(url)}">${escapeHtml(url)}</a>`).join(" | ")}</p></header>
    ${section("Professional Summary", `<p>${escapeHtml(resume.summary)}</p>`)}
    ${section("Core Skills", `<div class="skills">${resume.skillGroups.filter((group) => group.items.length).map((group) => `<p><strong>${escapeHtml(group.name)}:</strong> ${escapeHtml(group.items.join(", "))}</p>`).join("")}</div>`)}
    ${section("Experience", experiences)}
    ${resume.projects.length ? section("Selected Projects", projects) : ""}
    ${resume.education.length ? section("Education", education) : ""}
    ${resume.certifications.length ? section("Certifications", bullets(resume.certifications)) : ""}
    ${resume.achievements.length ? section("Achievements", bullets(resume.achievements)) : ""}
    <script>window.addEventListener('load',()=>setTimeout(()=>window.print(),250));<\/script></body></html>`);
    popup.document.close();
    return true;
}

export function downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
}