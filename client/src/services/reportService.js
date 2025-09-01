// src/services/reportService.js
import api from "../api/api";

const jsonHeaders = {
  headers: { "Content-Type": "application/json" },
};

export const getReports = (params) => api.get("/api/reports", { params });

export const exportReport = (payload) =>
  api.post("/api/reports/export", payload, { responseType: "arraybuffer" });

export const generateReport = (options) => {
  return api.post("/api/reports/generate", options, jsonHeaders);
};
