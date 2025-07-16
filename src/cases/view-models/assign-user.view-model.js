export const createAssignUserViewModel = (kase, users) => {
  const caseId = kase._id;
  const usersSelect = [
    {
      value: "",
      text: "Select a user",
      selected: kase.assignedUser == null,
    },
    ...users.map((user) => ({
      value: user.id,
      text: user.name,
      selected: user.id === kase.assignedUser?.id,
    })),
  ];

  return {
    pageTitle: `Assign`,
    pageHeading: `Assign`,
    breadcrumbs: [],
    data: {
      caseId,
      usersSelect,
    },
  };
};
