import { bootstrap } from "global-agent/bootstrap.js";
import { config } from "./config.js";

bootstrap();
global.GLOBAL_AGENT.HTTP_PROXY = config.get("httpProxy");
