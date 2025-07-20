import express from "express";
import {
  getRemainingQuantities,
  getInventoryDetailsByStatus,
  getInventoryStats,
  getInventoryMovements,
  tagForPickUp,
} from "../controllers/inventoryDetailController.js";

const router = express.Router();

router.get("/remaining-by-product", getRemainingQuantities);
router.get("/status/:status", getInventoryDetailsByStatus);
router.get("/stats", getInventoryStats);
router.get("/movements", getInventoryMovements);
router.post("/tag/:id", tagForPickUp);

export default router;
