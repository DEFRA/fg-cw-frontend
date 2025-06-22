import { jwtDecode } from "jwt-decode";

const getNextDestination = (credentials) => {
  return credentials.query?.next;
};

export const getIdToken = (artifacts) => {
  return artifacts?.id_token;
};

export const notAuthorised = () => {
  // TODO: handle not authorised
  return "Not authorised";
};

export const loginCallbackRoute = {
  method: "GET",
  path: "/login/callback",
  options: {
    auth: {
      mode: "try",
      strategy: "msEntraId",
    },
  },
  handler: async function (request, h) {
    if (request.auth.isAuthenticated === false) return notAuthorised();

    const roles = jwtDecode(getIdToken(request.auth.artifacts)).roles;

    if (!roles) return notAuthorised();

    const next = getNextDestination(request.auth.credentials);

    request.cookieAuth.set({
      profile: request.auth.credentials.profile,
      token: request.auth.credentials.token,
      authenticated: request.auth.isAuthenticated,
      authorised: roles.includes("FCP.Casework.Read"),
    });

    if (next) {
      return h.redirect(next);
    }

    return h.redirect("/");
  },
};
