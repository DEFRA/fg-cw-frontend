import Vision from "@hapi/vision";
import Nunjucks from "nunjucks";

import { glob } from "node:fs/promises";
import { config } from "../config.js";
import { filters } from "../format/format-filters.js";
import { context } from "./context/context.js";
import { formatDate } from "./filters/format-date.js";

const njkPaths = [
  "node_modules/govuk-frontend/dist/",
  ...(await Array.fromAsync(
    glob(["**/views", "**/*(layouts|components|pages|partials)/"], {
      exclude: ["node_modules", "*.*"],
    }),
  )),
];

const viewPaths = await Array.fromAsync(
  glob(["**/views"], {
    exclude: ["node_modules", "*.*"],
  }),
);

export const environment = Nunjucks.configure(njkPaths, {
  autoescape: true,
  throwOnUndefined: false,
  trimBlocks: true,
  lstripBlocks: true,
  watch: config.get("nunjucks.watch"),
  noCache: config.get("nunjucks.noCache"),
  filter: {
    formatDate,
  },
});

environment.addFilter("formatDate", formatDate);
environment.addFilter("fixed", filters.fixed);

export const nunjucks = {
  plugin: Vision,
  options: {
    engines: {
      njk: {
        compile(src, options) {
          const template = Nunjucks.compile(src, options.environment);
          return (ctx) => template.render(ctx);
        },
      },
    },
    compileOptions: {
      environment,
    },
    relativeTo: config.get("root"),
    path: viewPaths,
    isCached: config.get("isProduction"),
    context,
  },
};
