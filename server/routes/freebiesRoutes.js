// routes/userRoutes.js
import { Router } from "express";
import {
  getMonthlyFreebiesStats,
  createFreebiesTransaction,
} from "../controllers/freebiesController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/stats", authenticate, getMonthlyFreebiesStats);

router.post("/", authenticate, createFreebiesTransaction);

export default router;
