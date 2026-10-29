import express from "express";
import cors from "cors";
import http from "http";
import "dotenv/config";
import dbConnect from "./config/db.js";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import invitationRoutes from "./routes/invitationRoutes.js";
import organizationRoutes from "./routes/organizationRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import repositoryRoutes from "./routes/repositoryRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import teamRoutes from "./routes/teamRoutes.js";

// --- New modules: real-time, notifications, activity, comments, GitHub ------
import { initSocket } from "./socket/index.js";
import { registerDomainHooks } from "./services/bootstrapHooks.js";
import { startWebhookWorker } from "./services/webhookProcessor.js";
import webhookRoutes from "./routes/webhookRoutes.js"; // /api/webhooks/github
import notificationRoutes from "./routes/notificationRoutes.js"; // /api/notifications
import commentRoutes from "./routes/commentRoutes.js"; // /api/tasks/:id/comments
import taskQueryRoutes from "./routes/taskQueryRoutes.js"; // /api/tasks?assignee=me
import activityRoutes from "./routes/activityRoutes.js"; // /api/teams/:id/activity
import githubSyncRoutes from "./routes/githubSyncRoutes.js"; // /api/github/repositories/:id/sync
import repositoryDataRoutes from "./routes/repositoryDataRoutes.js"; // /api/repositories/:id/(branches|settings)
import projectDataRoutes from "./routes/projectDataRoutes.js"; // /api/projects/:id/(pull-requests|commits)

const app = express();

// Keep a copy of the raw request body: GitHub webhook signatures are computed
// over the exact bytes delivered, so JSON parsing must not lose them.
app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "https://metrics-xs4x.onrender.com",
    credentials: true,
  }),
);
app.use(cookieParser());

const port = process.env.PORT || 5500;

dbConnect();
registerDomainHooks(); // Mongoose hooks -> socket broadcasts + activity log + notifications
startWebhookWorker(); // async handlers for verified webhook events

// --- Existing API surface (unchanged) ---------------------------------------
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/invitations", invitationRoutes);
app.use("/api/organizations", organizationRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/repositories", repositoryRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/teams", teamRoutes);

// --- New API surface ---------------------------------------------------------
// Public HMAC-authenticated webhook receiver.
app.use("/api/webhooks", webhookRoutes);
// Notifications inbox.
app.use("/api/notifications", notificationRoutes);
// Task comments & cross-project My Tasks (mounted after existing task routes).
app.use("/api/tasks", commentRoutes);
app.use("/api/tasks", taskQueryRoutes);
// Team activity feed (mounted after existing team routes; no path conflicts).
app.use("/api/teams", activityRoutes);
// On-demand GitHub REST sync.
app.use("/api/github", githubSyncRoutes);
// Cached GitHub data per repository / project.
app.use("/api/repositories", repositoryDataRoutes);
app.use("/api/projects", projectDataRoutes);

// 404 for unknown API paths.
app.use((_req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Central error handler (bad JSON bodies, unexpected failures).
app.use((error, _req, res, _next) => {
  if (error?.type === "entity.parse.failed") {
    return res.status(400).json({ message: "Malformed JSON body" });
  }
  console.error("Unhandled error:", error);
  return res.status(500).json({ message: "Internal server error" });
});

const server = http.createServer(app);

// Real-time layer: JWT-authenticated WebSocket connections with team/project/
// user rooms, presence tracking and the full event catalogue.
initSocket(server);

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Graceful shutdown so in-flight webhook jobs and sockets drain cleanly.
async function shutdown(signal) {
  console.log(`\n${signal} received — shutting down gracefully...`);
  server.close(async () => {
    try {
      const mongoose = await import("mongoose");
      await mongoose.default.connection.close(false);
      console.log("HTTP server and MongoDB connection closed.");
      process.exit(0);
    } catch (error) {
      console.error("Error during shutdown:", error);
      process.exit(1);
    }
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

export { app, server };
