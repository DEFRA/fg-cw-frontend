import { readFileSync } from "node:fs";
import path from "node:path";

import { createLogger } from "../../../server/common/helpers/logging/logger.js";
import { config } from "../../config.js";
import { buildNavigation } from "./build-navigation.js";

const logger = createLogger();
const assetPath = config.get("assetPath");
const manifestPath = path.join(
  config.get("root"),
  ".public/assets-manifest.json",
);

/** @type {Record<string, string> | undefined} */
let webpackManifest;

/**
 * @param {Request | null} request
 */
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
