import express from "express";
import {
  create,
  myTeams,
  update,
  getTeam,
  getTeamMembers,
  delTeam,
} from "../controllers/teamController.js";
import { verifyJWT, verifyRole } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", verifyJWT, create);
router.post("/create", verifyJWT, create);
router.get("/my-teams/:userId", myTeams);
router.put("/update/:id", verifyJWT, verifyRole("team_head"), update);
router.get("/:id/members", verifyJWT, getTeamMembers);
router.get("/:id", verifyJWT, getTeam);
router.delete("/delete/:id", verifyJWT, verifyRole("team_head"), delTeam);

export default router;
