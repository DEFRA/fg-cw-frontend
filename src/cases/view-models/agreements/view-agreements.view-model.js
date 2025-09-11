export const createViewAgreementsViewModel = (agreementData) => {
  return {
    pageTitle: `Agreement ${agreementData.caseRef}`,
    pageHeading: `Case grant funding agreement`,
    breadcrumbs: [],
    data: {
      banner: {},
      links: [],
      ...agreementData,
    },
  };
};
