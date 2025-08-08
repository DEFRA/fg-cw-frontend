import { format, isDate, parseISO } from "date-fns";

export const DATE_FORMAT_SHORT_MONTH = "dd MMM yyyy";

export const formatDate = (value, formattedDateStr = "EEE do MMMM yyyy") => {
  const date = isDate(value) ? value : parseISO(value);

  return format(date, formattedDateStr);
};
