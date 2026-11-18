const sharedFields = ["search", "caseRef", "workflowCode", "createdAt"];

const pickPresent = (source, fields) =>
  Object.fromEntries(
    fields
      .filter((field) => source[field] !== undefined)
      .map((field) => [field, source[field]]),
  );

export const toCaseListCriteria = (query = {}, page = {}) => ({
  ...pickPresent(query, sharedFields),
  ...pickPresent(page, ["cursor", "direction"]),
});
