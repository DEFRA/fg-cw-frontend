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
export const saveCaseGroupUseCase = (auth, identity, form) =>
  saveCaseGroup(auth, identity, { form });
