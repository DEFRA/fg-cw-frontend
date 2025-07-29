import { logger } from "../logger.js";
import { filters } from "./format-filters.js";

export const format = (data, template) => {
  if (!template) {
    return String(data);
  }

  return template.replace(/\{\{([^}]+)\}\}/g, (match, expression) => {
    return processExpression(data, match, expression);
  });
};

const processExpression = (data, match, expression) => {
  const parts = expression.split(/\s*\|\s*/);
  const key = parts[0].trim();
  const filterExpression = parts[1];

  const value = getValue(data, key);
  if (value === undefined) {
    return match;
  }

  if (filterExpression) {
    const result = applyFilter(value, filterExpression);
    return result !== undefined ? result : match;
  }

  return value;
};

const getValue = (data, key) => {
  if (typeof data === "object" && data !== null) {
    return key.split(".").reduce((o, prop) => o?.[prop], data);
  }
  return key === "value" ? data : undefined;
};

const parseFilter = (filterExpression) => {
  const filterMatch = filterExpression.match(/^(\w+)(?:\(([^)]*)\))?$/);
  if (!filterMatch) {
    return null;
  }

  return {
    name: filterMatch[1],
    argsString: filterMatch[2],
  };
};

const executeFilter = (filterFunction, value, args, filterName) => {
  try {
    return filterFunction(value, ...args);
  } catch (error) {
    logger.error(`Error applying filter "${filterName}":`, error);
    return value;
  }
};

const applyFilter = (value, filterExpression) => {
  const filterInfo = parseFilter(filterExpression);
  if (!filterInfo) {
    return value;
  }

  const filterFunction = filters[filterInfo.name];
  if (!filterFunction) {
    logger.warn(`Filter "${filterInfo.name}" not found`);
    return value;
  }

  const args = filterInfo.argsString
    ? parseFilterArguments(filterInfo.argsString)
    : [];

  return executeFilter(filterFunction, value, args, filterInfo.name);
};

const parseFilterArguments = (argsString) =>
  argsString.split(",").map(parseArgument);

const parseArgument = (arg) => {
  const trimmed = arg.trim();

  if (isQuotedString(trimmed)) {
    return trimmed.slice(1, -1);
  }

  const parsed = parseNumber(trimmed);
  if (parsed !== null) {
    return parsed;
  }

  return parseBoolean(trimmed);
};

const isQuotedString = (arg) => {
  return (
    (arg.startsWith('"') && arg.endsWith('"')) ||
    (arg.startsWith("'") && arg.endsWith("'"))
  );
};

const parseNumber = (arg) => {
  const num = Number(arg);
  return !isNaN(num) && arg !== "" ? num : null;
};

const parseBoolean = (arg) => {
  if (arg === "true") {
    return true;
  }
  if (arg === "false") {
    return false;
  }
  return arg;
};
