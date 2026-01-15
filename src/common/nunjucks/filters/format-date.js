import { format, isDate, parseISO } from "date-fns";
import { isNil } from "lodash";

export const DATE_FORMAT_SHORT_MONTH = "d MMM yyyy";
export const DATE_FORMAT_SHORT_DATE_TIME = `${DATE_FORMAT_SHORT_MONTH} HH:mm`;
export const DATE_FORMAT_SORTABLE_DATE = "yyyy-MM-dd";

export const formatDate = (value, formattedDateStr = "EEE do MMMM yyyy") => {
  if (isNil(value)) {
    return "";
  }

  const date = isDate(value) ? value : parseISO(value);
  return format(date, formattedDateStr);
};
