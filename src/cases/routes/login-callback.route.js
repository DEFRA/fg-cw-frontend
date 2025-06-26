import Boom from "@hapi/boom";
import { jwtDecode } from "jwt-decode";

const getIdToken = (artifacts) => {
  const { id_token: idToken } = artifacts;

  if (!idToken) {
    throw Boom.badRequest("User has no ID token. Cannot verify roles.");
  }

  try {
    return jwtDecode(artifacts.id_token);
  } catch (error) {
    throw Boom.badRequest(
      `User's ID token cannot be decoded: ${error.message}`,
    );
  }
};

const validRoles = [
  "FCP.Casework.Read",
  "FCP.Casework.ReadWrite",
  "FCP.Casework.Admin",
];

const getAssignedRoles = (tokenRoles) => {
  const validRoleSet = new Set(validRoles);
  const tokenRoleSet = new Set(tokenRoles);
  const intersection = validRoleSet.intersection(tokenRoleSet);
  return Array.from(intersection);
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
  // eslint-disable-next-line complexity
  async handler(request, h) {
    const { auth } = request;

    if (!auth.isAuthenticated) {
      throw Boom.forbidden(`Authentication failed: ${auth.error.message}`);
    }

    const idToken = getIdToken(auth.artifacts);

    if (!idToken.roles) {
      throw Boom.badRequest(
        `User with IDP id '${idToken.oid}' has no 'roles' claim in ID token`,
      );
    }

    const roles = getAssignedRoles(idToken.roles);

    if (roles.length === 0) {
      throw Boom.unauthorized(
        `User with IDP id '${idToken.oid}' has not been assigned a valid role. Expected one of [${validRoles.join(", ")}], got [${idToken.roles.join(", ")}]`,
      );
    }

    request.cookieAuth.set({
      token: auth.credentials.token,
      authenticated: auth.isAuthenticated,
      authorised: true,
    });

    return h.redirect(auth.credentials.query.next ?? "/");
  },
};
