import express from "express";
import {
  getRemainingQuantities,
  getInventoryDetailsByStatus,
  getInventoryStats,
  getItemMovements,
} from "../controllers/inventoryDetailController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/remaining-by-product", getRemainingQuantities);
router.get("/status/:status", getInventoryDetailsByStatus);
router.get("/stats", getInventoryStats);
router.get("/movements", getItemMovements);

export default router;
