import { Router } from "express";
import {
  googleLogin,
  getMe,
  logout,
} from "../controllers/authController.js";
import { authenticate } from "../middlewares/authMiddleware.js"; 

const router = Router();

router.post("/google-login", googleLogin);
router.get("/me", authenticate, getMe);
router.post("/logout", authenticate, logout); 

export default router;
