import express from "express";
import {
  createTask,
  getProjectTasks,
  claimTicket,
  submitForReview,
  updateTaskStatus,
  updateTask,
  deleteTask,
  updateTaskAssignee,
} from "../controllers/taskController.js";
import { verifyJWT, verifyRole } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/create", verifyJWT, verifyRole("team_head"), createTask);
router.get("/project/:projectId", verifyJWT, getProjectTasks);
router.post("/claim/:id", verifyJWT, claimTicket);
router.post("/submit/:id", verifyJWT, submitForReview);
router.put(
  "/update-status/:id",
  verifyJWT,
  verifyRole("team_head"),
  updateTaskStatus,
);
router.put("/update/:id", verifyJWT, verifyRole("team_head"), updateTask);
router.delete("/delete/:id", verifyJWT, verifyRole("team_head"), deleteTask);
router.put(
  "/assignee/:id",
  verifyJWT,
  verifyRole("team_head"),
  updateTaskAssignee,
);

export default router;
