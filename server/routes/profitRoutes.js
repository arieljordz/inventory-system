import express from "express";
import {
  getOrdersWithProfits,
  getWalkInTransactionsWithProfits,
} from "../controllers/profitController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

// 📌 Get all price profits (with pagination & search)
router.get("/profits", authenticate, getOrdersWithProfits);

// 📌 Get all price profits (with pagination & search)
router.get("/walk-in-profits", authenticate, getWalkInTransactionsWithProfits);

export default router;
