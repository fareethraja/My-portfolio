# Placement Desk Quality Report

Date: 24 July 2026

## Scope

This pass covered offer-letter analysis, candidate-profile resume ingestion, opening-search locations, career-discovery inputs, role recommendations, responsive behavior, and permanent regression coverage.

## Resume Print and Cover Letters

The resume Print/PDF path no longer opens with a `noopener` feature that causes compliant browsers to return a null window handle. It now keeps the synchronously opened handle long enough to write the escaped document, immediately sets `opener` to null, closes the document stream, and triggers the native print dialog.

Tailor Resume now creates a job-keyed cover letter alongside a new tailored resume. The draft is deterministic and uses only matched keywords plus literal profile experience/project evidence. It does not invent company research or unsupported skills. Users can edit recipient, subject, salutation, body, and sign-off; regeneration requires confirmation before replacing edits.

Cover letters support:

- Live document preview
- Popup-safe Print/PDF
- One-page DOCX download
- Browser-local persistence and backup
- Automatic deletion with the associated job
- Backward-compatible empty migration for existing workspaces

Measured browser checks:

- Resume print HTML: 9,076 characters, isolated opener, native print call present
- Cover-letter print HTML: 2,240 characters, isolated opener, native print call present
- Generated test letter: 989 editable characters grounded in the selected company and supported evidence
- Cover-letter DOCX filename captured correctly
- Mobile editor and preview at 390 x 844: no horizontal overflow

## Resume Comparison

Tailor Resume includes a Compare changes toggle that renders the regular profile resume and tailored application resume side by side. Comparison is based on stable profile IDs, normalized text, and relative order among retained items rather than raw array indexes.

Preview-only highlights distinguish:

- Edited: generated or manually changed text
- Added: content present only in the tailored draft
- Omitted: baseline evidence left out for the selected role
- Reordered: retained evidence moved relative to other retained evidence for relevance

The comparison covers headline, summary, skill groups and skills, experience entries and bullets, and projects. Education, certifications, courses, achievements, and additional sections remain visible for full-document context.

Measured browser result for a Product Analyst comparison:

- 2 edited fields
- 2 omitted items
- 47 reordered relevance items
- Both original and tailored documents rendered
- Mobile at 390 x 844: no horizontal overflow
- Resume Print/PDF HTML contained no comparison attributes, labels, or highlight markers

Highlights exist only in the React comparison preview. The resume DOCX and Print/PDF exporters continue to receive the plain tailored resume data model.

## Transparent Resume Scoring and Keyword Audit

The app does not insert white text, tiny text, hidden blocks, invisible metadata, or unsupported keyword lists into resumes. Raw pasted `sourceText` is excluded from both job matching and role-discovery evidence; only reviewed structured profile fields can support a keyword.

Regular and tailored resume scores use visible document content only:

- Detected role-keyword coverage: 55 points
- Role-title alignment: 15 points
- Relevant evidence concentration: 15 points
- Relevant and quantified proof: 10 points
- Required document structure: 5 points

The score is a directional role-fit estimate, not an ATS pass probability or shortlist guarantee. ATS products use different parsing, weighting, knockout rules, and recruiter workflows.

The comparison view includes a transparent keyword audit:

- Visible and supported terms
- Supported profile evidence that is not currently visible in the tailored draft
- Evidence-missing terms that were deliberately not added

Measured browser check for a Product Analyst role:

- Regular resume: 50/100
- Tailored resume: 66/100
- Improvement: +16 visible-content role-fit points
- Unsupported `Jira` appeared under Evidence missing and was not inserted
- No-hidden-words policy rendered in the UI
- Mobile at 390 x 844: no horizontal overflow

## Offer Analyzer

Three complete offer fixtures were analyzed four independent times each:

