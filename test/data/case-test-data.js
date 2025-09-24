export const testCaseId = "68495db5afe2d27b09b2ee47";

export const createMockCaseData = (overrides = {}) => ({
  _id: testCaseId,
  caseRef: "banana-123",
  banner: {},
  links: createMockLinks(testCaseId),
  comments: [
    {
      createdAt: "2025-01-01T10:00:00.000Z",
      createdBy: "John Smith",
      title: "NOTE_ADDED",
      text: "This is a test note",
    },
  ],
  ...overrides,
});

export const createMockLinks = (caseId) => {
  return [
    { id: "tasks", text: "Tasks", href: `/cases/${caseId}` },
    {
      id: "case-details",
      text: "Case Details",
      href: `/cases/${caseId}/case-details`,
    },
    {
      id: "notes",
      text: "Notes",
      href: `/cases/${caseId}/notes`,
    },
    {
      id: "timeline",
      text: "Timeline",
      href: `/cases/${caseId}/timeline`,
    },
  ];
};
