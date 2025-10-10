import vm from "node:vm";

import { findCaseByIdUseCase } from "../../cases/use-cases/find-case-by-id.use-case.js";
import {
  createComponentsPageViewModel,
  createComponentsUploadViewModel,
} from "../view-models/components.view-model.js";

const componentsPath = "/cases/{caseId}/components";
const componentsEditPath = "/cases/{caseId}/components/edit";
const sessionKey = "componentsPreview";

export const viewComponentsRoute = {
  method: "GET",
  path: componentsPath,
  handler: async (request, h) => {
    const { caseId } = request.params;
    const caseItem = await findCaseByIdUseCase(caseId);
    const content = getStoredContent(request, caseId);

    const viewModel = createComponentsPageViewModel(caseItem, content);

    return h.view("temp/components", viewModel);
  },
};

export const viewComponentsUploadRoute = {
  method: "GET",
  path: componentsEditPath,
  handler: async (request, h) => {
    const { caseId } = request.params;
    const caseItem = await findCaseByIdUseCase(caseId);
    const content = getStoredContent(request, caseId);
    const viewModel = createComponentsUploadViewModel(caseItem, { content });
    return h.view("temp/components-edit", viewModel);
  },
};

export const submitComponentsUploadRoute = {
  method: "POST",
  path: componentsEditPath,
  handler: async (request, h) => {
    const { caseId } = request.params;
    const caseItem = await findCaseByIdUseCase(caseId);
    const jsonPayload = request.payload?.jsonPayload;
    const formData = { jsonPayload };
    const { content, errors } = parseJsonPayload(jsonPayload);

    if (errors) {
      const viewModel = createComponentsUploadViewModel(caseItem, {
        formData,
        errors,
      });

      return h.view("temp/components-edit", viewModel);
    }

    setStoredContent(request, caseId, content);

    return h.redirect(`/cases/${caseId}/components`);
  },
};

export const apiComponentsUploadRoute = {
  method: "POST",
  path: "/cases/{caseId}/components/api",
  options: {
    auth: false,
  },
  handler: async (request, h) => {
    const { caseId } = request.params;
    const payload = request.payload;

    const jsonPayload =
      typeof payload === "string" ? payload : JSON.stringify(payload);

    const { content, errors } = parseJsonPayload(jsonPayload);

    if (errors) {
      return h
        .response({
          errors,
        })
        .code(400);
    }

    setStoredContent(request, caseId, content);

    return h
      .response({
        message: "Components stored successfully",
        componentsPath: `/cases/${caseId}/components`,
      })
      .code(202);
  },
};

const parseJsonPayload = (jsonPayload) => {
  if (typeof jsonPayload !== "string" || jsonPayload.trim() === "") {
    return {
      errors: {
        jsonPayload: "Enter a JSON payload",
      },
    };
  }

  try {
    const parsed = JSON.parse(jsonPayload);
    if (!Array.isArray(parsed)) {
      return {
        errors: {
          jsonPayload: "JSON payload must be an array of components",
        },
      };
    }
    return { content: parsed };
  } catch {
    return parseLooseJson(jsonPayload);
  }
};

const parseLooseJson = (jsonPayload) => {
  try {
    const script = new vm.Script(`(${jsonPayload})`, { timeout: 500 });
    const parsed = script.runInNewContext({});

    if (!Array.isArray(parsed)) {
      return {
        errors: {
          jsonPayload: "JSON payload must be an array of components",
        },
      };
    }

    return { content: parsed };
  } catch {
    return {
      errors: {
        jsonPayload: "Enter a valid JSON payload",
      },
    };
  }
};

const getStoredContent = (request, caseId) => {
  const previews = request.yar.get(sessionKey);
  return previews?.[caseId] ?? null;
};

const setStoredContent = (request, caseId, content) => {
  const previews = request.yar.get(sessionKey) ?? {};
  request.yar.set(sessionKey, {
    ...previews,
    [caseId]: content,
  });
};
