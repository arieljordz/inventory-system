import api from "../api/api";

const multipartHeaders = {
  headers: { "Content-Type": "multipart/form-data" },
};

export const importSalesByPlatform = (formData) =>
  api.post("/api/sales/import-sales", formData, multipartHeaders);