export const buildNavigation = (request) => [
  {
    text: "Cases",
    url: "/cases",
    isActive: request?.path === "/cases" || request?.path === "/",
  },
];
