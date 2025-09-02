// src/routes/reportRoutes.js
import express from "express";
import { generateReport } from "../controllers/reportController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

// 📊 Public Routes (e.g., viewing reports could be public or limited by your app needs)
// Currently, all reports require authentication, adjust as needed
router.post("/generate", authenticate, generateReport);

export default router;
