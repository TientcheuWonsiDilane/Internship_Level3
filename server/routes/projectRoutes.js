import {
  createProject,
  getTeamProjects,
  getProjectBySlug,
  updateProject,
  deleteProject,
} from "../controllers/projectController.js";
import express from "express";
import { verifyJWT, verifyRole } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/create", verifyJWT, verifyRole("team_head"), createProject);
router.get("/team/:teamId", getTeamProjects);
router.get("/:slug", getProjectBySlug);
router.put("/update/:id", verifyJWT, verifyRole("team_head"), updateProject);
router.delete("/delete/:id", verifyJWT, verifyRole("team_head"), deleteProject);

export default router;
