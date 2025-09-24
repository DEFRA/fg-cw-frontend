export const setActiveLink = (links = [], activeId = "") => {
  return links.map((link) => ({
    id: link.id,
    text: link.text,
    href: link.href,
    active: link.id === activeId,
  }));
};
