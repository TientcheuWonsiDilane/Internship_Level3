import express from "express";
import {
  connectRepository,
  getProjectRepository,
  syncRepository,
  disconnectRepository,
  connectRepositoryViaOauth,
} from "../controllers/repositoryController.js";
import {
  verifyJWT,
  verifyProjectRole,
  verifyRepositoryRole,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post(
  "/connect",
  verifyJWT,
  verifyProjectRole("team_head"),
  connectRepository,
);
router.post(
  "/connect/oauth",
  verifyJWT,
  verifyProjectRole("team_head"),
  connectRepositoryViaOauth,
);
router.get("/project/:projectId", verifyJWT, getProjectRepository);
router.post(
  "/sync/:id",
  verifyJWT,
  verifyRepositoryRole("team_head"),
  syncRepository,
);
router.delete(
  "/disconnect/:id",
  verifyJWT,
  verifyRepositoryRole("team_head"),
  disconnectRepository,
);

export default router;
