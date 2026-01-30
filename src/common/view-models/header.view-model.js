export const createHeaderViewModel = ({ page, request }) => ({
  navItems: page.header.navItems.map((item) => ({
    ...item,
    disabled: request.path.startsWith(item.href),
  })),
});
