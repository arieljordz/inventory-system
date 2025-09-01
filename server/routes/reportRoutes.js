// src/routes/reportRoutes.js
import express from "express";
import {
  getReportData,
  exportReport,
  generateReport,
} from "../controllers/reportController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Fetch report data for display
router.get("/", getReportData);

// Export report (PDF or Excel)
router.post("/export", exportReport);

// 📊 Public Routes (e.g., viewing reports could be public or limited by your app needs)
// Currently, all reports require authentication, adjust as needed
router.post("/generate", authenticate, generateReport);

export default router;
