export const normaliseRoleCodes = (roles) => {
  if (!roles) {
    return [];
  }

  return Array.isArray(roles) ? roles : [roles];
};

export const buildRoleDateKeys = (code) => ({
  startKey: `startDate__${code}`,
  endKey: `endDate__${code}`,
});
