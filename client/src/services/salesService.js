import api from "../api/api";

const multipartHeaders = {
  headers: { "Content-Type": "multipart/form-data" },
};

export const getSalesStatsByDate = ({
  start,
  end,
  page = 1,
  limit = 10,
  search = "",
}) => {
  return api.get("/api/sales/stats", {
    params: { start, end, page, limit, search },
  });
};

export const importSalesByPlatform = (formData) =>
  api.post("/api/sales/import-sales", formData, multipartHeaders);


export const importReturnsByPlatform = (formData) =>
  api.post("/api/sales/import-returns", formData, multipartHeaders);