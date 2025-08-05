import express from "express";
import { importSalesByPlatform, getSalesStatsByDate } from "../controllers/salesController.js";
import memoryUpload from "../middlewares/memoryUploadMiddleware.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/stats", authenticate, getSalesStatsByDate); 
router.post("/import-sales", authenticate, memoryUpload.single("file"), importSalesByPlatform);

export default router;
