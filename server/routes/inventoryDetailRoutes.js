import express from "express";
import {
  getRemainingQuantities,
  getInventoryDetailsByStatus,
  getInventoryStats,
  getInventoryMovements,
  tagOrderForPickUp,
} from "../controllers/inventoryDetailController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/remaining-by-product", getRemainingQuantities);
router.get("/status/:status", getInventoryDetailsByStatus);
router.get("/stats", getInventoryStats);
router.get("/movements", getInventoryMovements);

// ✅ Protect the route with authentication middleware
router.post("/tag/:id", authenticate, tagOrderForPickUp);

export default router;
