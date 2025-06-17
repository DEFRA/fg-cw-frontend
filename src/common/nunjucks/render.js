import camelCase from "lodash/camelCase.js";
import { environment } from "./nunjucks.js";

/**
 * @param {string} name
 * @param {object} params
 * @param {string} [block]
 */
export const render = (name, params, block) => {
  const macro = {
    path: `${name}/macro.njk`,
    name: camelCase(name.split("-")),
    params: JSON.stringify(params, null, 2),
  };

  const callComponent = block
    ? `{%- call ${macro.name}(${macro.params}) -%}${block}{%- endcall -%}`
    : `{{- ${macro.name}(${macro.params}) -}}`;

  return environment.renderString(
    `{%- from "${macro.path}" import ${macro.name} -%}
    ${callComponent}
    `,
    {},
  );
};
