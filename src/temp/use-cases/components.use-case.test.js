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
    it("returns an error when the payload is missing", () => {
      const session = { set: vi.fn() };

      const result = updateComponentsPreviewUseCase({
        session,
        jsonPayload: "",
      });

      expect(result).toEqual({
        errors: { jsonPayload: "Enter a JSON payload" },
      });
      expect(session.set).not.toHaveBeenCalled();
    });

    it("returns an error when the payload only contains whitespace", () => {
      const session = { set: vi.fn() };

      const result = updateComponentsPreviewUseCase({
        session,
        jsonPayload: "   ",
      });

      expect(result).toEqual({
        errors: { jsonPayload: "Enter a JSON payload" },
      });
      expect(session.set).not.toHaveBeenCalled();
    });

    it("returns an error when the payload cannot be parsed as JSON", () => {
      const session = { set: vi.fn() };

      const result = updateComponentsPreviewUseCase({
        session,
        jsonPayload: "{invalid-json}",
      });

      expect(result).toEqual({
        errors: { jsonPayload: "Enter a valid JSON payload" },
      });
      expect(session.set).not.toHaveBeenCalled();
    });

    it("returns an error when the parsed payload is not an array", () => {
      const session = { set: vi.fn() };

      const result = updateComponentsPreviewUseCase({
        session,
        jsonPayload: '{"foo":"bar"}',
      });

      expect(result).toEqual({
        errors: { jsonPayload: "JSON payload must be an array of components" },
      });
      expect(session.set).not.toHaveBeenCalled();
    });

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
