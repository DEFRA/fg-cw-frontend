export const getLabelText = (label) =>
  typeof label === "object" ? label.text : label;

export const toStringOrEmpty = (value) => {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
};
