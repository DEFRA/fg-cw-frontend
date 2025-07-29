import jsonpath from "jsonpath";
import { getFormattedGBDate } from "./date-helpers.js";

// Simple function to resolve JSON path references in banner configuration
const resolveBannerPaths = (banner, caseData) => {
  if (!banner) {
    return banner;
  }

  const resolved = JSON.parse(JSON.stringify(banner));

  processTitle(resolved, caseData);
  processSummary(resolved, caseData);

  return resolved;
};

// Process title field
const processTitle = (resolved, caseData) => {
  if (resolved.title) {
    processField(resolved.title, caseData);
  }
};

// Process summary fields
const processSummary = (resolved, caseData) => {
  if (resolved.summary) {
    Object.values(resolved.summary).forEach((field) =>
      processField(field, caseData),
    );
  }
};

// Process a single field if it has a JSON path reference
const processField = (field, caseData) => {
  if (hasJsonPathRef(field)) {
    processFieldWithRef(field, caseData);
  }
};

// Helper to process a single field with JSON path reference
const processFieldWithRef = (field, caseData) => {
  const value = resolveJsonPathValue(field.ref, caseData);
  const formattedValue = formatValueByType(value, field.type);

  // Set value to empty string if null, undefined, or falsy
  field.value = formattedValue ?? "";
  delete field.ref;
};

// Helper to check if field has JSON path reference
const hasJsonPathRef = (field) => {
  return field.ref?.startsWith("$");
};

// Helper to resolve a JSON path value
const resolveJsonPathValue = (ref, caseData) => {
  return jsonpath.value(caseData, ref);
};

// Helper to format value based on type
const formatValueByType = (value, type) => {
  if (type === "date" && value) {
    return getFormattedGBDate(value);
  }
  return value;
};

export { resolveBannerPaths };
