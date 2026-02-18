export const setFlashData = (request, { errors, formData, notification }) => {
  if (errors !== undefined) {
    setFlashValue(request, "errors", errors);
  }
  if (formData !== undefined) {
    setFlashValue(request, "formData", formData);
  }
  if (notification !== undefined) {
    setFlashValue(request, "notification", notification);
  }
};

export const setFlashNotification = (request, notification) => {
  setFlashData(request, { notification });
};

export const getFlashData = (request) => {
  const errors = getFlashValue(request, "errors");
  const formData = getFlashValue(request, "formData");
  return { errors, formData };
};

export const getFlashNotification = (request) =>
  getFlashValue(request, "notification");

export const setFlashValue = (request, key, value) => {
  request.yar?.flash?.(key, value);
};

export const getFlashValue = (request, key) => {
  return request.yar?.flash?.(key)?.[0];
};
