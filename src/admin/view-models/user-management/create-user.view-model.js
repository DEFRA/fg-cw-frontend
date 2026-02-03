export const createCreateUserViewModel = (errors, formData) => {
  return {
    pageTitle: "Create user",
    pageHeading: "Create user",
    breadcrumbs: [
      { text: "User management", href: "/admin/user-management" },
      { text: "Users", href: "/admin/user-management" },
      { text: "Create user" },
    ],
    data: {
      formData: formData || {},
      cancelHref: "/admin/user-management",
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
