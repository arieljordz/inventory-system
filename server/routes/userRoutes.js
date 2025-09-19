// routes/userRoutes.js
import { Router } from "express";
import {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";
import { UserRoleEnum } from "../enums/enums.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { authorize } from "../middlewares/roleMiddleware.js";

const router = Router();

// Protected routes — only logged in users can manage users
router.post("/", authenticate, authorize(UserRoleEnum.ADMIN),createUser);
router.get("/", authenticate, getUsers);
router.get("/:id", authenticate, getUserById);
router.put("/:id", authenticate, authorize(UserRoleEnum.ADMIN),updateUser);
router.delete("/:id", authenticate, authorize(UserRoleEnum.ADMIN),deleteUser);

export default router;
