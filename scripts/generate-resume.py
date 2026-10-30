from io import BytesIO
from pathlib import Path

from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn
from docx.shared import Inches, Pt, RGBColor
from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import KeepTogether, Paragraph, SimpleDocTemplate


OUTPUT_DIR = Path(__file__).resolve().parents[1] / "public" / "resume"
DOCX_PATH = OUTPUT_DIR / "Fareeth-Raja-APM-Resume-2026.docx"
PDF_PATH = OUTPUT_DIR / "Fareeth-Raja-APM-Resume-2026.pdf"

NAME = "Fareeth Raja F"
TITLE = "ASSOCIATE PRODUCT MANAGER | AI PRODUCTS + DEVELOPER TOOLS"
CONTACT = "India | +91 9159469088 | fareethraja.26.careers@gmail.com"
LINKS = "Portfolio: https://fareeth.vercel.app | LinkedIn: https://linkedin.com/in/fareethraja | GitHub: https://github.com/fareethraja"
BLUE = "2855A0"
SUMMARY = (
    "Product Manager Trainee at Kumaran Systems and MBA graduate with experience in AI product discovery, "
    "competitive evaluation, and fintech product development. Combines user journeys, feature prioritization, "
    "technical demonstrations, and hands-on product delivery with economics and student leadership."
)

SECTIONS = [
    (
        "EDUCATION",
        [
            "Krupanidhi College of Management | MBA, Finance and Marketing | 2024 - 2026 | CGPA: 8.38/10 | Finance Gold Medalist; Best Outgoing Student",
            "The New College, University of Madras | B.A. Economics | 2021 - 2024 | Gold Medalist",
        ],
    ),
    (
        "EXPERIENCE",
        [
            (
                "Product Manager Trainee | Kumaran Systems | Sep 2026 - Present",
                [
                    "Contributed to enterprise AI product discovery through target-market evaluation, SWOT analysis, user journeys, and competitive positioning.",
                    "Evaluated AI memory and personalization trade-offs across context continuity, token cost, and performance; proposed context-import onboarding to address cold-start friction.",
                    "Delivered GitHub Copilot workflow demonstrations and recorded walkthroughs for the team; recommended feature priorities and phased implementation for an internal AI developer tool.",
                    "Contributed to agentic AI workflow and enterprise integration discussions; advocated platform-level positioning to connect individual products into a coherent ecosystem.",
                ],
            ),
            (
                "Product Manager | Finverse via Bermer Software Limited | Feb 2026 - Aug 2026",
                [
                    "Translated founder goals into user requirements, journeys, acceptance criteria, release priorities, and QA checks across AI chat, market analysis, trading simulation, courses, and checkout.",
                    "Shaped multilingual, tool-grounded AI assistant workflows and validated payment-to-course-access logic, including signature verification and webhook handling.",
                ],
            ),
            (
                "Product Manager (Technical) | KiddoFin | Bengaluru | Dec 2025 - Jan 2026",
                [
                    "Presented KiddoFin's product vision and user value at Google; led website delivery, automated email onboarding, feature plans, and stakeholder pitches.",
                ],
            ),
        ],
    ),
    (
        "PRODUCT PROJECTS",
        [
            (
                "Placement Desk | Independent Product | 2026",
                [
                    "Built a local-first workspace around the candidate journey: profiles, role discovery, evidence-based resume tailoring, application tracking, and interview preparation; added DOCX/PDF export and JSON backup.",
                ],
            ),
            (
                "SmartSlot | Mobile-first Dental Appointment PWA | 2025",
                [
                    "Built booking, WhatsApp slot sharing, leave controls, and case tracking around dental students' workflows, removing patient signup from the booking journey.",
                ],
            ),
        ],
    ),
    (
        "LEADERSHIP ACTIVITIES",
        [
            "The New College: Students' Union Leader and IRA 2K24 co-founder; coordinated 400 student organizers for 2,500+ visitors in one day, attracted sponsorship funding, and organized 20+ events during a one-year term.",
            "MBA: Organized Orphic 2025 inter-college fest and emceed most college events; Best Presenter, Krupacon International Conference 2025; Emerging Entrepreneur award.",
            "SDG Championship 2022: Won at college level and led an environmental-focus team onward to state level.",
        ],
    ),
    (
        "PRODUCT SKILLS",
        [
            "Product: market research, competitive evaluation, prioritization, user journeys, requirements, stakeholder communication",
            "Technical, analysis and design: React, Next.js, TypeScript, Go, REST APIs, Azure OpenAI, GitHub Copilot, Figma, Excel, Power BI",
        ],
    ),
]


def add_docx_text(paragraph, text, bold=False, size=10, color=None):
    run = paragraph.add_run(text)
    run.bold = bold
    run.font.name = "Calibri"
    run._element.rPr.rFonts.set(qn("w:eastAsia"), "Calibri")
    run.font.size = Pt(size)
    if color:
        run.font.color.rgb = RGBColor.from_string(color)
    return run


