import api from "../api/api";

const multipartHeaders = {
  headers: { "Content-Type": "multipart/form-data" },
};

export const getInventoryStats = () => api.get("/api/dashboard/stats");

export const getDashboardCharts = () =>
  api.get("/api/dashboard/charts");