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

export const importProducts = (formData) =>
  api.post("/api/products/import-products", formData, multipartHeaders);

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

// PUT /api/products/:id
export const tagProductForPickup = (id, pickupQty) =>
  api.put(`api/products/${id}/pickup`, { pickupQty });

export const restockProduct = (productId, data) =>
  api.post(`/api/products/${productId}/restock`, data);

export const getProductStats = () => api.get("/api/products/stats");
