import ActivityLog from "../models/ActivityLogModel.js";
import { emitToTeam } from "./socketService.js";

/**
 * Appends an immutable entry to a team's Activity Log and broadcasts the new
 * entry to the team room (`team:activity`). Rolled up to team level always;
 * `projectId` is optional and set when the action relates to a specific project.
 */
export async function logActivity({
  teamId,
  projectId = null,
  actorId = null,
  action,
  target = { type: "", id: "" },
  metadata = {},
}) {
  if (!teamId) return null;

  const entry = await ActivityLog.create({
    teamId,
    projectId,
    actorId,
    action,
    target,
    metadata,
  });

  emitToTeam(teamId, "team:activity", entry.toJSON());

  return entry;
}

export default { logActivity };
