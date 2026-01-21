import { format, isValid, parse, parseISO } from "date-fns";

export const createUserRolesViewModel = ({
  user,
  roles,
  userId,
  errors,
  formData,
}) => {
  const safeErrors = normaliseErrors(errors);
  const allocatedRoles = getAllocatedRoles(user);

  const mergedRoles = mergeRoles({ roles, allocatedRoles });
  const selectedRoleCodes = resolveSelectedRoleCodes({
    allocatedRoles,
    formData,
  });

  const rows = mergedRoles.map((role) =>
    buildRoleRow({
      role,
      allocatedRoles,
      selectedRoleCodes,
      errors: safeErrors,
      formData,
    }),
  );

  return {
    pageTitle: "User roles",
    breadcrumbs: [
      { text: "Users", href: "/admin/user-management" },
      { text: "User details", href: `/admin/user-management/${userId}` },
      { text: "User roles" },
    ],
    backLink: `/admin/user-management/${userId}`,
    data: {
      userId,
      userName: getUserName(user),
      roles: rows,
    },
    errors: safeErrors,
    errorList: buildErrorList(safeErrors),
  };
};

const normaliseErrors = (errors) => {
  if (errors) {
    return errors;
  }

  return {};
};

const getAllocatedRoles = (user) => {
  if (!user) {
    return {};
  }

  if (!user.appRoles) {
    return {};
  }

  return user.appRoles;
};

const getUserName = (user) => {
  if (!user) {
    return "";
  }

  if (!user.name) {
    return "";
  }

  return user.name;
};

const resolveSelectedRoleCodes = ({ allocatedRoles, formData }) => {
  const selectedFromForm = getRoleCodesFromFormData(formData);
  if (selectedFromForm !== null) {
    return selectedFromForm;
  }

  return getAllocatedCodes(allocatedRoles);
};

const getRoleCodesFromFormData = (formData) => {
  if (!formData) {
    return null;
  }

  if (!Object.prototype.hasOwnProperty.call(formData, "roles")) {
    return null;
  }

  return normaliseRoleCodes(formData.roles);
};

const getAllocatedCodes = (allocatedRoles) => {
  if (!allocatedRoles) {
    return [];
  }

  return Object.keys(allocatedRoles);
};

const buildRoleRow = ({
  role,
  allocatedRoles,
  selectedRoleCodes,
  errors,
  formData,
}) => {
  const code = role.code;
  const { startKey, endKey } = buildRoleDateKeys(code);

  const checked = selectedRoleCodes.includes(code);

  const startDateRaw = getDateRaw({
    formData,
    key: startKey,
    allocatedRoles,
    code,
    prop: "startDate",
  });
  const endDateRaw = getDateRaw({
    formData,
    key: endKey,
    allocatedRoles,
    code,
    prop: "endDate",
  });

  const startDate = formatDateForInput({
    raw: startDateRaw,
    error: errors[startKey],
  });
  const endDate = formatDateForInput({
    raw: endDateRaw,
    error: errors[endKey],
  });

  return {
    code,
    description: getRoleDescription(role),
    checked,
    startKey,
    endKey,
    startDate,
    endDate,
  };
};

const getRoleDescription = (role) => {
  if (!role) {
    return "";
  }

  if (!role.description) {
    return "";
  }

  return role.description;
};

const getDateRaw = ({ formData, key, allocatedRoles, code, prop }) => {
  const formValue = tryReadFormValue(formData, key);
  if (formValue.found) {
    return formValue.value;
  }

  return readAllocatedRoleValue(allocatedRoles, code, prop);
};

const tryReadFormValue = (formData, key) => {
  if (!formData) {
    return { found: false, value: "" };
  }

  if (!Object.prototype.hasOwnProperty.call(formData, key)) {
    return { found: false, value: "" };
  }

  return { found: true, value: formData[key] };
};

const readAllocatedRoleValue = (allocatedRoles, code, prop) => {
  if (!allocatedRoles) {
    return "";
  }

  const allocation = allocatedRoles[code];
  if (!allocation) {
    return "";
  }

  const value = allocation[prop];
  if (!value) {
    return "";
  }

  return value;
};

const formatDateForInput = ({ raw, error }) => {
  if (error) {
    return toStringOrEmpty(raw);
  }

  return normaliseDateForHtmlInput(raw);
};

const mergeRoles = ({ roles, allocatedRoles }) => {
  const byCode = new Map();
  const roleArray = toArray(roles);

  for (const role of roleArray) {
    const entry = toRoleEntry(role);
    if (entry) {
      byCode.set(entry.code, entry);
    }
  }

  const allocatedCodes = getAllocatedCodes(allocatedRoles);
  for (const code of allocatedCodes) {
    addIfMissing(byCode, code);
  }

  return [...byCode.values()].sort(compareRoleCodes);
};

const toArray = (value) => {
  if (Array.isArray(value)) {
    return value;
  }

  return [];
};

const toRoleEntry = (role) => {
  if (!role) {
    return null;
  }

  if (!role.code) {
    return null;
  }

  return { code: role.code, description: role.description };
};

const addIfMissing = (map, code) => {
  if (!map.has(code)) {
    map.set(code, { code, description: "" });
  }
};

const compareRoleCodes = (a, b) => a.code.localeCompare(b.code);

const buildErrorList = (errors) =>
  Object.entries(errors)
    .map(([key, message]) => toErrorSummaryItem(key, message))
    .filter(Boolean);

const toErrorSummaryItem = (key, message) => {
  if (!message) {
    return null;
  }

  if (key === "save") {
    return { text: message };
  }

  return { text: message, href: `#${key}` };
};

const normaliseRoleCodes = (roles) => {
  if (!roles) {
    return [];
  }

  if (Array.isArray(roles)) {
    return roles;
  }

  return [roles];
};

const normaliseDateForHtmlInput = (value) => {
  const raw = toStringOrEmpty(value).trim();
  if (!raw) {
    return "";
  }

  const parsed = parseFlexibleDate(raw);
  if (!parsed) {
    return "";
  }

  return format(parsed, "yyyy-MM-dd");
};

const parseFlexibleDate = (raw) => {
  const iso = parseISO(raw);
  if (isValid(iso)) {
    return iso;
  }

  const dmy = parse(raw, "dd MMM yyyy", new Date());
  if (isValid(dmy)) {
    return dmy;
  }

  const dmySingle = parse(raw, "d MMM yyyy", new Date());
  if (isValid(dmySingle)) {
    return dmySingle;
  }

  return null;
};

const buildRoleDateKeys = (code) => ({
  startKey: `startDate__${code}`,
  endKey: `endDate__${code}`,
});

const toStringOrEmpty = (value) => {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value);
};
