# DISTILL — Test scenarios: FGP-1221 (frontend)

**Feature:** Simple case lifecycle report page — counts of cases by `PHASE:STAGE:STATUS`,
filtered by case type.
**Mode:** Retrospective. Feature already implemented and GREEN; specs capture behaviour and
trace each scenario to its executing test.
**Status of code under spec:** branch `FGP-1221-simple-report-by-position`.

## Driving / driven ports

| Role                  | Port                                                  | Location                                                               |
| --------------------- | ----------------------------------------------------- | ---------------------------------------------------------------------- |
| Driving (entry point) | HTTP `GET /reports?workflowCode=…` (renders Nunjucks) | `src/cases/routes/report.route.js`, `src/cases/views/pages/report.njk` |
| Presentation logic    | `createReportViewModel`                               | `src/cases/view-models/report.view-model.js`                           |
| Driven adapter        | Backend HTTP `GET /cases/report` via wreck            | `src/cases/repositories/report.repository.js` (`getReport`)            |

## Acceptance criteria → scenarios → tests

| #             | Acceptance criterion (port-to-port)                                                                                                             | Scenario                                                          | Executing test                                                                                                                                                                                               |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| AC-1          | Visiting **GET /reports** renders a table of cases at each lifecycle position, a total, and a case-type filter with the current choice selected | WS: _Caseworker views the lifecycle report_                       | `routes/report.route.test.js` → "renders the lifecycle report table" (renders the real `.njk`)                                                                                                               |
| AC-2          | The table reads as an indented roll-up: phase emphasised with subtotal, stages indented, statuses indented further                              | _The report reads as an indented roll-up_                         | `view-models/report.view-model.test.js` → "flattens phases into indented numeric table rows"                                                                                                                 |
| AC-3          | The filter leads with a blank placeholder, then the permitted case types, with the chosen one pre-selected                                      | _The case-type filter offers the available types_                 | …→ "builds the case-type select with a blank placeholder and the current selection marked"                                                                                                                   |
| AC-4 _(edge)_ | A case type with no cases shows a clear "no cases" message, not an empty table                                                                  | _A case type with no cases shows a clear message_                 | `routes/report.route.test.js` → "shows an empty message when no cases match"; `view-models/report.view-model.test.js` → "reports no results when there are no phases"                                        |
| AC-5          | Choosing a case type asks the service for just that type                                                                                        | _Choosing a case type asks the service for just that type_        | `repositories/report.repository.test.js` → "passes the selected case type through as a query string"                                                                                                         |
| AC-6 _(edge)_ | Opening with no choice asks the service without naming a case type                                                                              | _Opening the page with no choice does not name a case type_       | …→ "calls /cases/report with no query string when criteria is falsy"                                                                                                                                         |
| AC-7 _(edge)_ | On first visit the case-type chooser starts blank and a "choose a case type" prompt is shown instead of a report (FGP-1221 change)              | _On first visit the case type is unchosen and no report is shown_ | `view-models/report.view-model.test.js` → "selects the blank placeholder and makes no selection on first visit"; `routes/report.route.test.js` → "prompts for a case type and shows no table on first visit" |

**Error/edge coverage:** AC-4, AC-6, AC-7 = 3 of 7 scenarios (43%), meeting the ≥40% target.

## Business-language check

Scenario names and steps stay in business language (caseworker, reports page, case type,
lifecycle position). Technical detail (query string, Nunjucks, wreck) lives only in the
`Tested by` bindings and step-level code.
