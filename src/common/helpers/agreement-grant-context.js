export const agreementGrantContextsKey = "agreementGrantContexts";

const getAgreementReference = function (path) {
  return String(path).replace(/^\//, "").split("/")[0];
};

const getStoredContexts = function (request) {
  if (!request || !request.yar) {
    return [];
  }
  return request.yar.get(agreementGrantContextsKey) || [];
};

export const rememberAgreementGrantContexts = function (request, contexts) {
  if (!request) {
    return;
  }
  if (!request.yar) {
    return;
  }
  if (contexts.length === 0) {
    return;
  }

  const agreementReferences = new Set(
    contexts.map(({ agreementRef }) => agreementRef),
  );
  const existingContexts = getStoredContexts(request);
  const otherContexts = existingContexts.filter(
    ({ agreementRef }) => !agreementReferences.has(agreementRef),
  );

  request.yar.set(agreementGrantContextsKey, [...otherContexts, ...contexts]);
};

export const findAgreementGrantCode = function (request, path) {
  const agreementRef = getAgreementReference(path);
  const contexts = getStoredContexts(request);
  const context = contexts.find((item) => item.agreementRef === agreementRef);
  return context ? context.grantCode : undefined;
};
