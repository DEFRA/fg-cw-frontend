import { addNoteToCaseUseCase } from "../../use-cases/add-note-to-case.use-case.js";
import { findCaseByIdUseCase } from "../../use-cases/find-case-by-id.use-case.js";
import { createNewNoteViewModel } from "../../view-models/notes/new-note.view-model.js";

export const createNoteRoute = {
  method: "POST",
  path: "/cases/{caseId}/notes",
  handler: async (request, h) => {
    const { caseId } = request.params;
    const { text } = request.payload;
    const authContext = {
      token: request.auth.credentials.token,
      user: request.auth.credentials.user,
    };

    const validationErrors = validateNote(text);
    if (validationErrors) {
      return renderFormWithError(
        h,
        authContext,
        caseId,
        validationErrors,
        request.payload,
      );
    }

    try {
      await addNoteToCaseUseCase(authContext, { caseId, text });
      return h.redirect(`/cases/${caseId}/notes`);
    } catch (error) {
      request.log("error", {
        message: "Failed to save note",
        caseId,
        error: error.message,
        stack: error.stack,
      });

      const serverErrors = {
        save: "There was a problem saving the note. Please try again.",
      };

      return renderFormWithError(
        h,
        authContext,
        caseId,
        serverErrors,
        request.payload,
      );
    }
  },
};

const validateNote = (text) => {
  if (!text || text.trim() === "") {
    return { text: "You must enter a note" };
  }
  return null;
};

const renderFormWithError = async (
  h,
  authContext,
  caseId,
  errors,
  formData,
) => {
  const caseData = await findCaseByIdUseCase(authContext, caseId);
  const viewModel = createNewNoteViewModel(caseData, errors, formData);
  return h.view(`pages/notes/new-note`, viewModel);
};
