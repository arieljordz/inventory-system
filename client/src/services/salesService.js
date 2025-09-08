import api from "../api/api";

const multipartHeaders = {
  headers: { "Content-Type": "multipart/form-data" },
};

export const getSalesStats = () => {
  return api.get("/api/sales/stats");
};

export const getOrders = ({ page = 1, limit = 10, search = "" }) => {
  return api.get("/api/sales/order-sales", {
    params: { page, limit, search },
  });
};

export const importSalesByPlatform = (formData) =>
  api.post("/api/sales/import-sales", formData, multipartHeaders);

export const importReturnsByPlatform = (formData) =>
  api.post("/api/sales/import-returns", formData, multipartHeaders);
