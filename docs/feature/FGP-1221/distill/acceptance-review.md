# DISTILL — Acceptance review: FGP-1221 (frontend)

## Adapter coverage (Mandate 6)

| Driven adapter                                           | Real-I/O scenario? | Covered by                                                                                                                                                                                                   |
| -------------------------------------------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Backend HTTP `GET /cases/report` (`getReport` via wreck) | Faked (Strategy B) | `repositories/report.repository.test.js` — contract pinned with `wreck` mocked (path, query string, bearer token). The real backend port is specified in **fg-cw-backend** `docs/feature/FGP-1221/distill/`. |

The backend is a separate deployable and a network dependency, so faking it at the frontend
boundary is correct (DWD-03, Strategy B). Its real behaviour is an acceptance concern of the
backend repo, not this one.

## Self-review checklist

- [x] WS strategy declared in `wave-decisions.md` (DWD-03, Strategy B)
- [x] WS scenario exercises the **driving adapter** via its protocol — `GET /reports` through `server.inject`, rendering the real Nunjucks template (status + page content)
- [x] Driven adapter (backend service) treated per strategy — faked at boundary, contract pinned in repository test
- [x] For the faked adapter: documented what it cannot model (real backend counting / failures)
- [x] Container preference documented — none
- [~] ≥40% error/edge scenarios — 33% here; ~38% combined cross-repo. Documented top-up: a "service unavailable → friendly error" scenario.
- [x] Business-language purity in scenario names and steps
- [x] Every scenario traced to an executing test (`Tested by:`)
- [n/a] Mandate 7 RED scaffolds — retrospective, code already GREEN (DWD-01)

## Known gap (top-up candidate)

No scenario covers the backend being unavailable / erroring. Today that path falls through to
the shared `src/server/plugins/errors.js` handler (not feature-specific). If hardened for
production, add: _Given the report service is unavailable, When I open the reports page, Then
I see a friendly error rather than a blank page_ — bound to a new route test that makes
`reportCasesUseCase` reject.

## Verification

All referenced tests pass on branch `FGP-1221-simple-report-by-position`:
`report.route.test.js` (3), `report.view-model.test.js` (3), `report.repository.test.js` (2).
