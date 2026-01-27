export const normaliseRoleCodes = (roles) => {
  if (!roles) {
    return [];
  }

  if (Array.isArray(roles)) {
    return roles;
  }

  return [roles];
};

export const buildRoleDateKeys = (code) => ({
  startKey: `startDate__${code}`,
  endKey: `endDate__${code}`,
});
