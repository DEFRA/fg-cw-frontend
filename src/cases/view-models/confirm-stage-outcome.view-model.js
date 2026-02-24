import { setActiveLink } from "../../common/helpers/navigation-helpers.js";
import { createHeaderViewModel } from "../../common/view-models/header.view-model.js";

const isObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

const isEmpty = (obj) => Object.keys(obj).length === 0;

const resolveOption = (option, defaultLabel) => {
  if (option === null || option === undefined) {
    return { label: defaultLabel, components: null };
  }
  if (typeof option === "string") {
    return { label: option, components: null };
  }
  return { label: null, components: option };
};

const createDefaultConfig = (defaultTitle) => ({
  title: defaultTitle,
  details: [],
  yes: { label: "Yes", components: null },
  no: { label: "No", components: null },
});

const isMinimalConfirm = (confirm) =>
  confirm === true || (isObject(confirm) && isEmpty(confirm));

const hasNoMeaningfulContent = (confirm) =>
  !confirm.details?.length && confirm.yes === null && confirm.no === null;

const shouldUseDefaults = (confirm) =>
  isMinimalConfirm(confirm) || hasNoMeaningfulContent(confirm);

const getDefaultTitle = (action) =>
  `Change status to '${action.targetStatusName || action.name}'?`;

const buildCustomConfig = (confirm, defaultTitle) => ({
  title: defaultTitle,
  details: confirm.details || [],
  yes: resolveOption(confirm.yes, "Yes"),
  no: resolveOption(confirm.no, "No"),
});

const buildConfirmConfig = (action) => {
  const defaultTitle = getDefaultTitle(action);

  if (shouldUseDefaults(action.confirm)) {
    return createDefaultConfig(defaultTitle);
  }

  return buildCustomConfig(action.confirm, defaultTitle);
};

const createErrorList = (errors) => (errors ? Object.values(errors) : []);

const findAction = (kase, actionCode) => {
  const action = kase.stage.actions.find((a) => a.code === actionCode);
  if (!action) {
    throw new Error(`Action "${actionCode}" not found`);
  }
  return action;
};

const extractComment = (formData, actionCode) => {
  const commentFieldName = `${actionCode}-comment`;
  return formData[commentFieldName] || formData.comment || "";
};

const createBreadcrumbs = (kase) => [
  { text: "Cases", href: "/cases" },
  { text: kase.caseRef, href: `/cases/${kase._id}` },
  { text: "Confirm" },
];

export const createConfirmStageOutcomeViewModel = ({
  page,
  request,
  actionCode,
  formData = {},
  errors = {},
}) => {
  const kase = page.data;
  const action = findAction(kase, actionCode);

  return {
    pageTitle: `Confirm action - ${action.name}`,
    pageHeading: "Confirm action",
    header: createHeaderViewModel({ page, request }),
    breadcrumbs: createBreadcrumbs(kase),
    links: setActiveLink(kase.links, "tasks"),
    data: {
      case: kase,
      caseId: kase._id,
      actionCode,
      actionName: action.name,
      comment: extractComment(formData, actionCode),
      confirmConfig: buildConfirmConfig(action),
    },
    errors,
    errorList: createErrorList(errors),
    values: {
      confirmation: formData.confirmation,
    },
  };
};
