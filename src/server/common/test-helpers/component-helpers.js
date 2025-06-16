// The following rules to be enabled when "server" dir is pulled apart
// eslint-disable-next-line
import { load } from "cheerio";
// eslint-disable-next-line
import camelCase from "lodash/camelCase";
import { fileURLToPath } from "node:url";
import nunjucks from "nunjucks";
import path from "path";
import * as filters from "../../../config/nunjucks/filters/filters.js";
import * as globals from "../../../config/nunjucks/globals.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const nunjucksTestEnv = nunjucks.configure(
  [
    path.normalize(
      path.resolve(dirname, "../../../../node_modules/govuk-frontend/dist/"),
    ),
    path.normalize(path.resolve(dirname, "../templates")),
    path.normalize(path.resolve(dirname, "../components")),
  ],
  {
    trimBlocks: true,
    lstripBlocks: true,
  },
);

Object.entries(globals).forEach(([name, global]) => {
  nunjucksTestEnv.addGlobal(name, global);
});

Object.entries(filters).forEach(([name, filter]) => {
  nunjucksTestEnv.addFilter(name, filter);
});

/**
 * @param {string} componentName
 * @param {object} params
 * @param {string} [callBlock]
 */
export const renderComponent = (componentName, params, callBlock) => {
  const macroPath = `${componentName}/macro.njk`;
  const macroName = `app${
    componentName.charAt(0).toUpperCase() + camelCase(componentName.slice(1))
  }`;
  const macroParams = JSON.stringify(params, null, 2);
  let macroString = `{%- from "${macroPath}" import ${macroName} -%}`;

  if (callBlock) {
    macroString += `{%- call ${macroName}(${macroParams}) -%}${callBlock}{%- endcall -%}`;
  } else {
    macroString += `{{- ${macroName}(${macroParams}) -}}`;
  }

  return load(nunjucksTestEnv.renderString(macroString, {}));
};
