import api from "../api/api";

const multipartHeaders = {
  headers: { "Content-Type": "multipart/form-data" },
};

// Get all products
export const getProducts = ({ page = 1, limit = 10, search = "" } = {}) =>
  api.get("/api/products", { params: { page, limit, search } });

// Create a new product
export const createProduct = (formData) =>
  api.post("/api/products", formData, multipartHeaders);

// Update an existing product
export const updateProduct = (id, formData) =>
  api.put(`/api/products/${id}`, formData, multipartHeaders);

// Delete a product
export const deleteProduct = (id) => api.delete(`/api/products/${id}`);

// Get products by status
export const getProductsByStatus = ({
  status,
  page = 1,
  limit = 10,
  search = "",
} = {}) =>
  api.get(`/api/products/status/${encodeURIComponent(status)}`, {
    params: { page, limit, search },
  });

export const restockProduct = (productId, data) =>
  api.post(`/api/products/${productId}/restock`, data);

export const importProducts = (formData) =>
  api.post("/api/products/import-products", formData, multipartHeaders);

export const exportProducts = () =>
  api.get("/api/products/export-products", { responseType: "arraybuffer" });

export const getInventoryStats = () =>
  api.get(`/api/products/stats`);