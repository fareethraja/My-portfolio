# Fareeth Raja Portfolio + Placement Desk

This repository contains Fareeth Raja's public portfolio and Placement Desk, an unlisted, local-first job search workspace built for Indian students and early-career candidates.

Placement Desk supports:

- Evidence-based role discovery with transparent fit scoring
- Bengaluru, Chennai, and other city-level job search through LinkedIn public listings plus supplementary feeds
- Protected job-link fallback that prevents stale job data from tailoring the wrong resume
- Complete ATS resume tailoring and DOCX/PDF output
- Aptitude and interview plans with lessons, practice questions, sources, and downloadable study guides
- Seven-day skill roadmaps that require evidence before adding a skill to a resume
- Detailed application-stage tracking and round-specific coaching
- Tracked and standalone offer-letter analysis
- India FY 2026-27 take-home estimates, clause review, and optional negotiation guidance
- Browser-local storage with JSON backup and restore

## Local Development

Requirements:

- Node.js 22 or newer
- npm

Install and start the app:

```powershell
npm install
npm run dev -- --webpack
```

Open the portfolio at `http://localhost:3000`.

## Portfolio Content and Resume

The public portfolio presents AI product discovery and developer-tool evaluation alongside independent builds and earlier fintech work. Kumaran Systems contributions start in September 2026; the Finverse and Bermer engagements concluded in August 2026.

- Employer case studies use anonymized labels, with no internal product names, screenshots, recordings, roadmap details, or architecture documents.
- Discovery, recommendations, and implemented work are labeled separately. Do not convert proposed benefits into measured results.
- Case study content lives in `src/lib/case-studies.ts`; those entries automatically populate the work routes and sitemap.
- `/api/resume` redirects to `public/resume/Fareeth-Raja-APM-Resume-2026.pdf`. The matching DOCX is in the same folder. Both preserve the original plain-blue resume style with a centered black name, blue section and role headings, and a single-column layout. Earlier resume files are preserved as historical originals, not the current download.
- Regenerate the current PDF and DOCX with `python scripts\generate-resume.py` using an environment with `python-docx` and `reportlab`. The generator refuses to save a PDF that exceeds one page.
- PDF and DOCX files are marked as binary in `.gitattributes` to prevent Windows line-ending conversion from altering exported documents.
- The default Placement Desk owner profile is updated for newly initialized workspaces. Existing browser-local profiles are not overwritten; review or import the new resume explicitly.
- The one-page resume omits the standalone Bermer/Niyantha internship, but retains Finverse's Bermer attribution. The website and full owner profile preserve the complete history.
- Leadership evidence includes IRA 2K24's 2,500+ one-day visitors, 400 student organizers, sponsorship funding, and 20+ events over a one-year Students' Union term, plus MBA event organizing and presentation recognition. Do not invent sponsor amounts or claim a state-level SDG win.

## Portfolio UI and Performance

