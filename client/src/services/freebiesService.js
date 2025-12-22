// services/userService.js
import api from "../api/api";

export const getMonthlyFreebiesStats = () => {
  return api.get("/api/freebies/stats");
};

export const createFreebiesTransaction = (data) => api.post("/api/freebies", data);