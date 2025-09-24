import { formatDate } from "../nunjucks/filters/format-date.js";

export const filters = {
  fixed: (value, decimals = 0) => {
    return Number(value).toFixed(decimals);
  },

  date: (value, format) => {
    return formatDate(value, format);
  },
};
