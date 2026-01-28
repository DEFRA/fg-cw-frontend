import { createHeaderViewModel } from "../../common/view-models/header.view-model.js";

export const createAssignUserViewModel = ({ page, request, users }) => {
  const kase = page.data;
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
    pageTitle: "Assign",
    pageHeading: "Assign",
    header: createHeaderViewModel({ page, request }),
    breadcrumbs: [],
    data: {
      caseId,
      usersSelect,
    },
  };
};
