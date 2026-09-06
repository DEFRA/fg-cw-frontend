import { describe, expect, it, vi } from "vitest";
import {
  componentsPreviewSessionKey,
  getComponentsContentUseCase,
  updateComponentsPreviewUseCase,
} from "./components.use-case.js";

describe("components.use-case", () => {
  describe("getComponentsContentUseCase", () => {
    it("returns the components content stored in the session", () => {
      const session = {
        get: vi.fn().mockReturnValue([{ id: "component-1" }]),
      };

      const result = getComponentsContentUseCase(session);

      expect(session.get).toHaveBeenCalledWith(componentsPreviewSessionKey);
      expect(result).toEqual([{ id: "component-1" }]);
    });
  });

  describe("updateComponentsPreviewUseCase", () => {
    it.each([
      {
        description: "payload is missing",
        jsonPayload: "",
        expectedError: "Enter a JSON payload",
      },
      {
        description: "payload only contains whitespace",
        jsonPayload: "   ",
        expectedError: "Enter a JSON payload",
      },
      {
        description: "payload cannot be parsed as JSON",
        jsonPayload: "{invalid-json}",
        expectedError: "Enter a valid JSON payload",
      },
      {
        description: "parsed payload is not an array",
        jsonPayload: '{"foo":"bar"}',
        expectedError: "JSON payload must be an array of components",
      },
    ])(
      "returns an error when the $description",
      ({ jsonPayload, expectedError }) => {
        const session = { set: vi.fn() };

        const result = updateComponentsPreviewUseCase({
          session,
          jsonPayload,
        });

        expect(result).toEqual({
          errors: { jsonPayload: expectedError },
        });
        expect(session.set).not.toHaveBeenCalled();
      },
    );

    it("stores the parsed content in the session and returns it", () => {
      const session = { set: vi.fn() };
      const payload = '[{"id":"component-1"}]';

      const result = updateComponentsPreviewUseCase({
        session,
        jsonPayload: payload,
      });

      expect(session.set).toHaveBeenCalledWith(componentsPreviewSessionKey, [
        { id: "component-1" },
      ]);
      expect(result).toEqual({ content: [{ id: "component-1" }] });
    });
  });
});
