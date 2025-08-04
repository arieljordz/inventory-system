import express from "express";
import {
  getRemainingQuantities,
  getInventoryDetailsByStatus,
  getInventoryStats,
  getInventoryMovements,
  tagOrderForPickUp,
} from "../controllers/inventoryDetailController.js";

const router = express.Router();

router.get("/remaining-by-product", getRemainingQuantities);
router.get("/status/:status", getInventoryDetailsByStatus);
router.get("/stats", getInventoryStats);
router.get("/movements", getInventoryMovements);
router.post("/tag/:id", tagOrderForPickUp);

export default router;
