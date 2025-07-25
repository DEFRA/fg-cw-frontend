import jsonpath from "jsonpath";
import { getFormattedGBDate } from "../../common/helpers/date-helpers.js";

const findCaseDetailsTab = (overrideTabs) => {
  return (overrideTabs || []).find((tab) => tab.id === "caseDetails");
};

const resolvePayloadReference = (ref, payload) => {
  if (!ref || !payload) return undefined;

  try {
    return jsonpath.value(payload, ref.replace("$.payload.", "$."));
  } catch (error) {
    return undefined;
  }
};

const processSectionFields = (section, payload) => {
  if (section.fields) {
    const processedFields = section.fields.map((field) => {
      const resolvedValue = resolvePayloadReference(field.ref, payload);

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
    const processedSections = caseDetails.sections.map((section) =>
      processSectionFields(section, caseItem.payload),
    );

    data.caseDetails = {
      ...caseDetails,
      sections: processedSections,
    };
  }

  return data;
};

const buildCaseData = (caseItem, caseRef, code) => {
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
    title: getCaseTitle(caseItem),
  };

  return addCaseDetailsIfPresent(data, caseItem);
};

export const createCaseDetailViewModel = (caseItem) => {
  const caseRef = caseItem.caseRef;
  const code = caseItem.workflowCode;

  return {
    pageTitle: `Case ${caseRef}`,
    pageHeading: `Case ${caseRef}`,
    breadcrumbs: [],
    data: {
      case: buildCaseData(caseItem, caseRef, code),
    },
  };
};
