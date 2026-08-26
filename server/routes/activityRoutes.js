import { Router } from "express";
import { getTeamActivity } from "../controllers/activityController.js";
import { verifyJWT, verifyRole } from "../middlewares/authMiddleware.js";

const router = Router();

// Spec contract: GET /api/teams/:id/activity (optional ?projectId=&action=&limit=)
router.get("/:id/activity", verifyJWT, verifyRole(), getTeamActivity);

export default router;
