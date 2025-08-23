export const setFlashData = (request, { errors, formData }) => {
  if (errors !== undefined) {
    request.yar.flash("errors", errors);
  }
  if (formData !== undefined) {
    request.yar.flash("formData", formData);
  }
};

export const getFlashData = (request) => {
  const errors = request.yar.flash("errors")?.[0];
  const formData = request.yar.flash("formData")?.[0];
  return { errors, formData };
};
