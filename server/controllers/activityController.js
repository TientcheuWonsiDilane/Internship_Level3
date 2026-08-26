import ActivityLog from "../models/ActivityLogModel.js";

/**
 * Team activity feed: GET /api/teams/:id/activity
 * Optional filters: ?projectId=&action=&limit= — newest first, immutable log.
 */
export const getTeamActivity = async (req, res) => {
  const { id } = req.params; // team id (membership-checked by middleware)
  const { projectId, action } = req.query;
  const limit = Math.min(Number(req.query.limit) || 50, 200);

  try {
    const filter = { teamId: id };
    if (projectId) filter.projectId = projectId;
    if (action) filter.action = action;

    const activity = await ActivityLog.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("actorId", "username avatarUrl")
      .lean();

    return res.status(200).json({ success: true, activity });
  } catch (error) {
    console.error("Fetch Activity Error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error while fetching activity" });
  }
};

export default { getTeamActivity };
