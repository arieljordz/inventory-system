// services/userService.js
import api from "../api/api";

export const createWalkInTransaction = (data) => api.post("/api/walk-ins", data);
