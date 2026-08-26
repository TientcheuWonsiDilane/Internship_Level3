import { Router } from "express";
import {
  getProjectPullRequests,
  getProjectCommits,
} from "../controllers/githubSyncController.js";
import {
  verifyJWT,
  verifyProjectRole,
} from "../middlewares/authMiddleware.js";

const router = Router();

// Spec contract:
//   GET /api/projects/:id/pull-requests  -> repo:pr-updated live updates
//   GET /api/projects/:id/commits        -> repo:push live updates
router.get("/:id/pull-requests", verifyJWT, verifyProjectRole(), getProjectPullRequests);
router.get("/:id/commits", verifyJWT, verifyProjectRole(), getProjectCommits);

export default router;
