import Boom from "@hapi/boom";
import {
  findCaseGroup,
  findCasePage,
  findCasePages,
  saveCaseGroup,
} from "../repositories/case-page.repository.js";

export const findCasePagesUseCase = (auth) => findCasePages(auth);
export const findCasePageUseCase = (auth, identity) =>
  findCasePage(auth, identity);
export const findCaseGroupUseCase = (auth, identity) =>
  findCaseGroup(auth, identity);
export const saveCaseGroupUseCase = (auth, identity, form) => {
  const labels = Object.fromEntries(
    Object.entries(form)
      .filter(([key]) => key.startsWith("label-"))
      .map(([key, value]) => {
        try {
          return [key.slice(6), value ? JSON.parse(value) : null];
        } catch {
          throw Boom.badRequest("Choose a valid case label");
        }
      }),
  );
  return saveCaseGroup(auth, identity, {
    assignee: form.assignee || null,
    labels,
  });
};
