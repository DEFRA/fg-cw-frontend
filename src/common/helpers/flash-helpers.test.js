import { describe, expect, it, vi } from "vitest";
import { getFlashData, setFlashData } from "./flash-helpers.js";

describe("flash-helpers", () => {
  const createMockRequest = () => ({
    yar: {
      flash: vi.fn(),
    },
  });

  describe("setFlashData", () => {
    it("sets errors in flash storage when errors provided", () => {
      const mockRequest = createMockRequest();
      const errors = { field1: "Error message" };

      setFlashData(mockRequest, { errors });

      expect(mockRequest.yar.flash).toHaveBeenCalledWith("errors", errors);
    });

    it("sets formData in flash storage when formData provided", () => {
      const mockRequest = createMockRequest();
      const formData = { name: "John", email: "john@example.com" };

      setFlashData(mockRequest, { formData });

      expect(mockRequest.yar.flash).toHaveBeenCalledWith("formData", formData);
    });

    it("sets both errors and formData when both provided", () => {
      const mockRequest = createMockRequest();
      const errors = { email: "Invalid email" };
      const formData = { email: "invalid-email" };

      setFlashData(mockRequest, { errors, formData });

      expect(mockRequest.yar.flash).toHaveBeenCalledWith("errors", errors);
      expect(mockRequest.yar.flash).toHaveBeenCalledWith("formData", formData);
      expect(mockRequest.yar.flash).toHaveBeenCalledTimes(2);
    });

    it("does not set errors when errors is undefined", () => {
      const mockRequest = createMockRequest();
      const formData = { name: "John" };

      setFlashData(mockRequest, { formData });

      expect(mockRequest.yar.flash).not.toHaveBeenCalledWith(
        "errors",
        expect.anything(),
      );
      expect(mockRequest.yar.flash).toHaveBeenCalledWith("formData", formData);
    });

    it("does not set formData when formData is undefined", () => {
      const mockRequest = createMockRequest();
      const errors = { name: "Required" };

      setFlashData(mockRequest, { errors });

      expect(mockRequest.yar.flash).toHaveBeenCalledWith("errors", errors);
      expect(mockRequest.yar.flash).not.toHaveBeenCalledWith(
        "formData",
        expect.anything(),
      );
    });

    it("does nothing when both errors and formData are undefined", () => {
      const mockRequest = createMockRequest();

      setFlashData(mockRequest, {});

      expect(mockRequest.yar.flash).not.toHaveBeenCalled();
    });

    it("sets errors when errors is null", () => {
      const mockRequest = createMockRequest();

      setFlashData(mockRequest, { errors: null });

      expect(mockRequest.yar.flash).toHaveBeenCalledWith("errors", null);
    });

    it("sets formData when formData is null", () => {
      const mockRequest = createMockRequest();

      setFlashData(mockRequest, { formData: null });

      expect(mockRequest.yar.flash).toHaveBeenCalledWith("formData", null);
    });

    it("sets errors when errors is empty object", () => {
      const mockRequest = createMockRequest();

      setFlashData(mockRequest, { errors: {} });

      expect(mockRequest.yar.flash).toHaveBeenCalledWith("errors", {});
    });

    it("sets formData when formData is empty object", () => {
      const mockRequest = createMockRequest();

      setFlashData(mockRequest, { formData: {} });

      expect(mockRequest.yar.flash).toHaveBeenCalledWith("formData", {});
    });
  });

  describe("getFlashData", () => {
    it("retrieves errors and formData from flash storage", () => {
      const mockRequest = createMockRequest();
      const expectedErrors = { field1: "Error message" };
      const expectedFormData = { name: "John" };

      mockRequest.yar.flash
        .mockReturnValueOnce([expectedErrors]) // First call for "errors"
        .mockReturnValueOnce([expectedFormData]); // Second call for "formData"

      const result = getFlashData(mockRequest);

      expect(mockRequest.yar.flash).toHaveBeenCalledWith("errors");
      expect(mockRequest.yar.flash).toHaveBeenCalledWith("formData");
      expect(result).toEqual({
        errors: expectedErrors,
        formData: expectedFormData,
      });
    });

    it("returns undefined for errors when no errors in flash", () => {
      const mockRequest = createMockRequest();
      const expectedFormData = { name: "John" };

      mockRequest.yar.flash
        .mockReturnValueOnce([]) // Empty array for "errors"
        .mockReturnValueOnce([expectedFormData]); // FormData exists

      const result = getFlashData(mockRequest);

      expect(result).toEqual({
        errors: undefined,
        formData: expectedFormData,
      });
    });

    it("returns undefined for formData when no formData in flash", () => {
      const mockRequest = createMockRequest();
      const expectedErrors = { field1: "Error" };

      mockRequest.yar.flash
        .mockReturnValueOnce([expectedErrors]) // Errors exist
        .mockReturnValueOnce([]); // Empty array for "formData"

      const result = getFlashData(mockRequest);

      expect(result).toEqual({
        errors: expectedErrors,
        formData: undefined,
      });
    });

    it("returns undefined for both when flash storage is empty", () => {
      const mockRequest = createMockRequest();

      mockRequest.yar.flash
        .mockReturnValueOnce([]) // Empty array for "errors"
        .mockReturnValueOnce([]); // Empty array for "formData"

      const result = getFlashData(mockRequest);

      expect(result).toEqual({
        errors: undefined,
        formData: undefined,
      });
    });

    it("handles when flash returns undefined", () => {
      const mockRequest = createMockRequest();

      mockRequest.yar.flash
        .mockReturnValueOnce(undefined) // undefined for "errors"
        .mockReturnValueOnce(undefined); // undefined for "formData"

      const result = getFlashData(mockRequest);

      expect(result).toEqual({
        errors: undefined,
        formData: undefined,
      });
    });

    it("retrieves only the first item from flash array", () => {
      const mockRequest = createMockRequest();
      const firstError = { field1: "First error" };
      const secondError = { field1: "Second error" };
      const firstFormData = { name: "First" };
      const secondFormData = { name: "Second" };

      mockRequest.yar.flash
        .mockReturnValueOnce([firstError, secondError]) // Multiple errors
        .mockReturnValueOnce([firstFormData, secondFormData]); // Multiple formData

      const result = getFlashData(mockRequest);

      expect(result).toEqual({
        errors: firstError,
        formData: firstFormData,
      });
    });
  });
});
