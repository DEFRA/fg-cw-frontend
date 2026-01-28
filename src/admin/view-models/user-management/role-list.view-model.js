export const createRoleListViewModel = (roles) => {
  const roleList = Array.isArray(roles) ? roles : [];

  return {
    pageTitle: "Roles",
    pageHeading: "Roles",
    breadcrumbs: [
      { text: "User management", href: "/admin" },
      { text: "Roles" },
    ],
    data: {
      roles: {
        head: [
          { text: "Code" },
          { text: "Description" },
          { text: "Assignable" },
        ],
        rows: roleList.map((role) => ({
          code: {
            text: role.code,
            href: `/admin/user-management/roles/${role.code}`,
          },
          description: role.description,
          assignable: role.assignable ? "Yes" : "No",
        })),
      },
      createRoleHref: "/admin/user-management/roles/new",
    },
  };
};
