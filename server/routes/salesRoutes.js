import express from "express";
import {
  getSalesStats,
  getOrders,
  importSalesByPlatform,
  importReturnsByPlatform,
} from "../controllers/salesController.js";
import memoryUpload from "../middlewares/memoryUploadMiddleware.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/stats", authenticate, getSalesStats); 
router.get("/order-sales", authenticate, getOrders); 
router.post("/import-sales", authenticate, memoryUpload.single("file"), importSalesByPlatform);
router.post("/import-returns", authenticate, memoryUpload.single("file"), importReturnsByPlatform);

export default router;
