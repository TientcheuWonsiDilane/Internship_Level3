import { Router } from "express";
import { syncRepositoryFromGithub } from "../controllers/githubSyncController.js";
import {
  verifyJWT,
  verifyRepositoryRole,
} from "../middlewares/authMiddleware.js";

const router = Router();

// Manual live sync: POST /api/github/repositories/:id/sync (team head only)
router.post(
  "/repositories/:id/sync",
  verifyJWT,
  verifyRepositoryRole("team_head"),
  syncRepositoryFromGithub,
);

export default router;
