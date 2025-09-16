export const setActiveLink = (links = [], activeId = "") => {
  return links.map((link) => ({
    text: link.text,
    href: link.href,
    active: link.id === activeId,
  }));
};
