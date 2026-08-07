from pathlib import Path

from docx import Document
from docx.enum.section import WD_SECTION_START
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Inches, Pt, RGBColor
from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import KeepTogether, PageBreak, Paragraph, SimpleDocTemplate, Spacer


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
    "MBA Finance and Marketing candidate and technical product builder with hands-on ownership across "
    "AI, fintech, trading workflows, payments, onboarding, QA, and user-facing web products. "
    "Turns broad goals into requirements, user journeys, acceptance criteria, test plans, and release-ready workflows."
)

SECTIONS = [
    (
        "CORE PRODUCT SKILLS",
        [
            "Product: requirements, PRDs, user stories, acceptance criteria, prioritization, roadmaps, stakeholder communication, launch planning",
            "Technical: Next.js, React, TypeScript, Go, MySQL, REST and WebSocket APIs, OAuth, payments, Docker, Git, Figma",
            "AI + Fintech: Azure OpenAI, multilingual chat UX, AI guardrails, screeners, backtesting, paper trading, trading journals",
            "Analytics: activation, retention, conversion, funnels, Power BI, Excel, data visualization, market research",
        ],
    ),
    (
        "EXPERIENCE",
        [
            (
                "Product Manager | Finverse client engagement via Bermer Software Limited | Feb 2026 - Present",
                [
                    "Own product planning for an AI-powered stock-market platform spanning Zeno AI, screeners, strategy builder, backtesting, paper trading, courses, checkout, and admin tools.",
                    "Translate founder requirements into implementation-ready specs, user journeys, edge cases, bug lists, QA checks, and release priorities across frontend, backend, AI, payments, and admin modules.",
                    "Shape multilingual finance-assistant flows with guest limits, market-data enrichment, rate limiting, tool-grounded responses, and safety guardrails.",
                    "Define and validate Razorpay checkout and course-access logic: server-side signature verification, coupons, feature flags, webhook hardening, and verified access states.",
                    "Test trading workflows including screeners, watchlists, PnL, candles, quotes, strategy rules, and backtest journeys for retail users.",
                    "Improve production readiness through admin workflows, upload handling, CORS lockdown, health checks, environment configuration, and deployment validation.",
                ],
            ),
            (
                "Product Intern | Bermer Software Limited / Niyantha Transits Private Limited | Jan 2026 - Present",
                [
                    "Converted early hardware/IoT product ideas into clear presentation narratives, roadmap direction, and stakeholder-ready material.",
                    "Supported product positioning and business communication before moving into the Finverse product engagement.",
                ],
            ),
            (
                "Product Manager (Technical) | KiddoFin | Bengaluru | Dec 2025 - Jan 2026",
                [
                    "Represented KiddoFin at Google as the primary product presenter, communicating product vision, user value, and stakeholder narrative.",
                    "Led website delivery, automated email onboarding, product roadmaps, feature plans, and product pitches for an early-stage product.",
                ],
            ),
            (
                "Human Resource Management Intern | Peunier | Remote | Dec 2024 - Jan 2025",
                [
                    "Built job descriptions and hiring reports, screened candidates, and streamlined ATS workflows; helped hire 13+ candidates in one month.",
                ],
            ),
        ],
    ),
    (
        "PRODUCT CASE STUDIES",
        [
            (
                "Finverse | AI-powered Stock Market Super App | 2026",
                [
                    "Designed flows across Zeno AI, screeners, strategy/backtesting, paper trading, courses, checkout, admin tooling, and market-data workflows.",
                    "Built a coherent user loop: learn, ask, analyze, simulate, track, and pay only through verified access states. Case study: fareeth.vercel.app/work/finverse",
                ],
            ),
            (
                "SmartSlot | Mobile-first Dental Appointment PWA | 2025",
                [
                    "Built a mobile-first booking product for dental students and interns: daily slots, WhatsApp booking links, leave-day controls, and case tracking without patient login.",
                ],
            ),
            (
                "RoomSpace | Roommate Key Tracker | 2025",
                [
                    "Built a shared key-tracking tool with accountability, real-time updates, offline synchronization, and a simple shared source of truth.",
                ],
            ),
        ],
    ),
    (
        "EDUCATION",
        [
            "Krupanidhi College of Management | MBA, Finance and Marketing | Oct 2024 - Present | CGPA: 8.38/10",
            "University of Madras, The New College | B.A. Economics, Gold Medalist | Oct 2021 - Apr 2024 | CGPA: 7.16/10",
        ],
    ),
    (
        "CERTIFICATIONS",
        [
            "Market Research for Product Management (MTF Institute) | UI/UX Design and Product Management with Figma (Hudson Dynamic Lab)",
            "Microsoft Excel: Beginner to Advanced (Udemy) | Power BI: data transformation, DAX, dashboards, publishing | Agile, Scrum, and PMP fundamentals",
        ],
    ),
    (
        "ACHIEVEMENTS",
        [
            "Gold Medalist, B.A. Economics | Represented KiddoFin at Google as primary product presenter | First prize: Apple brand story and Hybrid 2.0 sustainable automobile concept | SDG Championship 2022 finalist",
        ],
    ),
]


