import express from "express";
import {
  addProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductsByStatus,
  restockProduct,
  getProductStats,
  importProducts,
  exportProducts,
} from "../controllers/productController.js";

import upload from "../middlewares/uploadMiddleware.js";
import memoryUpload from "../middlewares/memoryUploadMiddleware.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", getProducts);
router.get("/status/:status", getProductsByStatus);

// Protected routes
router.get("/stats", authenticate, getProductStats);

// Static export/import routes should come BEFORE dynamic :id
router.get("/export-products", authenticate, exportProducts);
router.post("/import-products", authenticate, memoryUpload.single("file"), importProducts);

// CRUD routes
router.post("/", authenticate, upload.single("image"), addProduct);
router.put("/:id", authenticate, upload.single("image"), updateProduct);
router.delete("/:id", authenticate, deleteProduct);

// Restock
router.post("/:productId/restock", authenticate, restockProduct);

// Dynamic route last
router.get("/:id", authenticate, getProductById);

export default router;
