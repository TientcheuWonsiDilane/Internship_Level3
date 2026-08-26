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
import {
  verifyJWT,
  verifyProjectRole,
  verifyTaskRole,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

// Any member of the team that owns the project can raise a task.
router.post("/create", verifyJWT, verifyProjectRole(), createTask);

router.get("/project/:projectId", verifyJWT, getProjectTasks);

// Members can claim a ticket or submit their own work for review.
router.post("/claim/:id", verifyJWT, verifyTaskRole(), claimTicket);
router.post("/submit/:id", verifyJWT, verifyTaskRole(), submitForReview);

// Management operations stay restricted to team heads.
router.put(
  "/update-status/:id",
  verifyJWT,
  verifyTaskRole("team_head"),
  updateTaskStatus,
);
router.put("/update/:id", verifyJWT, verifyTaskRole("team_head"), updateTask);
router.delete(
  "/delete/:id",
  verifyJWT,
  verifyTaskRole("team_head"),
  deleteTask,
);
router.put(
  "/assignee/:id",
  verifyJWT,
  verifyTaskRole("team_head"),
  updateTaskAssignee,
);

export default router;
