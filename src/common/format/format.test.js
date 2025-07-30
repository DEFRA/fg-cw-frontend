import { describe, expect, it } from "vitest";
import { format } from "./format.js";

describe("format", () => {
  describe("basic functionality", () => {
    it("should return string representation of data when no template provided", () => {
      expect(format(123)).toBe("123");
      expect(format("hello")).toBe("hello");
      expect(format(null)).toBe("null");
      expect(format(undefined)).toBe("undefined");
    });

    it("should return template as-is when no placeholders", () => {
      const template = "Hello world";
      expect(format({}, template)).toBe("Hello world");
    });
  });

  describe("simple value replacement", () => {
    it("should replace single placeholder with object property", () => {
      const data = { name: "John" };
      const template = "Hello {{name}}";
      expect(format(data, template)).toBe("Hello John");
    });

    it("should replace multiple placeholders", () => {
      const data = { firstName: "John", lastName: "Doe" };
      const template = "{{firstName}} {{lastName}}";
      expect(format(data, template)).toBe("John Doe");
    });

    it("should handle nested object properties", () => {
      const data = { user: { profile: { name: "John" } } };
      const template = "Hello {{user.profile.name}}";
      expect(format(data, template)).toBe("Hello John");
    });

    it("should handle primitive data with 'value' key", () => {
      const template = "The value is {{value}}";
      expect(format(42, template)).toBe("The value is 42");
      expect(format("hello", template)).toBe("The value is hello");
    });
  });

  describe("undefined value handling", () => {
    it("should keep placeholder when property doesn't exist", () => {
      const data = { name: "John" };
      const template = "Hello {{missing}}";
      expect(format(data, template)).toBe("Hello {{missing}}");
    });

    it("should keep placeholder when nested property doesn't exist", () => {
      const data = { user: {} };
      const template = "Hello {{user.profile.name}}";
      expect(format(data, template)).toBe("Hello {{user.profile.name}}");
    });

    it("should keep placeholder when accessing property on null", () => {
      const data = { user: null };
      const template = "Hello {{user.name}}";
      expect(format(data, template)).toBe("Hello {{user.name}}");
    });
  });

  describe("filter application", () => {
    it("should apply fixed filter with default decimals", () => {
      const data = { price: 123.456 };
      const template = "Price: {{price | fixed}}";
      expect(format(data, template)).toBe("Price: 123");
    });

    it("should apply fixed filter with specified decimals", () => {
      const data = { price: 123.456 };
      const template = "Price: {{price | fixed(2)}}";
      expect(format(data, template)).toBe("Price: 123.46");
    });

    it("should apply date filter with default format", () => {
      const data = { created: "2023-11-15T00:00:00.000Z" };
      const template = "Created: {{created | date}}";
      expect(format(data, template)).toBe("Created: Wed 15th November 2023");
    });

    it("should apply date filter with custom format", () => {
      const data = { created: "2023-11-15T00:00:00.000Z" };
      const template = "Created: {{created | date('dd/MM/yyyy')}}";
      expect(format(data, template)).toBe("Created: 15/11/2023");
    });
  });

  describe("filter argument parsing", () => {
    it("should parse string arguments with double quotes", () => {
      const data = { date: "2023-11-15T00:00:00.000Z" };
      const template = '{{date | date("dd/MM/yyyy")}}';
      expect(format(data, template)).toBe("15/11/2023");
    });

    it("should parse string arguments with single quotes", () => {
      const data = { date: "2023-11-15T00:00:00.000Z" };
      const template = "{{date | date('dd/MM/yyyy')}}";
      expect(format(data, template)).toBe("15/11/2023");
    });

    it("should parse numeric arguments", () => {
      const data = { value: 123.456 };
      const template = "{{value | fixed(2)}}";
      expect(format(data, template)).toBe("123.46");
    });
  });

  describe("error handling", () => {
    it("should return original value when filter doesn't exist", () => {
      const data = { value: 123 };
      const template = "{{value | nonexistent}}";

      expect(format(data, template)).toBe("123");
    });

    it("should return original value when filter throws error", () => {
      const data = { date: "invalid-date" };
      const template = "{{date | date}}";

      expect(format(data, template)).toBe("invalid-date");
    });
  });
});
