import { describe, expect, it, vi } from "vitest";
import { wreck } from "../../common/wreck.js";
import { getReport } from "./report.repository.js";

vi.mock("../../common/wreck.js");

describe("Report Repository", () => {
  const authContext = { token: "mock-token" };

  describe("getReport", () => {
    // Given no case type is selected
    // When the report is fetched
    // Then /cases/report is called with no query string
    it("calls /cases/report with no query string when criteria is falsy", async () => {
      wreck.get.mockResolvedValueOnce({ payload: { phases: [] } });

      const result = await getReport(authContext);

      expect(wreck.get).toHaveBeenCalledWith("/cases/report", {
        headers: {
          authorization: `Bearer ${authContext.token}`,
        },
      });
      expect(result).toEqual({ phases: [] });
    });

    // Given a case type is selected
    // When the report is fetched
    // Then it is passed through as a query string with the bearer token
    it("passes the selected case type through as a query string", async () => {
      const report = { selectedCaseType: "woodland", total: 7, phases: [] };
      wreck.get.mockResolvedValueOnce({ payload: report });

      const result = await getReport(authContext, { workflowCode: "woodland" });

      expect(wreck.get).toHaveBeenCalledWith(
        "/cases/report?workflowCode=woodland",
        {
          headers: {
            authorization: `Bearer ${authContext.token}`,
          },
        },
      );
      expect(result).toEqual(report);
    });

    // Given the blank case-type placeholder has been submitted
    // When the report is fetched
    // Then the backend is called as if no case type has been selected
    it("does not send workflowCode when the selected case type is blank", async () => {
      wreck.get.mockResolvedValueOnce({ payload: { phases: [] } });

      await getReport(authContext, { workflowCode: "" });

      expect(wreck.get).toHaveBeenCalledWith("/cases/report", {
        headers: {
          authorization: `Bearer ${authContext.token}`,
        },
      });
    });
  });
});
