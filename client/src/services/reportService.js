// src/services/reportService.js
import api from "../api/api";

// Fetch report data by type and date range
export const getReports = (params) => api.get("/api/reports", { params });
