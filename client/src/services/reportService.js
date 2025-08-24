// src/services/reportService.js
import api from "../api/api";

export const getReports = (params) => api.get("/api/reports", { params });

export const exportReport = (payload) =>
  api.post("/api/reports/export", payload, { responseType: "arraybuffer" });
