from pathlib import Path

from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Inches, Pt, RGBColor
from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import KeepTogether, Paragraph, SimpleDocTemplate


OUTPUT_DIR = Path(__file__).resolve().parents[1] / "public" / "resume"
DOCX_PATH = OUTPUT_DIR / "fareeth-raja-resume-2026.docx"
PDF_PATH = OUTPUT_DIR / "fareeth-raja-resume-2026.pdf"

NAME = "Fareeth Raja"
TITLE = "ASSOCIATE PRODUCT MANAGER | AI + FINTECH PRODUCTS"
CONTACT = (
    "India | +91 9159469088 | fareethraja.26.careers@gmail.com | "
    "fareeth.vercel.app | linkedin.com/in/fareethraja | github.com/fareethraja"
)
SUMMARY = (
    "MBA Finance and Marketing graduate and technical product builder for AI and fintech products. "
    "Turns founder goals into requirements, user journeys, acceptance criteria, QA plans, and release-ready workflows."
)

SECTIONS = [
    (
        "CORE PRODUCT SKILLS",
        [
            "Product: requirements, PRDs, user stories, acceptance criteria, prioritization, roadmaps, stakeholder communication",
            "Technical: Next.js, React, TypeScript, Go, MySQL, REST and WebSocket APIs, OAuth, Razorpay, Docker, Git, Figma",
            "AI + Fintech: Azure OpenAI, multilingual chat UX, AI guardrails, screeners, backtesting, paper trading, analytics",
        ],
    ),
    (
        "EXPERIENCE",
        [
            (
                "Product Manager | Finverse client engagement via Bermer Software Limited | Feb 2026 - Present",
                [
                    "Own product planning for an AI-powered stock-market platform spanning Zeno AI, screeners, strategy builder, backtesting, paper trading, courses, checkout, and admin tools.",
                    "Translate founder requirements into specs, user journeys, edge cases, acceptance criteria, QA checks, and release priorities across frontend, backend, AI, payments, and admin modules.",
                    "Shape multilingual finance-assistant workflows with market-data enrichment, guest limits, rate limiting, tool-grounded responses, and safety guardrails.",
                    "Define and validate Razorpay checkout and course-access logic, including signature verification, coupons, webhooks, feature flags, and verified access states.",
                ],
            ),
            (
                "Product Intern | Bermer Software Limited / Niyantha Transits Private Limited | Jan 2026 - Present",
                [
                    "Converted early hardware/IoT product ideas into stakeholder-ready narratives, product positioning, and roadmap direction.",
                ],
            ),
            (
                "Product Manager (Technical) | KiddoFin | Bengaluru | Dec 2025 - Jan 2026",
                [
                    "Represented KiddoFin at Google as the primary product presenter, communicating product vision, user value, and stakeholder narrative.",
                    "Led website delivery, automated email onboarding, feature plans, and product pitches for an early-stage product.",
                ],
            ),
        ],
    ),
    (
        "SELECTED PRODUCT WORK",
        [
            (
                "Finverse | AI-powered Stock Market Super App | 2026",
                [
                    "Designed the core loop across AI, analysis, simulation, trading, courses, checkout, and verified access states. Case study: fareeth.vercel.app/work/finverse",
                ],
            ),
            (
                "SmartSlot | Mobile-first Dental Appointment PWA | 2025",
                [
                    "Built a mobile-first booking product with slot sharing, WhatsApp booking links, leave controls, and case tracking without patient login.",
                ],
            ),
        ],
    ),
    (
        "EDUCATION",
        [
            "Krupanidhi College of Management | MBA in Finance and Marketing | Gold Medalist | Oct 2024 - Aug 2026 | CGPA: 8.38/10 | Graduated Aug 8, 2026",
            "University of Madras, The New College | B.A. Economics, Gold Medalist | Oct 2021 - Apr 2024 | CGPA: 7.16/10",
        ],
    ),
    (
        "CERTIFICATIONS",
        [
            "Market Research for Product Management | UI/UX Design and Product Management with Figma | Power BI | Agile and Scrum fundamentals",
        ],
    ),
    (
        "ACHIEVEMENTS",
        [
            "Best Outgoing Student, MBA | Finance Gold Medalist | Gold Medalist, B.A. Economics | KiddoFin product presenter at Google | First prize: Apple brand story and Hybrid 2.0 concept | SDG Championship 2022 finalist",
        ],
    ),
]


def set_cell_border(paragraph):
    paragraph_format = paragraph.paragraph_format
    paragraph_format.space_before = Pt(9)
    paragraph_format.space_after = Pt(4)
    p_pr = paragraph._p.get_or_add_pPr()
    borders = OxmlElement("w:pBdr")
    bottom = OxmlElement("w:bottom")
    bottom.set(qn("w:val"), "single")
    bottom.set(qn("w:sz"), "8")
    bottom.set(qn("w:space"), "2")
    bottom.set(qn("w:color"), "1F4E79")
    borders.append(bottom)
    p_pr.append(borders)


def add_docx_text(paragraph, text, bold=False, size=10, color=None):
    run = paragraph.add_run(text)
    run.bold = bold
    run.font.name = "Aptos"
    run._element.rPr.rFonts.set(qn("w:eastAsia"), "Aptos")
    run.font.size = Pt(size)
    if color:
        run.font.color.rgb = RGBColor.from_string(color)
    return run


