/**
 * In-memory presence tracker for project rooms.
 *
 * Maps roomId -> Map<socketId, userSummary>. Multiple tabs from the same user
 * produce multiple sockets, but `list()` dedupes by userId so the board shows
 * one entry per person.
 *
 * Single-instance deployments only; a Redis-backed store can replace this
 * class without touching callers (same interface).
 */
class PresenceTracker {
  constructor() {
    this.rooms = new Map(); // roomId -> Map<socketId, { userId, username, avatarUrl }>
  }

  join(roomId, socketId, user) {
    if (!roomId || !socketId) return;
    let room = this.rooms.get(roomId);
    if (!room) {
      room = new Map();
      this.rooms.set(roomId, room);
    }
    room.set(socketId, {
      userId: String(user?.userId ?? ""),
      username: user?.username ?? "",
      avatarUrl: user?.avatarUrl ?? "",
    });
  }

  leave(roomId, socketId) {
    const room = this.rooms.get(roomId);
    if (!room) return;
    room.delete(socketId);
    if (room.size === 0) this.rooms.delete(roomId);
  }

  /** Remove a socket from every project room it occupies; returns affected room ids. */
  leaveAllForSocket(socketId) {
    const affected = [];
    for (const [roomId, room] of this.rooms) {
      if (room.has(socketId)) {
        room.delete(socketId);
        affected.push(roomId);
        if (room.size === 0) this.rooms.delete(roomId);
      }
    }
    return affected;
  }

  /** Distinct users currently viewing the given room. */
  list(roomId) {
    const room = this.rooms.get(roomId);
    if (!room) return [];
    const seen = new Set();
    const users = [];
    for (const entry of room.values()) {
      if (!entry.userId || seen.has(entry.userId)) continue;
      seen.add(entry.userId);
      users.push(entry);
    }
    return users;
  }

  size(roomId) {
    const room = this.rooms.get(roomId);
    return room ? room.size : 0;
  }
}

export const presence = new PresenceTracker();
export default presence;
