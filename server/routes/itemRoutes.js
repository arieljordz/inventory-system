import express from "express";
import {
  addItem,
  getAllItems,
  getItemById,
  updateItem,
  deleteItem,
  restockItem,
} from "../controllers/itemController.js";

import upload from "../middlewares/uploadMiddleware.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

// 📦 Public Routes
router.get("/", getAllItems);
router.get("/:id", getItemById);

// 🔐 Protected Routes
router.post("/", authenticate, upload.single("image"), addItem);
router.put("/:id", authenticate, upload.single("image"), updateItem);
router.delete("/:id", authenticate, deleteItem);

// Restock (IN movement)
router.post("/:itemId/restock", authenticate, restockItem);

export default router;
