import { isValid, parse, parseISO } from "date-fns";

export const getFormattedGBDate = (date) => {
  return new Date(date).toLocaleDateString("en-GB");
};

export const parseDate = (raw) => {
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
