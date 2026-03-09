# amancha_wedding

This repository is a Next.js wedding website POC with production-oriented tooling:

- Tailwind CSS, TypeScript, Next.js (App Router)
- Lefthook pre-commit hooks (replaces Husky)
- lint-staged + Prettier + ESLint
- Commitlint for conventional commit checks
- GitHub CodeQL + npm audit workflow for security scanning
- Dependabot configuration for dependency updates

Quick start:

1. Copy `.env.example` to `.env.local` and set values.
2. Install deps: `npm install`
3. Run: `npm run dev`

To activate git hooks locally, run `npm run prepare` (Lefthook will install hooks when dependencies are installed).

To deploy, connect this repo to Vercel and set environment variables in Vercel's dashboard.

Vercel deployment checklist

- Connect this repository to Vercel using your Vercel account (Import Project).
- Add the following repository secrets (in Vercel dashboard or GitHub secrets for the workflow):
  - **VERCEL_TOKEN** (create from your Vercel account settings)
  - **VERCEL_ORG_ID**
  - **VERCEL_PROJECT_ID**

Optional runtime env vars for features:

- `DATABASE_URL` — (optional) Postgres or other DB connection string for persisting RSVPs
- `SENDGRID_API_KEY` — (optional) to send email notifications when RSVPs arrive
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` — optional SMTP settings

Additional recommended env vars

- `ADMIN_TOKEN` — **required for admin APIs** (set a strong random secret; keep private)
- `RSVP_CONFIRM_MESSAGE` — optional server-side confirmation message shown to guests after they RSVP (can include `{name}` or `{attending}` tokens)
- `NEXT_PUBLIC_FEATURE_PUBLIC_GUESTLIST` — set to `true` to expose a public guest list UI/endpoint
- `RSVP_MAX_GUESTS` — integer limit for number of guests a single RSVP can add
- `LOG_LEVEL` — runtime log level (`info`, `debug`, `error`)

Sending RSVP notifications

- This project supports SendGrid (recommended) and a generic SMTP fallback (nodemailer).
- To enable SendGrid set: `SENDGRID_API_KEY`, `SENDGRID_FROM`, and `SENDGRID_TO`.
- To enable SMTP set: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, and `SMTP_TO`.
- The API (`/api/rsvp`) will attempt SendGrid first, then SMTP. If neither is configured it will log and continue.

There is a GitHub Action that will run on pushes to `main` and deploy to Vercel automatically. It runs a pre-check that ensures required CI env vars are present (`VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`). You can also deploy from the Vercel dashboard manually.

Notes on the RSVP API

- For the POC the RSVP route (`/api/rsvp`) validates input and logs it to the server logs. In production you can either:
  - Configure `DATABASE_URL` and add simple persistence (I can add a Prisma + Postgres setup), or
  - Add `SENDGRID_API_KEY` to enable email notifications for each RSVP.

Schema changes / migrations

- If you set `DATABASE_URL` and need to apply schema changes (for example to add `visibility` to RSVP), run:

```bash
npx prisma migrate dev --name add-visibility
npx prisma generate
```

This repository includes a `visibility` enum on `Rsvp` (PUBLIC/PRIVATE) and code will map `public`/`private` strings from the API to the DB enum.

If you'd like, I can add persistence and notification in a follow-up change.
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Playwright UI test

- Run Playwright tests against a running dev server (default http://localhost:3000):

```bash
# start dev server in one terminal
npm run dev
# in another terminal run playwright tests
npx playwright test tests/playwright/rsvp.spec.ts
```

Styling & Accessibility

- The app uses a Tahoe-inspired palette and glass-style components (see `tailwind.config.cjs` and `src/app/globals.css`).
- Accessibility improvements: form controls have explicit `label`/`for` pairs, larger touch targets for mobile/Android, visible focus outlines (`:focus-visible`) and `aria-live` regions for dynamic messages.
- Accessibility improvements: form controls have explicit `label`/`for` pairs, larger touch targets for mobile/Android, visible focus outlines (`:focus-visible`) and `aria-live` regions for dynamic messages.

Previewing the alternate 'Neo 2025' design

- There's a quick preview of an alternate, more expressive design at `/neo` — it auto-applies the Neo theme (glass + neon accents, animated blobs) so you can try a contrasting look. Use the theme toggle in the header to switch between the Tahoe and Neo styles.
- There's a quick preview of an alternate, more expressive design at `/neo` — it auto-applies the Neo theme (glass + neon accents, animated blobs) so you can try a contrasting look. Use the theme toggle in the header to switch between the Tahoe and Neo styles. You can also preview an even more futuristic 'Future' theme from that page which increases contrast, adds motion, and uses a display font for a more sci-fi aesthetic.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
