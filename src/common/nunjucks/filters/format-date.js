import { tz } from "@date-fns/tz";
import { format, isDate, parseISO } from "date-fns";

export const formatDate = (value, formattedDateStr = "EEE do MMMM yyyy") => {
  const date = isDate(value) ? value : parseISO(value);

  return format(date, formattedDateStr, { in: tz("Europe/London") });
};
