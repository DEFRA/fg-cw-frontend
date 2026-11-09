import { bootstrap } from "global-agent";
import { EnvHttpProxyAgent, setGlobalDispatcher } from "undici";
import { config } from "./config.js";

const proxyUrl = config.get("httpProxy");

// global-agent covers http/https clients such as wreck.
bootstrap();
global.GLOBAL_AGENT.HTTP_PROXY = proxyUrl;

// Native fetch, which openid-client uses for OIDC discovery and token
// exchange, ignores global-agent and needs its own dispatcher. NO_PROXY is
// still honoured, so CDP and AWS endpoints the deployment excludes stay direct.
if (proxyUrl) {
  setGlobalDispatcher(
    new EnvHttpProxyAgent({ httpProxy: proxyUrl, httpsProxy: proxyUrl }),
  );
}
