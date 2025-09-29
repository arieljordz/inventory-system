// routes/settingsRoutes.js
import { Router } from "express";
import {
  getCollections,
  backupCollections,
  downloadBackup,
  getFeatureFlags,
  getFeatureFlag,
  updateFeatureFlag,
  getOrderByNumber,
  updateOrderByNumber,
} from "../controllers/settingsController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/collections", authenticate, getCollections);

router.post("/backup", authenticate, backupCollections);

router.get("/backup/download/:file", authenticate, downloadBackup);

router.get("/feature-flags", authenticate, getFeatureFlags);

router.get("/feature-flags/:key", authenticate, getFeatureFlag);

router.put("/feature-flags/:key", authenticate, updateFeatureFlag);

router.get("/number/:orderNumber", authenticate, getOrderByNumber);

router.put("/number/:orderNumber", authenticate, updateOrderByNumber);

export default router;
