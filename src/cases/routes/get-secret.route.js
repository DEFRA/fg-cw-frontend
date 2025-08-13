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

    const responseFromApi = await findSecretUseCase(credentials.token);

    return h.view("pages/secret", {
      data: {
        credentials,
        responseFromApi,
      },
    });
  },
};
