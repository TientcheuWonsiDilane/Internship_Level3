import { getIO } from "../socket/index.js";

/**
 * Thin, null-safe wrappers around the Socket.io instance so any module can
 * broadcast without importing the instance directly. All helpers no-op when
 * `io` is not initialised (e.g. during tests or in a worker process).
 */

export function emitToProject(projectId, event, payload) {
  const io = getIO();
  if (!io) return;
  io.to(`project:${projectId}`).emit(event, payload);
}

export function emitToTeam(teamId, event, payload) {
  const io = getIO();
  if (!io) return;
  io.to(`team:${teamId}`).emit(event, payload);
}

export function emitToUser(userId, event, payload) {
  const io = getIO();
  if (!io) return;
  io.to(`user:${userId}`).emit(event, payload);
}

export default { emitToProject, emitToTeam, emitToUser };