- The original visual design is preserved: animated hero and stat cards, role marquee, WebGL ground background, mouse trail, tubelight navigation, alternating scroll-linked timeline, interactive gold-medal easter egg, glow cards, skill chips, and social buttons.
- Public pages offer a dusk-lavender/mint dark theme and a matching lavender-paper light theme. An 80px by 44px sun/moon pill switch remembers the choice through `next-themes`; light is the default for new visitors, while a saved preference takes precedence. Switching uses a 720ms opacity-only View Transition with the intro's easing, avoiding an expanding clip-path or layout movement. During the snapshot dissolve, palette properties update immediately instead of running duplicate per-card color/shadow transitions; transform and opacity interactions remain enabled. Unsupported browsers use a 480ms color-transition fallback; reduced motion changes instantly. Theme selection is applied before hydration, and semantic colors, native controls, and browser theme color follow the selected palette.
- Search, navigation, timeline, social links, and work/now routes share the theme. The WebGL ground reuses its shader and buffers across theme changes; the mouse trail replaces its previous listeners and frames cleanly. Both retain theme-aware motion and use a static, theme-colored background under reduced motion. The revealed gold-medal card intentionally keeps its rich dark-gold surface and high-contrast lettering in either theme.
- Search is a nonmodal glass dropdown anchored below the launcher on phones and desktops, with Ctrl/Cmd+K, arrow/Enter navigation, internally scrolling results, Escape/close-button focus restoration, and outside-click dismissal. Opening search dismisses its transient hint; it never blocks or blurs the full page.
- An original welcome intro draws a cursive English "hello" using a single SVG stroke, then cycles French, Spanish, Italian, German, Japanese, Hindi, and Tamil greetings before the curved split-curtain reveal. Eight distinct greetings take about 5.7 seconds from the modal opening; the stroke and greeting timelines wait for that visible start rather than advancing during hydration. The SVG scales with the greetings' font size to keep its ink height comparable to the text. The lettering uses an original path, not Apple assets, video, or an extra font download. Muted dusk-lavender curtains, restrained mint accents, and deep-purple greetings bridge into the site without hiding the opening effect. It runs on every full public-page load, not client-side navigation; private Placement Desk pages bypass it. CSS handles the stroke, transforms, and opacity without a JavaScript animation loop, with a native modal for focus containment, Escape dismissal, reduced-motion bypass, and timed fail-open safeguards before and after playback starts. Only the greetings and reveal are visible, with no corner caption or Skip button.
- Public sections and work/now routes share a full-width fluid container capped at 1600px, responsive safe-area-aware gutters, and readable card layouts. The hero scroll cue and forced full-screen section heights are removed so content follows naturally. Mobile timeline cards use a smaller left indent, and selected-work cards have visible violet/slate borders at rest and on keyboard focus.
- The social-contact panel keeps its original centered 672px maximum width rather than stretching with the section container. Hero actions use original liquid-glass pills with frosted surfaces, inset reflective rims, stable rolling labels and small icons; only Open to Work has an availability dot. Pointer lighting and gentle tilt are frame-coalesced, mouse-only and disabled under reduced motion, with no added WebGL surfaces or Framer dependency. Blur has a solid-surface fallback for unsupported browsers. Contact navigation works on the first click, while case studies and resume downloads retain native link behavior. Hover depth uses transforms and an opacity highlight rather than animating blur or shadows. Card-glow updates batch all visible-card geometry reads before applying styles, preserving the original card effects without interleaved layout reads and writes.
- Desktop navigation uses one position-based active-section tracker. Clicking a destination keeps that tab selected during smooth scrolling, while wheel/touch/scroll-key input interrupts the lock. Arrival, scroll completion, or a bounded timeout releases it; the timeline maps to About. Reduced motion uses instant scrolling and no lamp tween.
- Project and skill card surfaces retain the original 5% tint; stronger project borders do not require opaque card fills.
- Current career content, anonymized case studies, confirmed leadership facts, metadata, and the updated resume download are preserved inside the original layouts.
- One root analytics tracker owns page views, passive scroll-depth tracking, and delegated contact/demo clicks. Private Placement Desk routes are not tracked.
- The original fonts, styles, UI components, and supporting dependencies are restored. Original resume files and source portraits are retained.
- All three hero actions share `AnimatedAvailabilityButton`. The case-study and resume variants are native links that act on the first click, with hover/focus label transitions; the resume retains its PDF download attribute.
- Performance tuning preserves the visuals: pointer glows share one frame-coalesced listener, offscreen glow cards skip layout reads, replaced angle tweens are stopped, and tilt uses motion values/refs instead of per-move React state.
- The mouse trail uses 40 blended paths instead of 80, retains 50 nodes per path, and stops after settling. Its listeners and frames are cleaned up on unmount, blur, hidden tabs, and reduced-motion changes.
- The slow-moving WebGL background is capped at 30 updates per second and roughly 1280 x 720 internal resolution, pauses in hidden tabs or with reduced motion, and releases GPU resources on unmount. Foreground spring/hover animations are not frame-capped. Decorative fonts remain available but are not eagerly preloaded.
- Repository-local Vercel `web-design-guidelines` and `vercel-react-best-practices` skills are installed under `.agents/skills`, with sources recorded in `skills-lock.json`. Other pre-existing local skills are not part of this installation.

The earlier zero-animation measurements applied only to the rejected redesign and are no longer representative of the restored site; no percentage speed claim is made.

Private workspaces use `http://localhost:3000/job-assistant/{username}`.

Passwords are stored as salted scrypt hashes in server-only code. Do not add plaintext credentials to source, documentation, issues, or commits.

## Environment

Copy `.env.example` to `.env.local` for local production-mode testing. Development mode has a local-only signing fallback, but deployed login intentionally refuses to start without a configured secret.

Generate a strong signing secret:

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Set the output as `JOB_ASSISTANT_SESSION_SECRET`. Never commit the generated value.

## Vercel Auto-Deployment

The repository remote is `https://github.com/fareethraja/My-portfolio.git`, and the production branch is `master`.

Before the first deployment containing Placement Desk:

1. Open the Vercel project.
2. Go to `Settings` -> `Environment Variables`.
3. Add `JOB_ASSISTANT_SESSION_SECRET` with the generated 96-character hexadecimal value.
4. Enable it for `Production` and `Preview`. Development is optional.
5. Go to `Settings` -> `Git` and confirm `master` is the Production Branch.
6. Keep the framework preset as `Next.js`, install command as `npm install`, and build command as `next build` or the Vercel default.
7. Push a tested commit to `origin/master`. Vercel will deploy automatically.
8. If the variable was added after a deployment started, trigger one redeploy from the Vercel Deployments screen.

Production login returns HTTP `503` if the session secret is missing or shorter than 32 characters.

## Privacy and Data

- Jobs, profiles, plans, resumes, and analyses are stored in browser `localStorage`, namespaced by username.
- The same username on different browser profiles does not share job data.
- Users should download a JSON backup before clearing browser storage or moving devices.
- DOCX/TXT resume parsing happens locally in the browser.
- Offer PDF parsing is local-first. If PDF.js stalls, the authenticated fallback processes the PDF in server memory and returns extracted text without saving the file.
- Public job extraction validates external URLs and blocks private-network targets.
- Placement Desk routes are excluded from indexing and send `noindex`, `nofollow`, and `no-referrer` headers.

## Validation

Run before deployment:

```powershell
npx tsc --noEmit
npm test
npx eslint src next.config.ts
npm run build
```

## Contributing

Contributions are welcome, especially for Indian city and fresher job sources, regional-language guidance, accessibility, mobile usability, sanitized parser fixtures, hiring-round knowledge, and automated tests.

Do not commit real resumes, offer letters, phone numbers, access credentials, or other personal documents. Use sanitized fixtures and preserve the project's core principles: truthful resumes, explicit assumptions, candidate privacy, and no exploitative shortcuts.

Placement Desk was built by Fareeth Raja, with the GB maker's mark as a nod to GajendraBoys.
