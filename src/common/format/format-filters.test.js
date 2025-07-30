import { describe, expect, it } from "vitest";
import { filters } from "./format-filters.js";

describe("format-filters", () => {
  describe("fixed filter", () => {
    it("should format number with default 0 decimal places", () => {
      const result = filters.fixed(123.456);
      expect(result).toBe("123");
    });

    it("should format number with specified decimal places", () => {
      const result = filters.fixed(123.456, 2);
      expect(result).toBe("123.46");
    });

    it("should format number with 1 decimal place", () => {
      const result = filters.fixed(123.456, 1);
      expect(result).toBe("123.5");
    });

    it("should format integer with decimal places", () => {
      const result = filters.fixed(123, 2);
      expect(result).toBe("123.00");
    });

    it("should handle string numbers", () => {
      const result = filters.fixed("123.456", 2);
      expect(result).toBe("123.46");
    });

    it("should handle zero", () => {
      const result = filters.fixed(0, 2);
      expect(result).toBe("0.00");
    });

    it("should handle negative numbers", () => {
      const result = filters.fixed(-123.456, 2);
      expect(result).toBe("-123.46");
    });
  });

  describe("date filter", () => {
    it("should format ISO date string with default format", () => {
      const isoDate = "2023-11-15T00:00:00.000Z";
      const result = filters.date(isoDate);
      expect(result).toBe("Wed 15th November 2023");
    });

    it("should format ISO date string with custom format", () => {
      const isoDate = "2023-11-15T00:00:00.000Z";
      const customFormat = "dd/MM/yyyy";
      const result = filters.date(isoDate, customFormat);
      expect(result).toBe("15/11/2023");
    });

    it("should format Date object with default format", () => {
      const date = new Date(2023, 10, 15); // Month is 0-based, so 10 = November
      const result = filters.date(date);
      expect(result).toBe("Wed 15th November 2023");
    });

    it("should format Date object with custom format", () => {
      const date = new Date(2023, 10, 15); // Month is 0-based, so 10 = November
      const customFormat = "MMMM do, yyyy";
      const result = filters.date(date, customFormat);
      expect(result).toBe("November 15th, 2023");
    });

    it("should throw an error for invalid date input", () => {
      const invalidDate = "invalid-date-string";
      expect(() => filters.date(invalidDate)).toThrow("Invalid time value");
    });
  });
});
