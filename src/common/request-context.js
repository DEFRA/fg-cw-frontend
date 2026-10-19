import { AsyncLocalStorage } from "node:async_hooks";

const asyncLocalStorage = new AsyncLocalStorage();

export const getRequestContext = () => asyncLocalStorage.getStore() ?? null;

export const getClientIp = () => getRequestContext()?.clientIp;

// The originating client is the first `x-forwarded-for` entry, set by the
// platform ingress; `remoteAddress` is only that ingress.
const readClientIp = (request) =>
  request.headers?.["x-forwarded-for"]?.split(",")[0].trim() ||
  request.info.remoteAddress;

const wrapCycle = (request, cycle, store) => {
  const requestCycle = request[cycle].bind(request);
  request[cycle] = () => asyncLocalStorage.run(store, requestCycle);
};

export const requestContext = {
  plugin: {
    name: "request-context",
    once: true,
    register(server) {
      server.ext("onRequest", (request, h) => {
        const store = { clientIp: readClientIp(request) };
        wrapCycle(request, "_lifecycle", store);
        wrapCycle(request, "_postCycle", store);
        return h.continue;
      });
    },
  },
};
