export const getSecretRoute = {
  method: "GET",
  path: "/secret",
  options: {
    auth: {
      mode: "required",
      strategy: "session",
      access: {
        scope: ["FCP.Casework.Read"],
      },
    },
  },
  handler(request, h) {
    return h.view("pages/secret", {
      auth: request.auth,
    });
  },
};
