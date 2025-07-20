import api from "../api/api";

const multipartHeaders = {
  headers: { "Content-Type": "multipart/form-data" },
};

export const getRemainingPerProduct = () =>
  api.get("/api/inventory-details/remaining-by-product");

// Fetch inventory stats for a date range
export const getInventoryStats = (startDate, endDate) =>
  api.get(`/api/inventory-details/stats?start=${startDate}&end=${endDate}`);

// Fetch inventory movements for a date range
export const getInventoryMovements = (startDate, endDate) =>
  api.get(`/api/inventory-details/movements?start=${startDate}&end=${endDate}`);


// Existing - Get inventory details by status
export const getInventoryDetailsByStatus = (status) =>
  api.get(`/api/inventory-details/status/${status}`);

export const tagInventoryForPickUp = (id, pickupQty) =>
  api.post(`/api/inventory-details/tag/${id}`, { pickupQty });



