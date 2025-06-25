import { jwtDecode } from "jwt-decode";

const caseWorkingRoles = [
  "FCP.Casework.Read",
  "FCP.Casework.ReadWrite",
  "FCP.Casework.Admin",
];

const getNextDestination = (credentials) => {
  return credentials.query?.next;
};

export const getRoles = (artifacts) => {
  if (!artifacts || !artifacts.id_token) return;
  const token = jwtDecode(artifacts?.id_token);
  return token.roles;
};

export const notAuthorised = () => {
  // TODO: handle not authorised
  return "Not authorised";
};

export const validateRoles = (userRoles) => {
  if (!userRoles) return false;
  return userRoles.some((role) => caseWorkingRoles.includes(role));
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
    const roles = getRoles(request.auth.artifacts);
    const authorised = validateRoles(roles);
    if (!authorised) return notAuthorised();
    const next = getNextDestination(request.auth.credentials);

    request.cookieAuth.set({
      token: request.auth.credentials.token,
      authenticated: request.auth.isAuthenticated,
      authorised,
    });

    if (next) {
      return h.redirect(next);
    }

    return h.redirect("/");
  },
};
