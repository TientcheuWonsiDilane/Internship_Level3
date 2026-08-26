import mongoose from "mongoose";
import Task from "../models/TaskModel.js";
import Project from "../models/ProjectModel.js";
import Membership from "../models/MembershipModel.js";

/**
 * Cross-project "My Tasks": every task assigned to the current user across
 * all teams they belong to. Optional filters: ?status=&priority=&projectId=.
 */
export const getMyTasks = async (req, res) => {
  const userId = req.user.id;
  const { status, priority, projectId } = req.query;

  try {
    // Resolve team ids the user belongs to -> projects -> tasks.
    const memberships = await Membership.find({ userId }).select("teamId").lean();
    if (memberships.length === 0) {
      return res.status(200).json({ success: true, tasks: [] });
    }
    const teamIds = memberships.map((m) => m.teamId);

    const projectFilter = { teamId: { $in: teamIds } };
    if (projectId && mongoose.isValidObjectId(projectId)) {
      projectFilter._id = projectId; // narrow to a single project when requested
    }
    const projects = await Project.find(projectFilter).select("_id").lean();
    if (projects.length === 0) {
      return res.status(200).json({ success: true, tasks: [] });
    }

    const taskFilter = {
      projectId: { $in: projects.map((p) => p._id) },
      assignedTo: userId,
    };
    if (status) taskFilter.status = status;
    if (priority) taskFilter.priority = priority;

    const tasks = await Task.find(taskFilter)
      .populate("projectId", "name slug")
      .sort({ dueDate: 1, createdAt: -1 })
      .limit(200)
      .lean();

    return res.status(200).json({ success: true, tasks });
  } catch (error) {
    console.error("My Tasks Error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error while fetching your tasks" });
  }
};

export default { getMyTasks };
