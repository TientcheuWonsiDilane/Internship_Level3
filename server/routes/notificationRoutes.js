import { Router } from "express";
import {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../controllers/notificationController.js";
import { verifyJWT } from "../middlewares/authMiddleware.js";

const router = Router();

// Spec contract: GET /api/notifications, PATCH /api/notifications/:id/read
router.get("/", verifyJWT, listNotifications);
router.patch("/:id/read", verifyJWT, markNotificationRead);
router.post("/read-all", verifyJWT, markAllNotificationsRead);

export default router;
