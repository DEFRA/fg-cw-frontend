import { findSecretUseCase } from "../use-cases/find-secret.use-case.js";

export const getSecretRoute = {
  method: "GET",
  path: "/secret",
  options: {
    auth: {
      mode: "required",
      strategy: "session",
    },
  },
  async handler(request, h) {
    const { credentials } = request.auth;

    const authContext = {
      token: credentials.token,
      user: credentials.user,
    };

    const responseFromApi = await findSecretUseCase(authContext);

    return h.view("pages/secret", {
      data: {
        credentials,
        responseFromApi,
      },
    });
  },
};
