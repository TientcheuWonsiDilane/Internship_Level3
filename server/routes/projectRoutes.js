import {
  createProject,
  getTeamProjects,
  getProjectBySlug,
  updateProject,
  deleteProject,
} from "../controllers/projectController.js";
import express from "express";
import {
  verifyJWT,
  verifyRole,
  verifyProjectRole,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", verifyJWT, verifyRole("team_head"), createProject);
router.post("/create", verifyJWT, verifyRole("team_head"), createProject);
router.get("/team/:teamId", verifyJWT, getTeamProjects);
router.get("/:slug", verifyJWT, getProjectBySlug);
router.put("/update/:id", verifyJWT, verifyProjectRole("team_head"), updateProject);
router.delete("/delete/:id", verifyJWT, verifyProjectRole("team_head"), deleteProject);

export default router;
