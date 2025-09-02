import api from "../api/api";

const multipartHeaders = {
  headers: { "Content-Type": "multipart/form-data" },
};

export const getDashboardCharts = () =>
  api.get("/api/dashboard/charts");