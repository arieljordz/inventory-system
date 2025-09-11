import api from "../api/api";

// 📌 Fetch all items
export const getOrdersWithProfits = ({ page = 1, limit = 10, search = "" } = {}) =>
  api.get("/api/cost-profits/profits", { params: { page, limit, search } });

// 📌 Fetch all items
export const getWalkInTransactionsWithProfits = ({ page = 1, limit = 10, search = "" } = {}) =>
  api.get("/api/cost-profits/walk-in-profits", { params: { page, limit, search } });
