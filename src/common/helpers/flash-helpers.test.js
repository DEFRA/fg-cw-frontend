import { describe, expect, it, vi } from "vitest";
import {
  getFlashData,
  getFlashNotification,
  setFlashData,
} from "./flash-helpers.js";

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

    it("sets notification in flash storage when notification provided", () => {
      const mockRequest = createMockRequest();
      const notification = {
        variant: "success",
        title: "Action completed",
        text: "Action completed",
      };

      setFlashData(mockRequest, { notification });

      expect(mockRequest.yar.flash).toHaveBeenCalledWith(
        "notification",
        notification,
      );
    });

    it("sets errors, formData, and notification when all provided", () => {
      const mockRequest = createMockRequest();
      const errors = { email: "Invalid email" };
      const formData = { email: "invalid-email" };
      const notification = {
        variant: "error",
        title: "Validation failed",
        text: "Validation failed",
      };

      setFlashData(mockRequest, { errors, formData, notification });

      expect(mockRequest.yar.flash).toHaveBeenCalledWith("errors", errors);
      expect(mockRequest.yar.flash).toHaveBeenCalledWith("formData", formData);
      expect(mockRequest.yar.flash).toHaveBeenCalledWith(
        "notification",
        notification,
      );
      expect(mockRequest.yar.flash).toHaveBeenCalledTimes(3);
    });

    it("does not set notification when notification is undefined", () => {
      const mockRequest = createMockRequest();
      const errors = { name: "Required" };

      setFlashData(mockRequest, { errors });

      expect(mockRequest.yar.flash).toHaveBeenCalledWith("errors", errors);
      expect(mockRequest.yar.flash).not.toHaveBeenCalledWith(
        "notification",
        expect.anything(),
      );
    });
  });

  describe("getFlashData", () => {
    it("retrieves errors, formData, and notification from flash storage", () => {
      const mockRequest = createMockRequest();
      const expectedErrors = { field1: "Error message" };
      const expectedFormData = { name: "John" };
      const expectedNotification = {
        variant: "success",
        title: "Action completed",
        text: "Action completed",
      };

      mockRequest.yar.flash
        .mockReturnValueOnce([expectedErrors]) // First call for "errors"
        .mockReturnValueOnce([expectedFormData]) // Second call for "formData"
        .mockReturnValueOnce([expectedNotification]); // Third call for "notification"

      const result = getFlashData(mockRequest);

      expect(mockRequest.yar.flash).toHaveBeenCalledWith("errors");
      expect(mockRequest.yar.flash).toHaveBeenCalledWith("formData");
      expect(mockRequest.yar.flash).toHaveBeenCalledWith("notification");
      expect(result).toEqual({
        errors: expectedErrors,
        formData: expectedFormData,
        notification: expectedNotification,
      });
    });

    it("returns undefined for errors when no errors in flash", () => {
      const mockRequest = createMockRequest();
      const expectedFormData = { name: "John" };

      mockRequest.yar.flash
        .mockReturnValueOnce([]) // Empty array for "errors"
        .mockReturnValueOnce([expectedFormData]) // FormData exists
        .mockReturnValueOnce([]); // Empty array for "notification"

      const result = getFlashData(mockRequest);

      expect(result).toEqual({
        errors: undefined,
        formData: expectedFormData,
        notification: undefined,
      });
    });

    it("returns undefined for formData when no formData in flash", () => {
      const mockRequest = createMockRequest();
      const expectedErrors = { field1: "Error" };

      mockRequest.yar.flash
        .mockReturnValueOnce([expectedErrors]) // Errors exist
        .mockReturnValueOnce([]) // Empty array for "formData"
        .mockReturnValueOnce([]); // Empty array for "notification"

      const result = getFlashData(mockRequest);

      expect(result).toEqual({
        errors: expectedErrors,
        formData: undefined,
        notification: undefined,
      });
    });

    it("returns undefined for all when flash storage is empty", () => {
      const mockRequest = createMockRequest();

      mockRequest.yar.flash
        .mockReturnValueOnce([]) // Empty array for "errors"
        .mockReturnValueOnce([]) // Empty array for "formData"
        .mockReturnValueOnce([]); // Empty array for "notification"

      const result = getFlashData(mockRequest);

      expect(result).toEqual({
        errors: undefined,
        formData: undefined,
        notification: undefined,
      });
    });

    it("handles when flash returns undefined", () => {
      const mockRequest = createMockRequest();

      mockRequest.yar.flash
        .mockReturnValueOnce(undefined) // undefined for "errors"
        .mockReturnValueOnce(undefined) // undefined for "formData"
        .mockReturnValueOnce(undefined); // undefined for "notification"

      const result = getFlashData(mockRequest);

      expect(result).toEqual({
        errors: undefined,
        formData: undefined,
        notification: undefined,
      });
    });

    it("retrieves only the first item from flash array", () => {
      const mockRequest = createMockRequest();
      const firstError = { field1: "First error" };
      const secondError = { field1: "Second error" };
      const firstFormData = { name: "First" };
      const secondFormData = { name: "Second" };
      const firstNotification = {
        variant: "success",
        title: "First",
        text: "First",
      };
      const secondNotification = {
        variant: "error",
        title: "Second",
        text: "Second",
      };

      mockRequest.yar.flash
        .mockReturnValueOnce([firstError, secondError]) // Multiple errors
        .mockReturnValueOnce([firstFormData, secondFormData]) // Multiple formData
        .mockReturnValueOnce([firstNotification, secondNotification]); // Multiple notifications

      const result = getFlashData(mockRequest);

      expect(result).toEqual({
        errors: firstError,
        formData: firstFormData,
        notification: firstNotification,
      });
    });

    it("returns undefined for notification when no notification in flash", () => {
      const mockRequest = createMockRequest();
      const expectedErrors = { field1: "Error" };
      const expectedFormData = { name: "John" };

      mockRequest.yar.flash
        .mockReturnValueOnce([expectedErrors]) // Errors exist
        .mockReturnValueOnce([expectedFormData]) // FormData exists
        .mockReturnValueOnce([]); // Empty array for "notification"

      const result = getFlashData(mockRequest);

      expect(result).toEqual({
        errors: expectedErrors,
        formData: expectedFormData,
        notification: undefined,
      });
    });
  });

  describe("getFlashNotification", () => {
    it("retrieves notification from flash storage", () => {
      const mockRequest = createMockRequest();
      const expectedNotification = {
        variant: "success",
        title: "Success",
        text: "Operation completed successfully",
      };

      mockRequest.yar.flash.mockReturnValueOnce([expectedNotification]);

      const result = getFlashNotification(mockRequest);

      expect(mockRequest.yar.flash).toHaveBeenCalledWith("notification");
      expect(result).toEqual(expectedNotification);
    });

    it("returns undefined when no notification in flash storage", () => {
      const mockRequest = createMockRequest();

      mockRequest.yar.flash.mockReturnValueOnce([]);

      const result = getFlashNotification(mockRequest);

      expect(mockRequest.yar.flash).toHaveBeenCalledWith("notification");
      expect(result).toBeUndefined();
    });

    it("returns undefined when flash returns undefined", () => {
      const mockRequest = createMockRequest();

      mockRequest.yar.flash.mockReturnValueOnce(undefined);

      const result = getFlashNotification(mockRequest);

      expect(mockRequest.yar.flash).toHaveBeenCalledWith("notification");
      expect(result).toBeUndefined();
    });

    it("retrieves only the first notification from flash array", () => {
      const mockRequest = createMockRequest();
      const firstNotification = {
        variant: "success",
        title: "First",
        text: "First notification",
      };
      const secondNotification = {
        variant: "error",
        title: "Second",
        text: "Second notification",
      };

      mockRequest.yar.flash.mockReturnValueOnce([
        firstNotification,
        secondNotification,
      ]);

      const result = getFlashNotification(mockRequest);

      expect(result).toEqual(firstNotification);
    });

    it("retrieves error notification", () => {
      const mockRequest = createMockRequest();
      const errorNotification = {
        variant: "error",
        title: "Error",
        text: "Something went wrong",
      };

      mockRequest.yar.flash.mockReturnValueOnce([errorNotification]);

      const result = getFlashNotification(mockRequest);

      expect(result).toEqual(errorNotification);
    });

    it("retrieves information notification", () => {
      const mockRequest = createMockRequest();
      const infoNotification = {
        variant: "information",
        title: "Information",
        text: "Please note this information",
      };

      mockRequest.yar.flash.mockReturnValueOnce([infoNotification]);

      const result = getFlashNotification(mockRequest);

      expect(result).toEqual(infoNotification);
    });

    it("retrieves warning notification", () => {
      const mockRequest = createMockRequest();
      const warningNotification = {
        variant: "warning",
        title: "Warning",
        text: "Please be aware of this",
      };

      mockRequest.yar.flash.mockReturnValueOnce([warningNotification]);

      const result = getFlashNotification(mockRequest);

      expect(result).toEqual(warningNotification);
    });
  });
});
