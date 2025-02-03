// utils/response.js
export const sendResponse = (res, status, data) => {
    res.status(status).json(data);
};

export const sendError = (res, status, message) => {
    res.status(status).json({ error: message });
};
