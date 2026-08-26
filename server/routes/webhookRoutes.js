import { Router } from "express";
import rateLimit from "express-rate-limit";
import { receiveGithubWebhook } from "../controllers/webhookController.js";

const router = Router();

// GitHub delivers bursts of events; allow a generous but bounded rate.
const webhookLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many webhook deliveries from this IP" },
});

/**
 * Public endpoint — authenticated by HMAC-SHA256 signature instead of JWT.
 * Mounted at /api/webhooks/github.
 */
router.post("/github", webhookLimiter, receiveGithubWebhook);

export default router;
