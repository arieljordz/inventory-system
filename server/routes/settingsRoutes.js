// routes/settingsRoutes.js
import { Router } from "express";
import {
  getCollections,
  backupCollections,
  downloadBackup,
} from "../controllers/settingsController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = Router();

// 🔹 Get all MongoDB collections
router.get("/collections", authenticate, getCollections);

// 🔹 Trigger backup (creates folder + JSON files)
router.post("/backup", authenticate, backupCollections);

// 🔹 Download a single backup JSON file
// Example: GET /settings/backup/download/backups_20250905_123000/products.json
router.get("/backup/download/:file", authenticate, downloadBackup);

export default router;
