import path from "node:path";
import { config } from "../../config.js";
import { logger } from "../../logger.js";
import { buildNavigation } from "./build-navigation.js";
import { readFileSync } from "./helpers/readFile.js";

const assetPath = config.get("assetPath");
const manifestPath = path.join(
  config.get("root"),
  ".public/assets-manifest.json",
);

let webpackManifest;

export const context = (request) => {
  if (!webpackManifest) {
    try {
      webpackManifest = JSON.parse(readFileSync(manifestPath, "utf-8"));
    } catch (error) {
      logger.error(`Webpack ${path.basename(manifestPath)} not found`);
    }
  }

  return {
    assetPath: `${assetPath}/assets`,
    serviceName: config.get("serviceName"),
    serviceUrl: "/",
    breadcrumbs: [],
    navigation: buildNavigation(request),
    notification: request.app?.notification,

    getAssetPath(asset) {
      const webpackAssetPath = webpackManifest?.[asset];
      return `${assetPath}/${webpackAssetPath ?? asset}`;
    },
  };
};
