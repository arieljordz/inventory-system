import express from "express";
import { getInventoryStats, getDashboardCharts } from "../controllers/dashboardController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();


// Protected routes
router.get("/stats", authenticate, getInventoryStats);

router.get("/charts", authenticate, getDashboardCharts);

export default router;
