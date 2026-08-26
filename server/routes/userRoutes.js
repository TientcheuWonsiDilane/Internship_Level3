import express from "express";
import {
  getMe,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";
import { verifyJWT } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/me", verifyJWT, getMe);
router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.put("/:id", verifyJWT, updateUser);
router.delete("/:id", verifyJWT, deleteUser);

export default router;
