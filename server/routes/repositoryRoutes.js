import express from "express";
import {
  connectRepository,
  getProjectRepository,
  syncRepository,
  disconnectRepository,
} from "../controllers/repositoryController.js";
import { verifyJWT, verifyRole } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/connect", verifyJWT, verifyRole("team_head"), connectRepository);
router.get("/project/:projectId", verifyJWT, getProjectRepository);
router.post("/sync/:id", verifyJWT, verifyRole("team_head"), syncRepository);
router.delete(
  "/disconnect/:id",
  verifyJWT,
  verifyRole("team_head"),
  disconnectRepository,
);

export default router;
