import express from "express";
import {
  getAllOrders,
  importOrdersByPlatform,
  getOrderStatsByPlatform,
} from "../controllers/orderController.js";
import memoryUpload from "../middlewares/memoryUploadMiddleware.js";
import { authenticate } from "../middlewares/authMiddleware.js"; 

const router = express.Router();

router.get("/", getAllOrders);
router.get("/stats", getOrderStatsByPlatform);
router.post("/import-orders", authenticate, memoryUpload.single("file"), importOrdersByPlatform); 

export default router;
