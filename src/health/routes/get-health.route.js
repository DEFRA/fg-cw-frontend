export const getHealthRoute = {
  method: "GET",
  path: "/health",
  handler() {
    return {
      message: "success",
    };
  },
};
