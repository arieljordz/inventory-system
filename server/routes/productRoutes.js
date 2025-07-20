import express from 'express';
import {
  addProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductsByStatus,
  restockProduct,
  getProductStats,
} from '../controllers/productController.js';

import upload from '../middlewares/uploadMiddleware.js';

const router = express.Router();

// Product routes
router.post('/', upload.single('image'), addProduct);
router.get('/', getProducts); 
router.get('/status/:status', getProductsByStatus);
router.get('/stats', getProductStats);
router.get('/:id', getProductById);
router.put('/:id', upload.single('image'), updateProduct);
router.delete('/:id', deleteProduct);
router.post('/:productId/restock', restockProduct);

export default router;
