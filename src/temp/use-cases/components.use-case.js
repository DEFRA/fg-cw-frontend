import JSON5 from "json5";

export const componentsPreviewSessionKey = "componentsContent";

export const getComponentsContentUseCase = (session) => {
  return session.get(componentsPreviewSessionKey);
};

export const updateComponentsPreviewUseCase = ({ session, jsonPayload }) => {
  if (!isNonEmptyString(jsonPayload)) {
    return createPayloadError("Enter a JSON payload");
  }

  let parsed;
  try {
    parsed = JSON5.parse(jsonPayload);
  } catch {
    return createPayloadError("Enter a valid JSON payload");
  }

  if (!Array.isArray(parsed)) {
    return createPayloadError("JSON payload must be an array of components");
  }

  session.set(componentsPreviewSessionKey, parsed);

  return { content: parsed };
};

const createPayloadError = (message) => ({
  errors: {
    jsonPayload: message,
  },
});

const isNonEmptyString = (value) =>
  typeof value === "string" && value.trim() !== "";
