// src/services/itemService.js
import api from "../api/api";

const multipartHeaders = {
  headers: { "Content-Type": "multipart/form-data" },
};

// ✅ Get all items
export const getAllItems = ({ page = 1, limit = 10, search = "" } = {}) =>
  api.get("/api/items", { params: { page, limit, search } });

// ✅ Get single item by ID
export const getItemById = (id) => api.get(`/api/items/${id}`);

// ✅ Create a new item (with image upload)
export const createItem = (formData) =>
  api.post("/api/items", formData, multipartHeaders);

// ✅ Update an existing item (with image upload)
export const updateItem = (id, formData) =>
  api.put(`/api/items/${id}`, formData, multipartHeaders);

// ✅ Delete an item
export const deleteItem = (id) => api.delete(`/api/items/${id}`);

// ✅ Restock an item (IN movement)
export const restockItem = (itemId, data) =>
  api.post(`/api/items/${itemId}/restock`, data);

// Fetch inventory stats for a date range
export const getInventoryStats = () =>
  api.get(`/api/items/stats`);
