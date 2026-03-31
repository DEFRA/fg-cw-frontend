const pendingStageOutcomeConfirmationKey = "pendingStageOutcomeConfirmation";

const createEntryKey = (caseId, actionCode) => `${caseId}:${actionCode}`;

const getStore = (request) =>
  request.yar?.get?.(pendingStageOutcomeConfirmationKey) ?? {};

export const getPendingStageOutcomeConfirmation = (
  request,
  { caseId, actionCode },
) => getStore(request)[createEntryKey(caseId, actionCode)];

export const setPendingStageOutcomeConfirmation = (
  request,
  { caseId, actionCode, comment },
) => {
  const store = getStore(request);

  request.yar?.set?.(pendingStageOutcomeConfirmationKey, {
    ...store,
    [createEntryKey(caseId, actionCode)]: {
      caseId,
      actionCode,
      comment,
    },
  });
};

export const clearPendingStageOutcomeConfirmation = (
  request,
  { caseId, actionCode },
) => {
  const store = getStore(request);
  const entryKey = createEntryKey(caseId, actionCode);

  if (!(entryKey in store)) {
    return;
  }

  const nextStore = { ...store };

  delete nextStore[entryKey];

  request.yar?.set?.(pendingStageOutcomeConfirmationKey, nextStore);
};
