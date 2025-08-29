import api from "../api/api";

const multipartHeaders = {
  headers: { "Content-Type": "multipart/form-data" },
};

// Fetch all audit logs with pagination & search
export const getAllAuditLogs = ({ page = 1, limit = 10, search = "" } = {}) =>
  api.get("/api/auditlogs", { params: { page, limit, search } });
