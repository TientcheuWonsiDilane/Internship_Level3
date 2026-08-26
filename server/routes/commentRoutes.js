import { Router } from "express";
import {
  getTaskComments,
  addComment,
  requireTaskMember,
} from "../controllers/commentController.js";
import { verifyJWT } from "../middlewares/authMiddleware.js";

const router = Router();

// Spec contract: GET/POST /api/tasks/:id/comments
router.get("/:id/comments", verifyJWT, requireTaskMember, getTaskComments);
router.post("/:id/comments", verifyJWT, requireTaskMember, addComment);

export default router;

