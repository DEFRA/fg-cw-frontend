export const createViewTabViewModel = (agreementData, tabId) => {
  return {
    pageTitle: `Agreement ${agreementData.caseRef}`,
    breadcrumbs: [],
    data: {
      ...agreementData,
      links: agreementData.links.map((link) => ({
        text: link.text,
        href: link.href,
        active: link.id === tabId,
      })),
    },
  };
};
