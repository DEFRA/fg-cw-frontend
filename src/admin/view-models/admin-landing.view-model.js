export const createAdminLandingViewModel = () => {
  return {
    pageTitle: "Users and roles",
    pageHeading: "Users and roles",
    sections: [
      {
        title: "Users",
        description: "Check and update what users can do.",
        linkText: "Manage users",
        linkHref: "/admin/user-management",
      },
      {
        title: "Roles",
        description: "Check and edit roles, or create new ones.",
        linkText: "Manage roles",
        linkHref: "/admin/user-management/roles-list",
      },
    ],
  };
};
