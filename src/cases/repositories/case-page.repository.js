import { wreck } from "../../common/wreck.js";

const pagePath = ({ caseType, pageKey }) =>
  `/case-types/${encodeURIComponent(caseType)}/pages/${encodeURIComponent(pageKey)}`;
const headers = (auth) => ({ authorization: `Bearer ${auth.token}` });
export const findCasePages = async (auth) =>
  (await wreck.get("/case-list-pages", { headers: headers(auth) })).payload;
export const findCasePage = async (auth, identity) =>
  (await wreck.get(pagePath(identity), { headers: headers(auth) })).payload;
export const findCaseGroup = async (auth, identity) =>
  (
    await wreck.get(
      `${pagePath(identity)}/groups/${encodeURIComponent(identity.keyHash)}`,
      { headers: headers(auth) },
    )
  ).payload;
export const saveCaseGroup = async (auth, identity, payload) =>
  (
    await wreck.put(
      `${pagePath(identity)}/groups/${encodeURIComponent(identity.keyHash)}`,
      { headers: headers(auth), payload },
    )
  ).payload;
