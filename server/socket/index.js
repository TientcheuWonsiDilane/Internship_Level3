import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import Membership from "../models/MembershipModel.js";
import Project from "../models/ProjectModel.js";
import User from "../models/UserModel.js";
import { presence } from "./presence.js";

let io = null;

/** Parse a Cookie header into a plain object (no dependency needed). */
function parseCookies(header) {
  if (!header) return {};
  const out = {};
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    if (!key) continue;
    let value = part.slice(idx + 1).trim();
    try {
      value = decodeURIComponent(value);
    } catch {
      /* keep raw value when it is not valid percent-encoding */
    }
    out[key] = value;
  }
  return out;
}

/**
 * Handshake middleware: the client authenticates either with its JWT session
 * cookie (same-origin) or an explicit auth token. The verified user id is
 * attached to the socket for all subsequent room checks.
 */
function authenticateSocket(socket, next) {
  const cookies = parseCookies(socket.handshake.headers?.cookie);
  const token =
    socket.handshake.auth?.token || cookies.token || null;

  if (!token) {
    return next(new Error("Authentication required: no session token provided"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.data.userId = String(decoded.id);
    next();
  } catch {
    next(new Error("Authentication failed: invalid or expired token"));
  }
}

async function handleProjectJoin(socket, payload, callback) {
  const projectId = typeof payload === "string" ? payload : payload?.projectId;
  if (!projectId || !mongoose.isValidObjectId(projectId)) {
    typeof callback === "function" &&
      callback({ ok: false, error: "A valid project ID is required" });
    return;
  }

  try {
    // Access check: project -> owning team -> caller's membership.
    const project = await Project.findById(projectId).select("teamId").lean();
    if (!project) {
      typeof callback === "function" &&
        callback({ ok: false, error: "Project not found" });
      return;
    }
    const membership = await Membership.findOne({
      teamId: project.teamId,
      userId: socket.data.userId,
    }).lean();
    if (!membership) {
      typeof callback === "function" &&
        callback({ ok: false, error: "Forbidden: you are not a member of this team" });
      return;
    }

    const room = `project:${projectId}`;
    socket.join(room);
    presence.join(room, socket.id, { userId: socket.data.userId, ...socket.data.userSummary });
    io.to(room).emit("presence:update", { projectId, users: presence.list(room) });

    typeof callback === "function" && callback({ ok: true });
  } catch (error) {
    console.error("project:join error:", error);
    typeof callback === "function" && callback({ ok: false, error: "Internal server error" });
  }
}

function handleProjectLeave(socket, payload, callback) {
  const projectId = typeof payload === "string" ? payload : payload?.projectId;
  if (!projectId || !mongoose.isValidObjectId(projectId)) {
    typeof callback === "function" &&
      callback({ ok: false, error: "A valid project ID is required" });
    return;
  }

  const room = `project:${projectId}`;
  socket.leave(room);
  presence.leave(room, socket.id);
  io.to(room).emit("presence:update", { projectId, users: presence.list(room) });

  typeof callback === "function" && callback({ ok: true });
}

export function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin:
        process.env.SOCKET_CORS_ORIGIN ||
        process.env.FRONTEND_URL ||
        "http://localhost:5173",
      credentials: true,
    },
  });

  io.use(authenticateSocket);

  io.on("connection", async (socket) => {
    const userId = socket.data.userId;

    // Personal inbox for direct notifications (notification:new).
    socket.join(`user:${userId}`);

    try {
      const [user, memberships] = await Promise.all([
        User.findById(userId).select("username avatarUrl").lean(),
        Membership.find({ userId }).select("teamId").lean(),
      ]);
      socket.data.userSummary = {
        username: user?.username ?? "",
        avatarUrl: user?.avatarUrl ?? "",
      };
      // One team room per membership covers every team the user belongs to.
      for (const m of memberships) {
        socket.join(`team:${m.teamId}`);
      }
      socket.emit("connection:established", {
        userId,
        username: user?.username ?? "",
        teams: memberships.map((m) => String(m.teamId)),
      });
    } catch (error) {
      console.error("Socket connection bootstrap error:", error);
    }

    socket.on("project:join", (payload, cb) => handleProjectJoin(socket, payload, cb));
    socket.on("project:leave", (payload, cb) => handleProjectLeave(socket, payload, cb));

    socket.on("disconnecting", () => {
      const affectedRooms = presence.leaveAllForSocket(socket.id);
      for (const roomId of affectedRooms) {
        const projectId = roomId.replace(/^project:/, "");
        io.to(roomId).emit("presence:update", { projectId, users: presence.list(roomId) });
      }
    });
  });

  console.log("Socket.io server initialised");
  return io;
}

export function getIO() {
  return io;
}
