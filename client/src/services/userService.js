// services/userService.js
import api from "../api/api";

// Get all users (with pagination + search)
export const getUsers = ({ page = 1, limit = 10, search = "" } = {}) =>
  api.get("/api/users", { params: { page, limit, search } });

// Get single user by ID
export const getUserById = (id) => api.get(`/api/users/${id}`);

// Create a new user
export const createUser = (data) => api.post("/api/users", data);

// Update an existing user
export const updateUser = (id, data) => api.put(`/api/users/${id}`, data);

// Delete a user
export const deleteUser = (id) => api.delete(`/api/users/${id}`);
