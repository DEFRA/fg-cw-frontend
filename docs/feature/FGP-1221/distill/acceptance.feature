# Canonical acceptance specification — FGP-1221 (frontend port)
#
# Driving port:  HTTP GET /reports   (Hapi route: src/cases/routes/report.route.js,
#                rendering src/cases/views/pages/report.njk)
# Driven adapter: backend HTTP GET /cases/report
#                 (src/cases/repositories/report.repository.js → getReport, via wreck)
#
# There is no Cucumber runner in this repo. These scenarios are the human-readable
# contract; the EXECUTABLE binding for each is the named vitest test listed under
# `Tested by:`. The route scenarios render the real Nunjucks template end-to-end.

Feature: Case lifecycle report page
  As a caseworker
  I want a page that shows how many cases sit at each lifecycle position
  So that I can see where work is building up without running a query myself

  @walking_skeleton @driving_adapter @real-io
  Scenario: Caseworker views the lifecycle report
    # Tested by: routes/report.route.test.js "renders the lifecycle report table"
    Given cases of a type are spread across lifecycle positions
    When I visit the reports page
    Then I see a table of cases at each position
    And I see how many cases are shown in total
    And I can choose which case type to report on, with my current choice selected

  Scenario: The report reads as an indented roll-up
    # Tested by: view-models/report.view-model.test.js
    #            "flattens phases into indented numeric table rows"
    Given a report with phases, stages and statuses
    When the page is shown
    Then each phase is emphasised with its subtotal
    And its stages are indented beneath it
    And their statuses are indented further still

  Scenario: The case-type filter offers the available types
    # Tested by: view-models/report.view-model.test.js
    #            "builds the case-type select with the current selection marked"
    Given I am permitted to see more than one case type
    When the page is shown
    Then I can choose from those case types
    And my current choice is pre-selected

  @edge
  Scenario: A case type with no cases shows a clear message
    # Tested by: routes/report.route.test.js "shows an empty message when no cases match"
    #            view-models/report.view-model.test.js "reports no results when there are no phases"
    Given a case type that currently has no cases
    When I view its report
    Then I am told there are no cases, rather than shown an empty table

  Scenario: Choosing a case type asks the service for just that type
    # Tested by: repositories/report.repository.test.js
    #            "passes the selected case type through as a query string"
    Given I choose the "Woodland" case type
    When the page fetches the report
    Then it asks the service for the "Woodland" report only

  @edge
  Scenario: Opening the page with no choice asks for the default report
    # Tested by: repositories/report.repository.test.js
    #            "calls /cases/report with no query string when criteria is falsy"
    Given I have not chosen a case type
    When the page fetches the report
    Then it asks the service for the report without naming a case type
