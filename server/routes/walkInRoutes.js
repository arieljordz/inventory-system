// routes/userRoutes.js
import { Router } from "express";
import { createWalkInTransaction } from "../controllers/walkInController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/", authenticate, createWalkInTransaction);

export default router;
