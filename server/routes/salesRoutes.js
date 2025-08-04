import express from "express";
import { importSalesByPlatform, getSalesStatsByDate } from "../controllers/salesController.js";
import memoryUpload from "../middlewares/memoryUploadMiddleware.js";

const router = express.Router();

router.get("/stats", getSalesStatsByDate);
router.post("/import-sales", memoryUpload.single("file"), importSalesByPlatform);

export default router;