1. Balanced employee-friendly offer
2. Exploitative offer containing a service bond, liquidated damages, bonus clawback, non-compete, non-solicit, 120-day notice, settlement forfeiture, document withholding, broad transfer rights, shifts, and unilateral policies
3. Mobile-extraction salary table with INR 29,333 monthly gross and INR 6,24,252 annual CTC

Measured result: 12 of 12 repeated analyses produced identical stable compensation, clause findings, and tax/take-home outputs.

The regression suite detected and fixed annual-component fields reading the first monthly table value. Insurance, joining bonus, retention bonus, performance bonus, and other CTC benefits now prefer the annual/rightmost salary-row value.

## Candidate Profile Parser

Profile resume ingestion is paste-only. There is no PDF, DOCX, or other resume file picker in Candidate Profile. Offer Analyzer retains its independent document support.

A deterministic 50-resume corpus combines:

- 10 heading vocabularies
- 5 formatting and bullet styles
- Reordered sections
- Wrapped bullet continuations
- Role/company/date layout variations
- Summary, skills, experience, projects, and education
- Certifications and courses as separate sections
- Achievements, languages, volunteering, publications, memberships, activities, and interests
- Ignored declaration/reference boundaries

Measured result: 50 of 50 corpus resumes passed all section-routing assertions.

Courses and additional named sections are stored in the profile, editable in the UI, included in job evidence, and preserved in tailored resume previews, DOCX exports, and print/PDF exports. Existing browser-local profiles and tailored resumes receive backward-compatible empty defaults during restore.

## Career Discovery

- Location was removed from Discover Roles and remains in Find Openings only.
- 16 bounded interest signals replace the ambiguous free-text exploration box.
- 20 bounded work-style signals replace the previous nine choices.
- 47 curated industries replace open-ended industry entry.
- The role catalog contains at least 34 unique internship, entry, and associate paths.
- Discovery returns 12 deterministic suggestions: strongest six first and six more through Explore more roles.
- Find Openings uses the same bounded catalog rather than free-form role entry.

Automated tests confirm finance, people, technology, and sustainability interest profiles produce materially different top-six shortlists.

## Opening Search Locations

- India catalog: at least 45 employment hubs
- Global catalog: at least 20 countries
- Duplicate-city regression check: passed
- Canonical India search-location regression check: passed
- Custom location fallback remains available

## Responsive Browser Checks

Desktop Discover Roles:

- 16 interest controls present
- 20 work-style controls present
- Comprehensive industry selector present
- No location control present
- Six initial role cards and six additional cards
- No horizontal overflow

Mobile Candidate Profile at 390 x 844:

- No resume PDF/file input
- Pasted identity imported correctly
- Certifications and courses separated correctly
- Languages preserved as an additional section
- No horizontal overflow

Mobile Find Openings at 390 x 844:

- Expanded city selector present
- Full role catalog selector present
- New city and role examples found
- No horizontal overflow

Browser-local workspace data used during testing was backed up and restored after temporary profile-import checks.

## Final Validation

- Node test runner: 69 tests passed across 8 files after TypeScript compilation
- TypeScript: passed with zero errors
- ESLint: zero errors; 7 pre-existing warnings outside the changed Placement Desk files
- Next.js production build: passed
- Git diff whitespace check: passed

## Dependency Security

Next.js remains on the latest stable release available during this pass: 16.2.11.

The production audit reports advisories in PostCSS 8.4.31 and Sharp 0.34.5 inherited through Next.js 16.2.11. npm proposes an unsafe breaking downgrade to Next.js 9 rather than a valid framework patch. No unrelated transitive override is included in this feature change; these advisories should be rechecked when Next.js publishes compatible updated dependency ranges.

## Limitations

- Offer analysis is deterministic and rules-based, but users must still verify payroll components and legal clauses with HR and qualified professionals.
- Resume parsing supports common structured headings and noisy pasted text; users must review imported fields before tailoring.
- Role fit is a direction signal based on stated preferences and profile evidence, not a hiring probability.