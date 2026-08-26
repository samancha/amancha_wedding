# Amancha Wedding — agent instructions

This repo is the **live production site** at https://sobestdayever.com. Vercel
deploys automatically on push to `main`. There is no staging environment and no
undo: a bad merge is visible to real guests within about a minute, and the event
date (2026-10-17) is fixed.

Treat every change to the RSVP path as a production change.

## Stack

Next.js (App Router) + React + TypeScript, Tailwind, Zod for validation,
`googleapis` for Sheets. Playwright for tests. Deployed on Vercel per
`vercel.json`.

## The part that keeps breaking: the two spreadsheets

There are **two different Google Sheets**, and confusing them is the most common
mistake made in this repo.

| Env var                      | What it is                                                       | How it is read                                      |
| ---------------------------- | ---------------------------------------------------------------- | --------------------------------------------------- |
| `GOOGLE_GUEST_LIST_SHEET_ID` | The guest list — who is invited, and their current RSVP snapshot | `A:Z`, columns resolved **by header name in row 1** |
| `GOOGLE_SHEETS_ID`           | The RSVP response log — one row per submission                   | Fixed ranges: `Sheet1!A:H`, `Sheet1!A:I`            |
| `GOOGLE_SHEETS_CREDENTIALS`  | Base64-encoded service-account JSON                              | —                                                   |

### The guest-list header contract

`resolveGuestListColumns()` in `src/lib/googleSheets.ts` finds columns by
matching the **header text in row 1**. It does not use fixed positions. Two
properties of that code decide whether an RSVP is saved at all:

1. **Missing header → silent no-write.** If any required header cannot be
   resolved, `resolveGuestListColumns` returns `-1` for it,
   `buildGuestSnapshotWrite` returns `null`, and the write is skipped. There is
   no thrown error and no user-visible failure. Required headers: First Name,
   Last Name, RSVP Status, Meal, Dietary Restrictions, Rehearsal Dinner, Brunch,
   Updated At.
2. **The five snapshot columns must be contiguous**, in this order: Meal,
   Dietary Restrictions, Rehearsal Dinner, Brunch, Updated At. The code asserts
   `column === snapshotColumns[0] + index` and bails to `null` if someone has
   inserted a column between them.

So a header renamed or a column inserted **in the live sheet** silently breaks
RSVP persistence with a green test suite and a green deploy. If RSVPs stop
landing, read the live sheet's header row before you read the diff.

Guest matching is case-insensitive and trimmed on first + last name. Last-name
search is substring-based in both directions so compound names
("Garcia-Lopez") match on either part — do not "fix" that into an exact match.

## Verification gates

Run all of these before handing work on. **CI does not run most of them** — see
the warning below.

```bash
npm run prettier:check
npm run lint
npm run typecheck
npm run build
npm test               # full Playwright suite
```

`npm run test:mobile` runs only the mobile spec; it is not a substitute for the
full suite. Report the exact commit you verified (`git rev-parse HEAD`) alongside
results — several past reviews cited a commit the tests had not actually run
against.

### Warning: the automated gates are weaker than they look

- **CI (`.github/workflows/lint.yml`) runs only Prettier and ESLint.** It does
  not typecheck, does not build, and does not run Playwright. A green PR check
  says nothing about whether the site works.
- **The `pre-push` test hook is `npm run test || true`** in `lefthook.yml` — a
  failing suite does not block a push.

Both of these mean a human or agent running the commands above by hand is
currently the only real gate on this repo. Do not skip them because CI is green.

## Secrets

`amancha-wedding-service-key.json`, `.env`, and `.env.local` are gitignored and
must stay that way. Never commit them, never paste their contents into a Buzz
channel or a PR description, and never echo them into a log.

## Working conventions

- Branch from `main`; never commit directly to `main`. Use a worktree
  (`.worktrees/` is already in use) rather than switching branches in place.
- Open a PR and let it be reviewed. Merging to `main` deploys to production.
- There is a large backlog of open Dependabot PRs (React, googleapis, Tailwind,
  Actions) untouched since March. Do not bundle a dependency bump into a
  behavioural fix — they carry different risk and need separate verification.
- Plans live in `docs/plans/`.
