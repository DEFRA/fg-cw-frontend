export const getHealthRoute = {
  method: "GET",
  path: "/health",
  options: {
    auth: false,
    plugins: {
      yar: {
        skip: true,
      },
    },
  },
  handler() {
    return {
      message: "success",
    };
  },
};
