import express from "express";
import { getDashboardCharts } from "../controllers/dashboardController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/charts", authenticate, getDashboardCharts);

export default router;
