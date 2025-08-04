import express from "express";
import {
  getAllOrders,
  importOrdersByPlatform,
} from "../controllers/orderController.js";
import memoryUpload from "../middlewares/memoryUploadMiddleware.js";

const router = express.Router();

router.get("/", getAllOrders);
router.post("/import-orders", memoryUpload.single("file"), importOrdersByPlatform);

export default router;
