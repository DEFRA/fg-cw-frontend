import { getFormattedGBDate } from "../../common/helpers/date-helpers.js";

const findCaseDetailsTab = (overrideTabs) => {
  return (overrideTabs || []).find((tab) => tab.id === "caseDetails");
};

const navigateObject = (obj, keys) => {
  return keys.reduce((value, key) => {
    if (!value || typeof value !== "object" || !(key in value)) {
      return undefined;
    }
    return value[key];
  }, obj);
};

const resolvePayloadReference = (ref, payload) => {
  const path = ref.replace("$.payload.", "");
  const keys = path.split(".");
  return navigateObject(payload, keys);
};

const processSectionFields = (section, payload) => {
  if (section.fields) {
    const processedFields = section.fields.map((field) => {
      const resolvedValue = resolvePayloadReference(field.ref, payload);
      return {
        ...field,
        value: resolvedValue,
      };
    });

    return {
      ...section,
      fields: processedFields,
    };
  }

  return section;
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
    defaultTitle: "Case",
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
