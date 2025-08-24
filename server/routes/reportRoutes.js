// src/routes/reportRoutes.js
import express from "express";
import { getReportData, exportReport } from "../controllers/reportController.js";

const router = express.Router();

// Fetch report data for display
router.get("/", getReportData);

// Export report (PDF or Excel)
router.post("/export", exportReport);

export default router;
