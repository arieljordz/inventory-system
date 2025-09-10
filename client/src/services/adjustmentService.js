import api from "../api/api";

// 📌 Fetch all products
export const getProducts = ({ page = 1, limit = 10, search = "" } = {}) =>
  api.get("/api/products", { params: { page, limit, search } });

// 📌 Fetch all items
export const getAllItems = ({ page = 1, limit = 10, search = "" } = {}) =>
  api.get("/api/items", { params: { page, limit, search } });

// 📌 Apply price adjustment (markup or discount)
export const applyAdjustment = async (payload) => {
  const res = await api.post("/api/price-adjustments/apply", payload);
  return res.data;
};

// 📌 Get all adjustments with pagination & search
export const getAdjustments = async (params = {}) => {
  const res = await api.get("/api/price-adjustments", { params });
  return res.data;
};

// 📌 Get adjustments for a specific Product/Item (optional helper)
export const getAdjustmentsByTarget = async (targetType, targetId) => {
  const res = await api.get(`/api/price-adjustments`, {
    params: { targetType, targetId },
  });
  return res.data;
};
