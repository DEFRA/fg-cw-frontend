export const getHealthRoute = {
  method: "GET",
  path: "/health",
  options: { auth: false },
  handler() {
    return {
      message: "success",
    };
  },
};
