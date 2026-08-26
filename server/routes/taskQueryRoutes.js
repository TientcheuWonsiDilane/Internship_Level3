import { Router } from "express";
import { getMyTasks } from "../controllers/taskViewController.js";
import { verifyJWT } from "../middlewares/authMiddleware.js";

const router = Router();

// Spec contract: GET /api/tasks?assignee=me (cross-project "My Tasks")
router.get("/", verifyJWT, (req, res, next) => {
  if (req.query.assignee !== "me") {
    return res
      .status(400)
      .json({ message: 'This endpoint supports ?assignee=me only' });
  }
  next();
}, getMyTasks);

export default router;
