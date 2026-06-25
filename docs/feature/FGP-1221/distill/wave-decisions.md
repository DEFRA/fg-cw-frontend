# DISTILL — Wave decisions: FGP-1221 (frontend)

## DWD-01 — Retrospective DISTILL

Run after implementation to capture a shipped prototype as first-class acceptance specs.
Mandate 7 (RED scaffolding) does not apply — code exists and tests are GREEN. Scenarios are
reverse-derived from the implementation, re-expressed in business language.

## DWD-02 — No upstream SSOT / prior-wave artifacts

`docs/product/` and `docs/feature/FGP-1221/{discuss,design,devops}/` do not exist; this repo
predates the nWave SSOT model. Graceful degradation: criteria derived from the implemented
code; driving port identified from the Hapi route; no user-story traceability. Zero
contradictions to reconcile.

## DWD-03 — Walking Skeleton strategy: **real render, faked costly external** (Strategy B)

- The driving port (`GET /reports`) is exercised **for real** through `hapi.server().inject`,
  rendering the **actual Nunjucks template** (`report.route.test.js` registers the real
  `nunjucks` plugin). This is a genuine `@real-io` render of the user-facing page.
- The driven adapter is the **backend HTTP service** (`GET /cases/report`) — a separate
  deployable and a network dependency. It is **faked** (`getReport`/`wreck` mocked), which is
  the correct treatment for a costly/out-of-process external under Strategy B.
- The adapter's own contract (criteria → query string, bearer token) is pinned separately in
  `report.repository.test.js` with `wreck` mocked.

## DWD-04 — Executable binding is vitest, not Cucumber

No Gherkin runner exists. `acceptance.feature` is the canonical human-readable spec; the
executable acceptance tests are the named vitest tests, kept in step via `Tested by:`.

## DWD-05 — Blank case-type dropdown on first visit (three-way page state)

Change request (FGP-1221): the case-type dropdown must start blank on first visit. Paired with
the backend change (fg-cw-backend DWD-05) that stops defaulting and returns
`selectedCaseType: null` when no case type is requested.

Decisions (user-confirmed):

1. The view-model prepends a blank placeholder option (`value: ""`, "Select a case type"),
   selected while `selectedCaseType` is null, and exposes `hasSelection`.
2. The page now has **three** states, not two:
   - **No selection** (first visit) → a "Select a case type to view the report" prompt
     (`data-testid="report-prompt"`), no table.
   - **Selected, has cases** → total + roll-up table.
   - **Selected, no cases** → the existing "no cases for this case type" message.
     This distinguishes "you haven't chosen yet" from "this case type is empty" — previously the
     single empty state conflated them.
3. The repository (`getReport`) is unchanged: no case type chosen still means no query string;
   the backend now answers that with `selectedCaseType: null`.
