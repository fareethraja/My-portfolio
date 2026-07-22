import {
    AlignmentType,
    BorderStyle,
    Document,
    ExternalHyperlink,
    HeadingLevel,
    LevelFormat,
    Packer,
    Paragraph,
    TextRun,
} from "docx";

import type { PreparationPlan } from "./types";

const GREEN = "18372D";
const ORANGE = "C9550A";
const GRAY = "5B6862";

function safeFilename(value: string): string {
    return value.replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "").slice(0, 90) || "Preparation-Guide";
}

function bullet(text: string): Paragraph {
    return new Paragraph({
        numbering: { reference: "prep-bullets", level: 0 },
        spacing: { after: 50, line: 240 },
        children: [new TextRun({ text, size: 20, color: "17211C" })],
    });
}

function smallHeading(text: string): Paragraph {
    return new Paragraph({
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 130, after: 55 },
        children: [new TextRun({ text, bold: true, color: ORANGE, size: 20 })],
    });
}

export async function buildPreparationGuideDocx(plan: PreparationPlan): Promise<{ blob: Blob; filename: string }> {
    const children: Paragraph[] = [
        new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 80 },
            children: [new TextRun({ text: `${plan.durationDays}-Day Preparation Guide`, bold: true, color: GREEN, size: 34 })],
        }),
        new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 40 },
            children: [new TextRun({ text: `${plan.jobTitle} · ${plan.company}`, bold: true, color: ORANGE, size: 23 })],
        }),
        new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 150 },
            children: [new TextRun({ text: "Placement Desk · Built by Fareeth Raja", color: GRAY, size: 18 })],
        }),
        new Paragraph({
            border: { bottom: { style: BorderStyle.SINGLE, size: 5, color: "96A39D", space: 2 } },
            spacing: { after: 90 },
            children: [new TextRun({ text: "HOW TO USE THIS GUIDE", bold: true, color: GREEN, size: 21 })],
        }),
        bullet("Read the concept notes before opening external resources. They contain the minimum knowledge you should be able to explain."),
        bullet("Answer practice questions aloud or on paper. Mark a task complete only after reviewing mistakes or weak explanations."),
        bullet("Resources deepen the topic; they do not replace role-specific examples from your own experience."),
    ];

    for (let day = 1; day <= plan.durationDays; day += 1) {
        const tasks = plan.tasks.filter((task) => task.day === day);
        if (!tasks.length) continue;
        children.push(new Paragraph({
            heading: HeadingLevel.HEADING_1,
            pageBreakBefore: day > 1,
            spacing: { before: 180, after: 90 },
            children: [new TextRun({ text: `Day ${day}`, bold: true, color: GREEN, size: 28 })],
        }));

        for (const task of tasks) {
            children.push(
                new Paragraph({
                    heading: HeadingLevel.HEADING_2,
                    spacing: { before: 140, after: 55 },
                    children: [new TextRun({ text: task.title, bold: true, color: GREEN, size: 23 })],
                }),
                new Paragraph({
                    spacing: { after: 55 },
                    children: [new TextRun({ text: `${task.category.toUpperCase()} · ${task.durationMinutes} minutes`, bold: true, color: GRAY, size: 18 })],
                }),
                new Paragraph({
                    spacing: { after: 80, line: 240 },
                    children: [new TextRun({ text: task.detail, size: 20, color: "17211C" })],
                }),
                smallHeading("Core knowledge"),
                ...task.studyNotes.map(bullet),
                smallHeading("Practice questions"),
                ...task.practiceQuestions.map((question, index) => bullet(`${index + 1}. ${question}`)),
                smallHeading("Study resources"),
            );

            for (const resource of task.resources) {
                children.push(new Paragraph({
                    spacing: { after: 35 },
                    children: [
                        new ExternalHyperlink({
                            link: resource.url,
                            children: [new TextRun({ text: `${resource.title} · ${resource.provider}`, bold: true, color: "245D47", underline: {}, size: 20 })],
                        }),
                    ],
                }));
                children.push(new Paragraph({
                    spacing: { after: 65 },
                    children: [new TextRun({ text: `${resource.note}\n${resource.url}`, color: GRAY, size: 18 })],
                }));
            }
        }
    }

    const document = new Document({
        numbering: {
            config: [{
                reference: "prep-bullets",
                levels: [{
                    level: 0,
                    format: LevelFormat.BULLET,
                    text: "•",
                    alignment: AlignmentType.LEFT,
                    style: { paragraph: { indent: { left: 360, hanging: 180 } } },
                }],
            }],
        },
        styles: { default: { document: { run: { font: "Aptos", size: 20, color: "17211C" } } } },
        sections: [{
            properties: { page: { margin: { top: 650, right: 700, bottom: 650, left: 700 } } },
            children,
        }],
    });

    return {
        blob: await Packer.toBlob(document),
        filename: `${safeFilename(`${plan.company}-${plan.jobTitle}-Preparation-Guide`)}.docx`,
    };
}