import api from "../api/api";

const multipartHeaders = {
  headers: { "Content-Type": "multipart/form-data" },
};

export const getAllOrders = ({ page = 1, limit = 10, search = "" } = {}) =>
  api.get("/api/orders", { params: { page, limit, search } });

export const getOrderStatsByPlatform = () =>
  api.get(`/api/orders/stats`);

export const getAllOrdersByDate = (start, end) =>
  api.get("/api/orders/by-date", {
    params: { start, end },
  });

export const importOrdersByPlatform = (formData) =>
  api.post("/api/orders/import-orders", formData, multipartHeaders);