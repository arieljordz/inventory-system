import express from "express";
import { getAllAuditLogs } from "../controllers/auditLogsController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Get all audit logs with pagination & search
router.get("/", authenticate, getAllAuditLogs);

export default router;
