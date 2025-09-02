import api from "../api/api";

const multipartHeaders = {
  headers: { "Content-Type": "multipart/form-data" },
};

export const getRemainingPerProduct = () =>
  api.get("/api/inventory-details/remaining-by-product");

export const getInventoryStats = (startDate, endDate) =>
  api.get(`/api/inventory-details/stats?start=${startDate}&end=${endDate}`);

export const getItemMovements = ({
  startDate,
  endDate,
  page = 1,
  limit = 10,
  search = "",
}) =>
  api.get("/api/inventory-details/movements", {
    params: {
      start: startDate,
      end: endDate,
      page,
      limit,
      search,
    },
  });

export const getInventoryDetailsByStatus = (status) =>
  api.get(`/api/inventory-details/status/${status}`);
