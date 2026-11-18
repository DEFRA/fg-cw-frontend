import Boom from "@hapi/boom";
import { findAll } from "../repositories/case.repository.js";
import { toCaseListCriteria } from "./to-case-list-criteria.js";

export const findMyCasesUseCase = async (authContext, query = {}) => {
  const assignedUserId = authContext.user?.id;
  if (!assignedUserId) {
    throw Boom.unauthorized("No user id in session");
  }
  return findAll(authContext, {
    ...toCaseListCriteria(query, {
      cursor: query.myCursor,
      direction: query.myDirection,
    }),
    assignedUserId,
  });
};
