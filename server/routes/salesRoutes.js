import express from "express";
import { getSalesStatsByDate, importSalesByPlatform, importReturnsByPlatform } from "../controllers/salesController.js";
import memoryUpload from "../middlewares/memoryUploadMiddleware.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/stats", authenticate, getSalesStatsByDate); 
router.post("/import-sales", authenticate, memoryUpload.single("file"), importSalesByPlatform);
router.post("/import-returns", authenticate, memoryUpload.single("file"), importReturnsByPlatform);

export default router;
