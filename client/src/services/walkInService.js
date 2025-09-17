// services/userService.js
import api from "../api/api";

export const getMonthlyWalkInStats = () => {
  return api.get("/api/walk-ins/stats");
};

export const createWalkInTransaction = (data) => api.post("/api/walk-ins", data);
