import { capitalise } from "../../../common/helpers/text-helpers.js";
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
            classes: "govuk-!-width-one-half",
          },
          {
            text: "Status",
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
          status: formatAgreementStatus(agreement.agreementStatus),
        })),
      },
    },
  };
};

export const formatAgreementStatus = (status) => {
  if (!status) {
    return {
      text: "",
    };
  }

  const text = capitalise(status);
  return {
    text,
    classes: text === "Agreed" ? "govuk-tag--blue" : "govuk-tag--grey",
  };
};