def add_docx_section(document, heading, entries):
    paragraph = document.add_paragraph()
    set_cell_border(paragraph)
    add_docx_text(paragraph, heading, bold=True, size=12.5, color="1F4E79")
    for entry in entries:
        if isinstance(entry, tuple):
            role, bullets = entry
            title = document.add_paragraph()
            title.paragraph_format.space_before = Pt(5)
            title.paragraph_format.space_after = Pt(2)
            add_docx_text(title, role, bold=True, size=10.5)
            for bullet in bullets:
                item = document.add_paragraph(style="List Bullet")
                item.paragraph_format.left_indent = Inches(0.17)
                item.paragraph_format.first_line_indent = Inches(-0.12)
                item.paragraph_format.space_before = Pt(0)
                item.paragraph_format.space_after = Pt(2)
                add_docx_text(item, bullet, size=10)
        else:
            item = document.add_paragraph(style="List Bullet")
            item.paragraph_format.left_indent = Inches(0.17)
            item.paragraph_format.first_line_indent = Inches(-0.12)
            item.paragraph_format.space_before = Pt(0)
            item.paragraph_format.space_after = Pt(2)
            add_docx_text(item, entry, size=10)


def build_docx():
    document = Document()
    section = document.sections[0]
    section.top_margin = Inches(0.4)
    section.bottom_margin = Inches(0.5)
    section.left_margin = Inches(0.42)
    section.right_margin = Inches(0.42)
    section.header_distance = Inches(0.2)
    section.footer_distance = Inches(0.2)

    normal = document.styles["Normal"]
    normal.font.name = "Aptos"
    normal._element.rPr.rFonts.set(qn("w:eastAsia"), "Aptos")
    normal.font.size = Pt(10)
    normal.paragraph_format.space_after = Pt(0)
    normal.paragraph_format.line_spacing = 1

    heading = document.add_paragraph()
    heading.alignment = WD_ALIGN_PARAGRAPH.CENTER
    heading.paragraph_format.space_after = Pt(1)
    add_docx_text(heading, NAME, bold=True, size=22, color="17365D")

    title = document.add_paragraph()
    title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    title.paragraph_format.space_after = Pt(2)
    add_docx_text(title, TITLE, bold=True, size=10.5, color="1F4E79")

    contact = document.add_paragraph()
    contact.alignment = WD_ALIGN_PARAGRAPH.CENTER
    contact.paragraph_format.space_after = Pt(4)
    add_docx_text(contact, CONTACT, size=9)

    summary = document.add_paragraph()
    summary.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    summary.paragraph_format.space_after = Pt(2)
    add_docx_text(summary, SUMMARY, size=10)

    for section_content in SECTIONS:
        add_docx_section(document, *section_content)
    document.save(DOCX_PATH)


def build_pdf():
    doc = SimpleDocTemplate(
        str(PDF_PATH),
        pagesize=letter,
        rightMargin=0.42 * inch,
        leftMargin=0.42 * inch,
        topMargin=0.4 * inch,
        bottomMargin=0.5 * inch,
        title="Fareeth Raja Product Resume",
        author="Fareeth Raja",
    )
    palette = {"navy": HexColor("#17365D"), "blue": HexColor("#1F4E79"), "black": HexColor("#111111")}
    styles = getSampleStyleSheet()
    name_style = ParagraphStyle("ResumeName", parent=styles["Normal"], fontName="Helvetica-Bold", fontSize=22, leading=24, alignment=TA_CENTER, textColor=palette["navy"], spaceAfter=1)
    title_style = ParagraphStyle("ResumeTitle", parent=styles["Normal"], fontName="Helvetica-Bold", fontSize=10.5, leading=12, alignment=TA_CENTER, textColor=palette["blue"], spaceAfter=3)
    contact_style = ParagraphStyle("ResumeContact", parent=styles["Normal"], fontName="Helvetica", fontSize=8.7, leading=10.5, alignment=TA_CENTER, textColor=palette["black"], spaceAfter=5)
    summary_style = ParagraphStyle("ResumeSummary", parent=styles["Normal"], fontName="Helvetica", fontSize=10, leading=12.2, alignment=TA_LEFT, spaceAfter=3)
    section_style = ParagraphStyle("ResumeSection", parent=styles["Normal"], fontName="Helvetica-Bold", fontSize=12.2, leading=15, textColor=palette["blue"], spaceBefore=8, spaceAfter=3, borderWidth=0.7, borderColor=palette["blue"], borderPadding=1, borderBottom=1)
    role_style = ParagraphStyle("ResumeRole", parent=styles["Normal"], fontName="Helvetica-Bold", fontSize=10.3, leading=12.5, spaceBefore=4, spaceAfter=2)
    bullet_style = ParagraphStyle("ResumeBullet", parent=styles["Normal"], fontName="Helvetica", fontSize=10, leading=12.1, leftIndent=10, firstLineIndent=-7, bulletIndent=0, spaceAfter=2)

    story = [
        Paragraph(NAME, name_style),
        Paragraph(TITLE, title_style),
        Paragraph(CONTACT, contact_style),
        Paragraph(SUMMARY, summary_style),
    ]
    for heading, entries in SECTIONS:
        group = [Paragraph(heading, section_style)]
        for entry in entries:
            if isinstance(entry, tuple):
                role, bullets = entry
                group.append(Paragraph(role, role_style))
                group.extend(Paragraph(bullet, bullet_style, bulletText="•") for bullet in bullets)
            else:
                group.append(Paragraph(entry, bullet_style, bulletText="•"))
        story.append(KeepTogether(group))
    doc.build(story)


if __name__ == "__main__":
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    build_docx()
    build_pdf()