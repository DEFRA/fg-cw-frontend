import { createHeaderViewModel } from "../../common/view-models/header.view-model.js";

export const createAdminLandingViewModel = ({ page, request }) => {
  return {
    pageTitle: "Users and roles",
    pageHeading: "Users and roles",
    header: createHeaderViewModel({ page, request }),
    sections: [
      {
        title: "Users",
        description: "Check and update what users can do.",
        linkText: "Manage users",
        linkHref: "/admin/user-management/users",
      },
      {
        title: "Roles",
        description: "Check and edit roles, or create new ones.",
        linkText: "Manage roles",
        linkHref: "/admin/user-management/roles",
      },
    ],
  };
};
