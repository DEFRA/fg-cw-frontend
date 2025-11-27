export const setFlashData = (request, { errors, formData, notification }) => {
  if (errors !== undefined) {
    request.yar.flash("errors", errors);
  }
  if (formData !== undefined) {
    request.yar.flash("formData", formData);
  }
  if (notification !== undefined) {
    request.yar.flash("notification", notification);
  }
};

export const getFlashData = (request) => {
  const errors = request.yar.flash("errors")?.[0];
  const formData = request.yar.flash("formData")?.[0];
  return { errors, formData };
};

export const getFlashNotification = (request) =>
  request.yar.flash("notification")?.[0];
