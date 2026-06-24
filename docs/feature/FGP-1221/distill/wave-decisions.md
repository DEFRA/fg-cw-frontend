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
