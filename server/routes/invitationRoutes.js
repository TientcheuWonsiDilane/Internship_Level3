import {
  sendInvitation,
  getMyInvitations,
  respondToInvitation,
} from "../controllers/invitationController.js";
import express from "express";
import { verifyJWT, verifyRole } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/send", verifyJWT, verifyRole("team_head"), sendInvitation);
router.get("/my-invitations", verifyJWT, getMyInvitations);
router.post("/respond/:id", verifyJWT, respondToInvitation);

export default router;
