import { Router } from "express";
import {
  getRepositoryBranches,
  getRepositorySettings,
  updateRepositorySettings,
} from "../controllers/githubSyncController.js";
import {
  verifyJWT,
  verifyRepositoryRole,
} from "../middlewares/authMiddleware.js";

const router = Router();

// Spec contract: GET /api/repositories/:id/branches (any member)
router.get("/:id/branches", verifyJWT, verifyRepositoryRole(), getRepositoryBranches);

// Spec contract: GET/PATCH /api/repositories/:id/settings (team head for writes)
router.get("/:id/settings", verifyJWT, verifyRepositoryRole(), getRepositorySettings);
router.patch(
  "/:id/settings",
  verifyJWT,
  verifyRepositoryRole("team_head"),
  updateRepositorySettings,
);

export default router;
