import express from "express";
import {
  importProducts,
  addProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductsByStatus,
  restockProduct,
  getProductStats,
} from "../controllers/productController.js";

import upload from "../middlewares/uploadMiddleware.js";
import memoryUpload from "../middlewares/memoryUploadMiddleware.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public route
router.get("/", getProducts);
router.get("/status/:status", getProductsByStatus);
router.get("/stats", authenticate, getProductStats);
router.get("/:id", authenticate, getProductById);

// Protected routes
router.post("/import-products", authenticate, memoryUpload.single("file"), importProducts); 
router.post("/", authenticate, upload.single("image"), addProduct); 
router.put("/:id", authenticate, upload.single("image"), updateProduct);
router.delete("/:id", authenticate, deleteProduct);
router.post("/:productId/restock", authenticate, restockProduct);

export default router;
