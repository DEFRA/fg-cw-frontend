import h2o2 from "@hapi/h2o2";

export const proxy = {
  plugin: {
    name: "proxy",
    async register(server) {
      await server.register(h2o2);
    },
  },
};
