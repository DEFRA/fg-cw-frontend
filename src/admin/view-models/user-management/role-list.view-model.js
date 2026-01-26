export const createRoleListViewModel = (roles) => {
  const sortedRoles = Array.isArray(roles) ? roles.slice().sort(byCode) : [];

  return {
    pageTitle: "Roles",
    pageHeading: "Roles",
    data: {
      roles: {
        head: [
          { text: "Code" },
          { text: "Description" },
          { text: "Assignable" },
        ],
        rows: sortedRoles.map((role) => ({
          code: {
            text: role.code,
            href: `/admin/user-management/roles/${role.code}`,
          },
          description: role.description,
          assignable: role.assignable ? "Yes" : "No",
        })),
      },
      createRoleHref: "/admin/user-management/roles/create",
    },
  };
};

const byCode = (a, b) =>
  a.code.localeCompare(b.code, "en", { sensitivity: "base" });
