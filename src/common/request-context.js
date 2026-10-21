import { AsyncLocalStorage } from "node:async_hooks";

const asyncLocalStorage = new AsyncLocalStorage();

// How many proxies in front of this service append to x-forwarded-for.
const TRUSTED_PROXY_COUNT = 1;

export const getRequestContext = () => asyncLocalStorage.getStore() ?? null;

export const getClientIp = () => getRequestContext()?.clientIp;

// Each trusted proxy appends the address it received the request from, so
// the client is `trustedProxyCount` hops back from the connection. Anything
// further left was sent by the client itself and cannot be trusted.
export const readClientIp = (request, trustedProxyCount) => {
  const forwardedFor = (request.headers?.["x-forwarded-for"] ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

  const chain = [...forwardedFor, request.info.remoteAddress];

  return chain[Math.max(0, chain.length - 1 - trustedProxyCount)];
};

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
        const store = {
          clientIp: readClientIp(request, TRUSTED_PROXY_COUNT),
        };
        wrapCycle(request, "_lifecycle", store);
        wrapCycle(request, "_postCycle", store);
        return h.continue;
      });
    },
  },
};
