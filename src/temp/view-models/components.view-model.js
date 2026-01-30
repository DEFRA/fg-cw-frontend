import { setActiveLink } from "../../common/helpers/navigation-helpers.js";
import { createHeaderViewModel } from "../../common/view-models/header.view-model.js";

export const createComponentsEditViewModel = ({
  page,
  request,
  formData,
  errors,
  content,
}) => {
  const caseItem = page.data;
  const base = buildBaseViewModel(caseItem, page, request);

  return {
    ...base,
    errors,
    errorList: buildErrorList(errors),
    data: {
      ...base.data,
      formData: {
        jsonPayload: createJsonPayload({ formData, content }),
      },
      content,
    },
  };
};

export const createComponentsViewModel = ({ page, request, content }) => {
  const caseItem = page.data;
  const base = buildBaseViewModel(caseItem, page, request);
  return {
    ...base,
    data: {
      ...base.data,
      content: content ?? null,
    },
  };
};

const getNavigationLinks = (caseItem) => {
  const existingLinks = caseItem.links ?? [];
  const componentsLink = {
    id: "components",
    text: "Components",
    href: `/cases/${caseItem._id}/components`,
  };

  const hasComponentsLink = existingLinks.some(
    (link) => link.id === componentsLink.id,
  );

  const links = hasComponentsLink
    ? existingLinks
    : [...existingLinks, componentsLink];

  return setActiveLink(links, componentsLink.id);
};

const buildBaseViewModel = (caseItem, page, request) => ({
  pageTitle: `Components ${caseItem.caseRef}`,
  pageHeading: "Components",
  header: createHeaderViewModel({ page, request }),
  breadcrumbs: [],
  data: {
    banner: caseItem.banner,
    caseRef: caseItem.caseRef,
    caseId: caseItem._id,
    links: getNavigationLinks(caseItem),
  },
});

const buildErrorList = (errors) => {
  if (!errors) {
    return [];
  }

  const errorList = [];

  if (errors.jsonPayload) {
    errorList.push({
      text: errors.jsonPayload,
      href: "#jsonPayload",
    });
  }

  return errorList;
};

const createJsonPayload = ({ formData, content }) => {
  if (formData?.jsonPayload) {
    return formData.jsonPayload;
  }

  if (Array.isArray(content)) {
    return JSON.stringify(content, null, 2);
  }

  return "";
};
