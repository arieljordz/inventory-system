import express from "express";
import { importSalesByPlatform } from "../controllers/salesController.js";
import memoryUpload from "../middlewares/memoryUploadMiddleware.js";

const router = express.Router();

router.post("/import-sales", memoryUpload.single("file"), importSalesByPlatform);

export default router;
