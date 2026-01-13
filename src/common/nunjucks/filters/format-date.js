import { format, isDate, parseISO } from "date-fns";

export const DATE_FORMAT_SHORT_MONTH = "d MMM yyyy";
export const DATE_FORMAT_SHORT_MONTH_DATETIME = `${DATE_FORMAT_SHORT_MONTH} HH:mm`;
export const DATE_FORMAT_SORTABLE_DATE = "yyyy-MM-dd";

export const formatDate = (value, formattedDateStr = "EEE do MMMM yyyy") => {
  const date = isDate(value) ? value : parseISO(value);

  return format(date, formattedDateStr);
};
