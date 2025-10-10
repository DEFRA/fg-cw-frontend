import { setActiveLink } from "../../common/helpers/navigation-helpers.js";

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

const buildBaseViewModel = (caseItem) => ({
  pageTitle: `Components ${caseItem.caseRef}`,
  pageHeading: "Components",
  breadcrumbs: [],
  data: {
    banner: caseItem.banner,
    caseRef: caseItem.caseRef,
    caseId: caseItem._id,
    links: getNavigationLinks(caseItem),
  },
});

export const createComponentsUploadViewModel = (
  caseItem,
  { formData, errors, content } = {},
) => {
  const base = buildBaseViewModel(caseItem);
  const jsonPayload =
    formData?.jsonPayload ??
    (Array.isArray(content) ? JSON.stringify(content, null, 2) : "");

  return {
    ...base,
    errors,
    errorList: buildErrorList(errors),
    data: {
      ...base.data,
      formData: {
        jsonPayload,
      },
      content,
    },
  };
};

export const createComponentsPageViewModel = (caseItem, content) => {
  const base = buildBaseViewModel(caseItem);
  return {
    ...base,
    data: {
      ...base.data,
      content: content ?? null,
    },
  };
};

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
