import api from "../api/api";

const multipartHeaders = {
  headers: { "Content-Type": "multipart/form-data" },
};

export const getAllOrders = () => api.get("/api/orders");

export const getAllOrdersByDate = (start, end) =>
  api.get("/api/orders/by-date", {
    params: { start, end },
  });

export const importOrdersByPlatform = (formData) =>
  api.post("/api/orders/import-orders", formData, multipartHeaders);