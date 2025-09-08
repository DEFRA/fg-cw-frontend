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
          ref: { text: agreement.ref },
          date: { text: formatDate(agreement.date, DATE_FORMAT_SHORT_MONTH) },
          internalUrl: {
            href: `${agreementData.internalUrl}${agreement.ref}`,
            text: "Internal",
          },
          externalUrl: {
            href: `${agreementData.externalUrl}${agreement.ref}`,
            text: "Copy external",
          },
          status: {
            text: agreement.status,
            classes:
              agreement.status === "Agreed"
                ? "govuk-tag--blue"
                : "govuk-tag--grey",
          },
        })),
      },
    },
  };
};
