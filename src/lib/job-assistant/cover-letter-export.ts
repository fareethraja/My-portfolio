import {
    AlignmentType,
    Document,
    ExternalHyperlink,
    Packer,
    Paragraph,
    TextRun,
} from "docx";

import { escapeHtml, openPrintDocument, type PrintWindowFactory } from "./print-export";
import type { CandidateProfile, CoverLetterDraft } from "./types";

const NAVY = "18302A";
const GRAY = "4B5563";

function safeFilename(value: string): string {
    return value.replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "").slice(0, 70) || "Cover-Letter";
}

function textParagraph(value: string, spacingAfter = 150): Paragraph {
    return new Paragraph({
        spacing: { after: spacingAfter, line: 300 },
        children: [new TextRun({ text: value, size: 21, color: "111827" })],
    });
}

function contactLink(label: string, value: string): ExternalHyperlink | TextRun {
    if (!value) return new TextRun({ text: "", size: 18 });
    const link = value.includes("@") ? `mailto:${value}` : value;
    return new ExternalHyperlink({
        link,
        children: [new TextRun({ text: label, size: 18, color: "245D47", underline: {} })],
    });
}

export async function buildCoverLetterDocx(
    profile: CandidateProfile,
    letter: CoverLetterDraft,
): Promise<{ blob: Blob; filename: string }> {
    const children: Paragraph[] = [
        new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { after: 25 },
            children: [new TextRun({ text: profile.fullName, bold: true, size: 28, color: NAVY })],
        }),
        new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { after: 25 },
            children: [new TextRun({ text: [profile.location, profile.phone].filter(Boolean).join(" | "), size: 18, color: GRAY })],
        }),
        new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { after: 180 },
            children: [
                contactLink(profile.email, profile.email),
                new TextRun({ text: profile.linkedin ? " | " : "", size: 18, color: GRAY }),
                contactLink("LinkedIn", profile.linkedin),
            ],
        }),
        ...letter.recipient.split("\n").filter(Boolean).map((line) => textParagraph(line, 20)),
        new Paragraph({ spacing: { before: 120, after: 150 }, children: [new TextRun({ text: `Subject: ${letter.subject}`, bold: true, size: 21, color: NAVY })] }),
        textParagraph(letter.salutation),
        ...letter.body.split(/\n{2,}/).map((paragraph) => textParagraph(paragraph)),
        ...letter.signOff.split("\n").filter(Boolean).map((line, index) => new Paragraph({
            spacing: { before: index === 0 ? 100 : 0, after: 20 },
            children: [new TextRun({ text: line, bold: index > 0, size: 21, color: index > 0 ? NAVY : "111827" })],
        })),
    ];
    const document = new Document({
        styles: { default: { document: { run: { font: "Aptos", size: 21, color: "111827" } } } },
        sections: [{
            properties: { page: { margin: { top: 850, right: 900, bottom: 850, left: 900 } } },
            children,
        }],
    });

    return {
        blob: await Packer.toBlob(document),
        filename: `${safeFilename(`${profile.fullName}-${letter.targetCompany || letter.targetTitle}-Cover-Letter`)}.docx`,
    };
}

function linesHtml(value: string): string {
    return value.split("\n").filter(Boolean).map((line) => `<div>${escapeHtml(line)}</div>`).join("");
}

export function openCoverLetterPrintView(
    profile: CandidateProfile,
    letter: CoverLetterDraft,
    openWindow?: PrintWindowFactory,
): boolean {
    const paragraphs = letter.body.split(/\n{2,}/).map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br>")}</p>`).join("");
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(profile.fullName)} Cover Letter</title><style>
        @page{size:A4;margin:18mm 20mm}*{box-sizing:border-box}body{margin:0;color:#17211c;font:11pt/1.58 Arial,sans-serif}.page{max-width:170mm;margin:0 auto}.sender{text-align:right}.sender h1{margin:0;color:#18302a;font-size:18pt}.sender p{margin:3px 0;color:#4b5563;font-size:9.5pt}.recipient{margin-top:32px}.subject{margin:22px 0 18px;color:#18302a}p{margin:0 0 15px}.signoff{margin-top:20px}@media screen{body{background:#eef0ed;padding:24px}.page{min-height:257mm;background:white;padding:18mm 20mm;box-shadow:0 2px 24px #0002}}
    </style></head><body><main class="page"><header class="sender"><h1>${escapeHtml(profile.fullName)}</h1><p>${escapeHtml([profile.location, profile.phone, profile.email].filter(Boolean).join(" | "))}</p><p>${escapeHtml(profile.linkedin)}</p></header><section class="recipient">${linesHtml(letter.recipient)}</section><p class="subject"><strong>Subject: ${escapeHtml(letter.subject)}</strong></p><p>${escapeHtml(letter.salutation)}</p>${paragraphs}<section class="signoff">${linesHtml(letter.signOff)}</section></main><script>window.addEventListener('load',()=>setTimeout(()=>window.print(),250));<\/script></body></html>`;
    return openPrintDocument(html, openWindow);
}