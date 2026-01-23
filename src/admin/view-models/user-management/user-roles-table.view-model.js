import { format } from "date-fns";

import { parseDate } from "../../../common/helpers/date-helpers.js";
import {
  buildRoleDateKeys,
  normaliseRoleCodes,
} from "../../../common/helpers/role-helpers.js";
import { toStringOrEmpty } from "../../../common/helpers/string-helpers.js";

export const createUserRolesTableViewModel = ({
  user,
  roles,
  errors,
  formData,
} = {}) => {
  const rolesMap = createRolesMap(roles);
  const assignedRoles = getAssignedRoles(user);
  const assignedCodes = Object.keys(assignedRoles);

  const assignableCodes = getAssignableRoleCodes(roles);
  const mergedCodes = mergeRoleCodes({ assignableCodes, assignedCodes });

  const selectedRoleCodes = getRoleCodesFromFormData(formData) ?? assignedCodes;
  const safeErrors = errors ?? {};

  const rows = mergedCodes.map((code) =>
    buildRoleRow({
      role: rolesMap.get(code) ?? { code, description: code },
      assignedRoles,
      selectedRoleCodes,
      errors: safeErrors,
      formData,
    }),
  );

  return sortRows(rows);
};

const getAssignedRoles = (user) => user?.appRoles ?? {};

const getAssignableRoleCodes = (roles) =>
  roles
    .filter((role) => role?.assignable === true && Boolean(role.code))
    .map((role) => role.code);

const getRoleCodesFromFormData = (formData) => {
  if (!formData) {
    return null;
  }

  if (!Object.prototype.hasOwnProperty.call(formData, "roles")) {
    return null;
  }

  return normaliseRoleCodes(formData.roles);
};

const mergeRoleCodes = ({ assignableCodes, assignedCodes }) => {
  const codeSet = new Set([...assignableCodes, ...assignedCodes]);
  return Array.from(codeSet);
};

const sortRows = (rows) =>
  [...rows].sort((a, b) => {
    if (a.checked !== b.checked) {
      return a.checked ? -1 : 1;
    }

    return a.code.localeCompare(b.code);
  });

const buildRoleRow = ({
  role,
  assignedRoles,
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
    assignedRoles,
    code,
    prop: "startDate",
  });
  const endDateRaw = getDateRaw({
    formData,
    key: endKey,
    assignedRoles,
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
    description: role.description ?? "",
    checked,
    startKey,
    endKey,
    startDate,
    endDate,
  };
};

const getDateRaw = ({ formData, key, assignedRoles, code, prop }) => {
  const formValue = tryReadFormValue(formData, key);
  if (formValue.found) {
    return formValue.value;
  }

  return readAssignedRoleValue(assignedRoles, code, prop);
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

const readAssignedRoleValue = (assignedRoles, code, prop) => {
  if (!assignedRoles) {
    return "";
  }

  const allocation = assignedRoles[code];
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

const createRolesMap = (roles) => {
  const rolesByCode = new Map();

  roles.forEach((role) => {
    rolesByCode.set(role.code, role);
  });

  return rolesByCode;
};

const normaliseDateForHtmlInput = (value) => {
  const raw = toStringOrEmpty(value).trim();
  if (!raw) {
    return "";
  }

  const parsed = parseDate(raw);
  if (!parsed) {
    return "";
  }

  return format(parsed, "yyyy-MM-dd");
};
