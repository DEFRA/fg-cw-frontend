import jsonpath from "jsonpath";
import { format } from "../../common/format/format.js";
import { getFormattedGBDate } from "../../common/helpers/date-helpers.js";
import { resolveBannerPaths } from "../../common/helpers/resolvePaths.js";

const findCaseDetailsTab = (overrideTabs) => {
  return (overrideTabs || []).find((tab) => tab.id === "caseDetails");
};

const mapListSection = (section, payload) => {
  if (section.fields) {
    const processedFields = section.fields.map((field) => {
      const resolvedValue = jsonpath.value(payload, field.ref);

      // Convert boolean values to Yes/No
      let displayValue = resolvedValue;
      if (field.type === "boolean") {
        displayValue = resolvedValue ? "Yes" : "No";
      }

      return {
        key: {
          text: field.label,
        },
        value: {
          text: displayValue,
        },
      };
    });

    return {
      ...section,
      fields: processedFields,
    };
  }

  return section;
};

const getCaseTitle = (caseItem) => {
  const caseDetails = findCaseDetailsTab(caseItem.overrideTabs);
  return caseDetails ? caseDetails.title : "Case";
};

const addCaseDetailsIfPresent = (data, caseItem) => {
  const caseDetails = findCaseDetailsTab(caseItem.overrideTabs);
  if (caseDetails) {
    // Process sections to resolve payload references
    const processedSections = caseDetails.sections.map((section) => {
      switch (section.component) {
        case "list":
          return mapListSection(section, caseItem);
        case "table":
          return mapTableSection(section, caseItem);
        default:
          return section;
      }
    });

    data.caseDetails = {
      ...caseDetails,
      sections: processedSections,
    };
  }

  return data;
};

const buildCaseData = (caseItem, caseRef, code, banner) => {
  const data = {
    _id: caseItem._id,
    clientRef: caseRef,
    businessName: caseItem.payload.answers?.agreementName,
    code,
    sbi: caseItem.payload.identifiers?.sbi,
    scheme: caseItem.payload.answers?.scheme,
    dateReceived: caseItem.dateReceived,
    submittedAt: getFormattedGBDate(caseItem.payload.submittedAt),
    status: caseItem.status,
    assignedUser: caseItem.assignedUser,
    payload: caseItem.payload,
    banner: resolveBannerPaths(banner, caseItem),
    title: getCaseTitle(caseItem),
  };

  return addCaseDetailsIfPresent(data, caseItem);
};

export const createCaseDetailViewModel = (caseItem) => {
  const caseRef = caseItem.caseRef;
  const code = caseItem.workflowCode;
  const banner = caseItem.banner;

  return {
    pageTitle: `Case ${caseRef}`,
    pageHeading: `Case ${caseRef}`,
    breadcrumbs: [],
    data: {
      case: buildCaseData(caseItem, caseRef, code, banner),
    },
  };
};

const createTable = (title, head = [], rows = []) => ({
  component: "table",
  title: title || "",
  head,
  rows,
});

const createTableRow = (input, fields, rowIndex) => {
  return fields.map((field) => {
    const matches = jsonpath.query(input, field.ref);
    const value = matches[rowIndex];
    return { text: format(value, field.format) };
  });
};

const hasValidFields = (section) => {
  return (
    section?.fields &&
    Array.isArray(section.fields) &&
    section.fields.length > 0
  );
};

export const mapTableSection = (section, kase) => {
  if (!hasValidFields(section)) {
    return createTable(section.title);
  }

  const fields = section.fields;
  const head = fields.map((f) => ({ text: f.label }));
  const rowCount = jsonpath.query(kase, fields[0].ref).length;

  const rows = Array.from({ length: rowCount }, (_, i) =>
    createTableRow(kase, fields, i),
  );

  return createTable(section.title, head, rows);
};
