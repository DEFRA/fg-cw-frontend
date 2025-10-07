import { findAll } from "../repositories/case.repository.js";

export const findAllCasesUseCase = async (authContext) => {
  const cases = await findAll(authContext);
  return cases;
};
