import {
  sendInvitation,
  getMyInvitations,
  getTeamInvitations,
  respondToInvitation,
  acceptInvitationByToken,
} from "../controllers/invitationController.js";
import express from "express";
import { verifyJWT, verifyRole } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/send", verifyJWT, verifyRole("team_head"), sendInvitation);
router.get("/team/:teamId", verifyJWT, verifyRole("team_head"), getTeamInvitations);
router.get("/my-invitations", verifyJWT, getMyInvitations);
router.post("/respond/:id", verifyJWT, respondToInvitation);
router.post("/:token/accept", verifyJWT, acceptInvitationByToken);

export default router;
