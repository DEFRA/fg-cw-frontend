export const toStringOrEmpty = (value) => {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value);
};
