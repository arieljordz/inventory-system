import express from "express";
import {
  getAllAdjustments,
  applyAdjustment,
  getAdjustmentsByTarget,
} from "../controllers/adjustmentController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

// 📌 Get all price adjustments (with pagination & search)
router.get("/", authenticate, getAllAdjustments);

// 📌 Apply a new adjustment
router.post("/apply", authenticate, applyAdjustment);

// 📌 Get adjustments for a specific Product/Item
router.get("/:targetType/:targetId", authenticate, getAdjustmentsByTarget);

export default router;
