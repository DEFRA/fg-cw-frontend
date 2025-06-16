import { readFileSync } from "node:fs";
import path from "node:path";

import { config } from "../../../common/config.js";
import { logger } from "../../../common/logger.js";
import { buildNavigation } from "./build-navigation.js";

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

    getAssetPath(asset) {
      const webpackAssetPath = webpackManifest?.[asset];
      return `${assetPath}/${webpackAssetPath ?? asset}`;
    },
  };
};
