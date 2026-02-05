import { createHeaderViewModel } from "../../../common/view-models/header.view-model.js";

const PAGE_TITLE = "Create user";
const USER_MANAGEMENT_HREF = "/admin/user-management";

export const createCreateUserViewModel = ({
  page,
  request,
  errors,
  formData,
}) => {
  return {
    pageTitle: PAGE_TITLE,
    pageHeading: PAGE_TITLE,
    header: createHeaderViewModel({ page, request }),
    breadcrumbs: [
      { text: "User management", href: USER_MANAGEMENT_HREF },
      { text: "Users", href: USER_MANAGEMENT_HREF },
      { text: PAGE_TITLE },
    ],
    data: {
      formData: formData || {},
      cancelHref: USER_MANAGEMENT_HREF,
    },
    errors: errors || {},
    errorList: buildErrorList(errors),
  };
};

const errorFields = [
  { key: "name", href: "#name" },
  { key: "email", href: "#email" },
  { key: "save", href: null },
];

const buildErrorList = (errors) => {
  if (!errors) {
    return [];
  }

  return errorFields
    .filter(({ key }) => errors[key])
    .map(({ key, href }) => ({
      text: errors[key],
      ...(href && { href }),
    }));
};
