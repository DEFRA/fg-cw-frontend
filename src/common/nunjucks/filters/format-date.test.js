import { describe, expect, it } from "vitest";
import { formatDate } from "./format-date.js";

describe("formatDate", () => {
  it("should correctly format a Date object with the default format", () => {
    const date = new Date(2023, 10, 15); // Month is 0-based, so 10 = November
    const result = formatDate(date);
    expect(result).toBe("Wed 15th November 2023");
  });

  it("should correctly format an ISO date string with the default format", () => {
    const isoDate = "2023-11-15T00:00:00.000Z";
    const result = formatDate(isoDate);
    expect(result).toBe("Wed 15th November 2023");
  });

  it("should correctly format a Date object with a custom format", () => {
    const date = new Date(2023, 10, 15); // Month is 0-based, so 10 = November
    const customFormat = "dd/MM/yyyy";
    const result = formatDate(date, customFormat);
    expect(result).toBe("15/11/2023");
  });

  it("should correctly format an ISO string with a custom format", () => {
    const isoDate = "2023-11-15T00:00:00.000Z";
    const customFormat = "MMMM do, yyyy";
    const result = formatDate(isoDate, customFormat);
    expect(result).toBe("November 15th, 2023");
  });

  it("should throw an error for invalid date input", () => {
    const invalidDate = "invalid-date-string";
    expect(() => formatDate(invalidDate)).toThrow("Invalid time value");
  });

  it("should throw an error if the input is not a date or ISO string", () => {
    const invalidInput = "12345";
    expect(() => formatDate(invalidInput)).toThrow("Invalid time value");
  });
});
