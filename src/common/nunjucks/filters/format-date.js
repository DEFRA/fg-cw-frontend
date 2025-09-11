import { format, isDate, parseISO } from "date-fns";

export const DATE_FORMAT_SHORT_MONTH = "dd MMM yyyy";
export const DATE_FORMAT_SORTABLE_DATE = "yyyy-MM-dd";

export const formatDate = (
  value,
  formattedDateStr = DATE_FORMAT_SHORT_MONTH,
) => {
  try {
    const date = isDate(value) ? value : parseISO(value);

    return format(date, formattedDateStr);
  } catch (error) {
    // Return original value if formatting fails
    return value;
  }
};
