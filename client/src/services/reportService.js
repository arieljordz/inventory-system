// src/services/reportService.js
import api from "../api/api";

const jsonHeaders = {
  headers: { "Content-Type": "application/json" },
};

export const generateReport = (options) => {
  return api.post("/api/reports/generate", options, jsonHeaders);
};