def add_docx_section(document, heading, entries):
    paragraph = document.add_paragraph()
    paragraph.paragraph_format.space_before = Pt(8)
    paragraph.paragraph_format.space_after = Pt(4)
    paragraph.paragraph_format.keep_with_next = True
    add_docx_text(paragraph, heading, bold=True, size=11, color=BLUE)
    for entry in entries:
        if isinstance(entry, tuple):
            role, bullets = entry
            title = document.add_paragraph()
            title.paragraph_format.space_before = Pt(5)
            title.paragraph_format.space_after = Pt(2)
            title.paragraph_format.keep_with_next = True
            add_docx_text(title, role, bold=True, size=10, color=BLUE)
            for bullet in bullets:
                item = document.add_paragraph()
                item.paragraph_format.left_indent = Inches(0.17)
                item.paragraph_format.first_line_indent = Inches(-0.12)
                item.paragraph_format.space_before = Pt(0)
                item.paragraph_format.space_after = Pt(2)
                item.paragraph_format.keep_together = True
                add_docx_text(item, f"• {bullet}", size=10)
        else:
            item = document.add_paragraph()
            item.paragraph_format.space_before = Pt(0)
            item.paragraph_format.space_after = Pt(2)
            add_docx_text(item, entry, size=10)


def build_docx():
    document = Document()
    section = document.sections[0]
    section.page_width = Inches(8.5)
    section.page_height = Inches(11)
    section.top_margin = Inches(0.45)
    section.bottom_margin = Inches(0.5)
    section.left_margin = Inches(0.55)
    section.right_margin = Inches(0.55)
    section.header_distance = Inches(0.2)
    section.footer_distance = Inches(0.2)

    normal = document.styles["Normal"]
    normal.font.name = "Calibri"
    normal._element.rPr.rFonts.set(qn("w:eastAsia"), "Calibri")
    normal.font.size = Pt(10)
    normal.paragraph_format.space_after = Pt(0)
    normal.paragraph_format.line_spacing = 1

    heading = document.add_paragraph()
    heading.alignment = WD_ALIGN_PARAGRAPH.CENTER
    heading.paragraph_format.space_after = Pt(1)
    add_docx_text(heading, NAME, bold=True, size=20)

    contact = document.add_paragraph()
    contact.alignment = WD_ALIGN_PARAGRAPH.LEFT
    contact.paragraph_format.space_before = Pt(5)
    contact.paragraph_format.space_after = Pt(4)
    add_docx_text(contact, CONTACT, size=9)

    links = document.add_paragraph()
    links.paragraph_format.space_after = Pt(6)
    add_docx_text(links, LINKS, size=9)

    title = document.add_paragraph()
    title.paragraph_format.space_after = Pt(5)
    add_docx_text(title, TITLE, bold=True, size=10.5, color=BLUE)

    summary = document.add_paragraph()
    summary.alignment = WD_ALIGN_PARAGRAPH.LEFT
    summary.paragraph_format.space_after = Pt(2)
    add_docx_text(summary, SUMMARY, size=10)

    for section_content in SECTIONS:
        add_docx_section(document, *section_content)
    document.save(DOCX_PATH)


def build_pdf():
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=0.55 * inch,
        leftMargin=0.55 * inch,
        topMargin=0.45 * inch,
        bottomMargin=0.5 * inch,
        title="Fareeth Raja Product Resume",
        author="Fareeth Raja",
    )
    palette = {"blue": HexColor(f"#{BLUE}"), "black": HexColor("#111111")}
    styles = getSampleStyleSheet()
    name_style = ParagraphStyle("ResumeName", parent=styles["Normal"], fontName="Helvetica-Bold", fontSize=20, leading=24, alignment=TA_CENTER, textColor=palette["black"], spaceAfter=6)
    title_style = ParagraphStyle("ResumeTitle", parent=styles["Normal"], fontName="Helvetica-Bold", fontSize=10.5, leading=12, alignment=TA_LEFT, textColor=palette["blue"], spaceBefore=3, spaceAfter=5)
    contact_style = ParagraphStyle("ResumeContact", parent=styles["Normal"], fontName="Helvetica", fontSize=9, leading=11, alignment=TA_LEFT, textColor=palette["black"], spaceAfter=4)
    summary_style = ParagraphStyle("ResumeSummary", parent=styles["Normal"], fontName="Helvetica", fontSize=10, leading=12.2, alignment=TA_LEFT, spaceAfter=3)
    section_style = ParagraphStyle("ResumeSection", parent=styles["Normal"], fontName="Helvetica-Bold", fontSize=11, leading=13, textColor=palette["blue"], spaceBefore=8, spaceAfter=4)
    role_style = ParagraphStyle("ResumeRole", parent=styles["Normal"], fontName="Helvetica-Bold", fontSize=10, leading=12, textColor=palette["blue"], spaceBefore=4, spaceAfter=2)
    bullet_style = ParagraphStyle("ResumeBullet", parent=styles["Normal"], fontName="Helvetica", fontSize=10, leading=12.1, leftIndent=10, firstLineIndent=-7, bulletIndent=0, spaceAfter=2)
    text_style = ParagraphStyle("ResumeText", parent=bullet_style, leftIndent=0, firstLineIndent=0)

    story = [
        Paragraph(NAME, name_style),
        Paragraph(CONTACT, contact_style),
        Paragraph(LINKS, contact_style),
        Paragraph(TITLE, title_style),
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
                group.append(Paragraph(entry, text_style))
        story.append(KeepTogether(group))
    pages = []
    doc.build(story, onFirstPage=lambda canvas, _: pages.append(canvas.getPageNumber()),
              onLaterPages=lambda canvas, _: pages.append(canvas.getPageNumber()))
    if pages != [1]:
        raise ValueError(f"Resume must fit one page; generated {len(pages)} pages")
    PDF_PATH.write_bytes(buffer.getvalue())


if __name__ == "__main__":
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    build_pdf()
    build_docx()
    print(f"Generated one-page PDF: {PDF_PATH}")
    print(f"Generated DOCX: {DOCX_PATH}")