def set_cell_border(paragraph):
    paragraph_format = paragraph.paragraph_format
    paragraph_format.space_before = Pt(7)
    paragraph_format.space_after = Pt(3)
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
    add_docx_text(paragraph, heading, bold=True, size=12, color="1F4E79")
    for entry in entries:
        if isinstance(entry, tuple):
            role, bullets = entry
            title = document.add_paragraph()
            title.paragraph_format.space_before = Pt(4)
            title.paragraph_format.space_after = Pt(1)
            add_docx_text(title, role, bold=True, size=10)
            for bullet in bullets:
                item = document.add_paragraph(style="List Bullet")
                item.paragraph_format.left_indent = Inches(0.17)
                item.paragraph_format.first_line_indent = Inches(-0.12)
                item.paragraph_format.space_before = Pt(0)
                item.paragraph_format.space_after = Pt(1)
                add_docx_text(item, bullet, size=9.5)
        else:
            item = document.add_paragraph(style="List Bullet")
            item.paragraph_format.left_indent = Inches(0.17)
            item.paragraph_format.first_line_indent = Inches(-0.12)
            item.paragraph_format.space_before = Pt(0)
            item.paragraph_format.space_after = Pt(1)
            add_docx_text(item, entry, size=9.5)


def build_docx():
    document = Document()
    section = document.sections[0]
    section.top_margin = Inches(0.42)
    section.bottom_margin = Inches(0.42)
    section.left_margin = Inches(0.52)
    section.right_margin = Inches(0.52)
    section.header_distance = Inches(0.2)
    section.footer_distance = Inches(0.2)

    normal = document.styles["Normal"]
    normal.font.name = "Aptos"
    normal._element.rPr.rFonts.set(qn("w:eastAsia"), "Aptos")
    normal.font.size = Pt(9.5)
    normal.paragraph_format.space_after = Pt(0)
    normal.paragraph_format.line_spacing = 1

    heading = document.add_paragraph()
    heading.alignment = WD_ALIGN_PARAGRAPH.CENTER
    heading.paragraph_format.space_after = Pt(1)
    add_docx_text(heading, NAME, bold=True, size=22, color="17365D")

    title = document.add_paragraph()
    title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    title.paragraph_format.space_after = Pt(2)
    add_docx_text(title, TITLE, bold=True, size=10, color="1F4E79")

    contact = document.add_paragraph()
    contact.alignment = WD_ALIGN_PARAGRAPH.CENTER
    contact.paragraph_format.space_after = Pt(4)
    add_docx_text(contact, CONTACT, size=8.5)

    summary = document.add_paragraph()
    summary.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    summary.paragraph_format.space_after = Pt(2)
    add_docx_text(summary, SUMMARY, size=9.5)

    add_docx_section(document, *SECTIONS[0])
    add_docx_section(document, *SECTIONS[1])
    document.add_section(WD_SECTION_START.NEW_PAGE)
    new_section = document.sections[-1]
    new_section.top_margin = Inches(0.42)
    new_section.bottom_margin = Inches(0.42)
    new_section.left_margin = Inches(0.52)
    new_section.right_margin = Inches(0.52)
    add_docx_section(document, *SECTIONS[2])
    add_docx_section(document, *SECTIONS[3])
    add_docx_section(document, *SECTIONS[4])
    add_docx_section(document, *SECTIONS[5])
    document.save(DOCX_PATH)


def build_pdf():
    doc = SimpleDocTemplate(
        str(PDF_PATH),
        pagesize=letter,
        rightMargin=0.52 * inch,
        leftMargin=0.52 * inch,
        topMargin=0.42 * inch,
        bottomMargin=0.42 * inch,
        title="Fareeth Raja Product Resume",
        author="Fareeth Raja",
    )
    palette = {"navy": HexColor("#17365D"), "blue": HexColor("#1F4E79"), "black": HexColor("#111111")}
    styles = getSampleStyleSheet()
    name_style = ParagraphStyle("ResumeName", parent=styles["Normal"], fontName="Helvetica-Bold", fontSize=22, leading=24, alignment=TA_CENTER, textColor=palette["navy"], spaceAfter=1)
    title_style = ParagraphStyle("ResumeTitle", parent=styles["Normal"], fontName="Helvetica-Bold", fontSize=9.5, leading=11, alignment=TA_CENTER, textColor=palette["blue"], spaceAfter=2)
    contact_style = ParagraphStyle("ResumeContact", parent=styles["Normal"], fontName="Helvetica", fontSize=8, leading=9.5, alignment=TA_CENTER, textColor=palette["black"], spaceAfter=4)
    summary_style = ParagraphStyle("ResumeSummary", parent=styles["Normal"], fontName="Helvetica", fontSize=9.3, leading=11.2, alignment=TA_LEFT, spaceAfter=2)
    section_style = ParagraphStyle("ResumeSection", parent=styles["Normal"], fontName="Helvetica-Bold", fontSize=11.5, leading=14, textColor=palette["blue"], spaceBefore=6, spaceAfter=2, borderWidth=0.7, borderColor=palette["blue"], borderPadding=1, borderBottom=1)
    role_style = ParagraphStyle("ResumeRole", parent=styles["Normal"], fontName="Helvetica-Bold", fontSize=9.6, leading=11.5, spaceBefore=3, spaceAfter=1)
    bullet_style = ParagraphStyle("ResumeBullet", parent=styles["Normal"], fontName="Helvetica", fontSize=9.15, leading=10.8, leftIndent=10, firstLineIndent=-7, bulletIndent=0, spaceAfter=1)

    story = [
        Paragraph(NAME, name_style),
        Paragraph(TITLE, title_style),
        Paragraph(CONTACT, contact_style),
        Paragraph(SUMMARY, summary_style),
    ]
    for section_index, (heading, entries) in enumerate(SECTIONS):
        if section_index == 2:
            story.append(PageBreak())
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