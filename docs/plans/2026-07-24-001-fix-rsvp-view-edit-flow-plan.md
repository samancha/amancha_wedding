---
title: fix: Restore RSVP view/edit flow
created_at: 2026-07-24
type: fix
artifact_contract: ce-unified-plan/v1
artifact_readiness: implementation-ready
product_contract_source: ce-plan-bootstrap
execution: code
---

## Goal Capsule

- Objective: restore the RSVP view/edit path so an already-matched guest can reopen the inline response flow and change their answer instead of landing on an inert button.
- Authority: the existing `/rsvp` client flow is the source of truth for guest-facing behavior; the current guest lookup data already provides the metadata needed to reopen the form.
- Stop conditions: the View/Edit control opens the editable RSVP step with the right guest context, the ordinary Continue path still works, and the repaired flow is covered by regression tests.
- Execution profile: lightweight, localized client-flow fix with browser coverage.

## Product Contract

### Summary

The RSVP search results show a View/Edit button for guests who already have a recorded RSVP, but the control does not actually move the user into the editable part of the form.

### Problem Frame

The bug lives in the `/rsvp` client flow.
The search step finds matching guests, but the already-RSVPed branch never carries the guest context into the next step, so the UI advertises editability without providing it.

### Requirements

- R1. An already-RSVPed guest can activate View/Edit and reach the editable RSVP step.
- R2. The edit transition preserves the selected guest context so the attending view still knows who is responding.
- R3. The normal Continue path for guests without a prior RSVP still opens the same attending step unchanged.
- R4. The auto-search behavior from `?q=` remains intact and still lands in the search results before the user chooses a path.
- R5. Browser regression coverage proves the repaired edit branch and the ordinary continue branch.

### Scope Boundaries

- Deferred for later: prefill previously submitted meal, allergies, and companion details in the edit view.
  The current guest lookup data only exposes the RSVP status and guest metadata needed to reopen the flow.
- Outside this pass: a new dedicated RSVP editor route or admin edit surface.
  This fix restores the existing inline flow instead of adding a second editing surface.

### Sources

- `src/components/RsvpForm.tsx`
- `src/app/api/rsvp/verify-guest/route.ts`
- `src/lib/googleSheets.ts`
- `tests/playwright/rsvp.spec.ts`

## Planning Contract

### KTD1. Reuse the existing attending step as the edit surface

The fix should keep the current multi-step RSVP form and make it work as the edit surface rather than introducing a new route or modal.
That keeps the change localized and matches the current UX pattern.

### KTD2. Seed the edit path from the matched guest record before changing steps

The already-RSVPed branch must explicitly bind the selected guest to the edit transition so the button works even though it lives inside a clickable result row.
That avoids a blank attending view and keeps the guest identity intact across the step change.

## Implementation Units

### U1. Restore the edit transition in the RSVP matcher

- **Goal:** make the View/Edit control actually open the edit flow for an already-RSVPed guest.
- **Requirements:** R1, R2.
- **Dependencies:** none.
- **Files:** `src/components/RsvpForm.tsx`
- **Approach:**
  1. Reconnect the already-RSVPed button to the attending-step transition.
  2. Ensure the clicked guest is the one bound to the edit path before navigation.
  3. Initialize the downstream attending state from the matched guest so the edit view is not blank.
- **Execution note:** start with the broken button branch in the search-results list; that is the source of the regression.
- **Test scenarios:**
  - An already-RSVPed match shows View/Edit and clicking it opens the attending step with that guest name visible.
  - Clicking View/Edit without first selecting the row still opens the same guest context.
  - The attending step does not open blank or lose the selected guest when the edit button is used.
  - The existing Continue button for a not-yet-RSVPed guest still opens the attending step.
- **Verification:** the client flow can move from search results to edit mode without any manual state repair.

### U2. Lock the behavior down with browser regression coverage

- **Goal:** add focused Playwright coverage for the repaired edit branch and the unchanged continue branch.
- **Requirements:** R3, R4, R5.
- **Dependencies:** U1.
- **Files:** `tests/playwright/rsvp.spec.ts`
- **Approach:**
  1. Replace or extend the current RSVP spec with assertions that exercise the already-RSVPed branch.
  2. Keep one scenario for the ordinary continue path so the fix does not regress first-time responses.
  3. Align the spec with the current `/rsvp` form instead of the stale email/visibility shape.
- **Test scenarios:**
  - An already-RSVPed guest search result opens the editable attending step when View/Edit is pressed.
  - A guest without a prior RSVP still advances through Continue to the attending step.
  - The `?q=` auto-search path still populates the result list before the user chooses View/Edit or Continue.
- **Verification:** the targeted RSVP Playwright spec passes against the local app and proves both branches of the selector state machine.

## Verification Contract

- The app still builds cleanly after the RSVP form change.
- The focused RSVP Playwright spec passes and proves the edit branch and the ordinary continue branch.
- The existing mobile RSVP smoke coverage still passes so the search input and `/rsvp` entry point remain usable on small screens.

## Definition of Done

- Already-RSVPed guests can press View/Edit and land in the editable RSVP step with the right guest context.
- The ordinary new-RSVP Continue path still works.
- The RSVP Playwright regression covers the repaired edit branch and the normal branch.
- The repo still builds cleanly.
- Any dead commented-out transition code around the broken button is removed.
