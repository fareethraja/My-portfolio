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
npx eslint src/components/job-assistant src/lib/job-assistant src/app/api/job-assistant "src/app/job-assistant/[inviteId]" src/components/navigation/client-site-chrome.tsx next.config.ts src/app/robots.ts
npm run build
```

## Contributing

Contributions are welcome, especially for Indian city and fresher job sources, regional-language guidance, accessibility, mobile usability, sanitized parser fixtures, hiring-round knowledge, and automated tests.

Do not commit real resumes, offer letters, phone numbers, access credentials, or other personal documents. Use sanitized fixtures and preserve the project's core principles: truthful resumes, explicit assumptions, candidate privacy, and no exploitative shortcuts.

Placement Desk was built by Fareeth Raja, with the GB maker's mark as a nod to GajendraBoys.
