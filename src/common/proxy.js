import { bootstrap } from "global-agent";
import { ProxyAgent, setGlobalDispatcher } from "undici";
import { config } from "./config.js";

const proxyUrl = config.get("httpProxy");

// global-agent covers http/https clients such as wreck.
bootstrap();
global.GLOBAL_AGENT.HTTP_PROXY = proxyUrl;

// Native fetch, which openid-client uses for OIDC discovery and token
// exchange, ignores global-agent and needs its own dispatcher.
if (proxyUrl) {
  setGlobalDispatcher(new ProxyAgent(proxyUrl));
}
