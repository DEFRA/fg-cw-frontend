import {
  DATE_FORMAT_SHORT_MONTH,
  formatDate,
} from "../../../common/nunjucks/filters/format-date.js";

export const createViewAgreementsViewModel = (agreementData) => {
  return {
    pageTitle: `Agreement ${agreementData.caseRef}`,
    pageHeading: `Case grant funding agreement`,
    breadcrumbs: [],
    data: {
      agreementName: agreementData.agreementName,
      banner: agreementData.banner,
      links: agreementData.links.map(({ id, href, text }) => ({
        href,
        text,
        active: id === "agreements",
      })),
      agreements: {
        head: [
          {
            text: "Reference",
            classes: "govuk-!-width-one-quarter",
          },
          {
            text: "Date",
            classes: "govuk-!-width-one-quarter",
          },
          {
            text: "View",
            classes: "govuk-!-width-one-quarter",
          },
          {
            text: "Status",
            classes: "govuk-!-width-one-quarter",
          },
        ],
        rows: agreementData.agreements.map((agreement) => ({
          ref: { text: agreement.agreementRef },
          date: {
            text: formatDate(agreement.createdAt, DATE_FORMAT_SHORT_MONTH),
          },
          internalUrl: {
            href: `${agreementData.internalUrl}${agreement.agreementRef}`,
            text: "Internal",
          },
          externalUrl: {
            href: `${agreementData.externalUrl}${agreement.agreementRef}`,
            text: "Copy external",
          },
          status: {
            text: agreement.agreementStatus,
            classes:
              agreement.agreementStatus === "Agreed"
                ? "govuk-tag--blue"
                : "govuk-tag--grey",
          },
        })),
      },
    },
  };
};
