import Comment from "../models/CommentModel.js";
import User from "../models/UserModel.js";
import Task from "../models/TaskModel.js";
import Project from "../models/ProjectModel.js";
import { emitToProject } from "../services/socketService.js";
import { logActivity } from "../services/activityService.js";
import { createNotification } from "../services/notificationService.js";
import { verifyTaskRole } from "../middlewares/authMiddleware.js";

/** Parse "@username" mentions and resolve them to real user ids. */
export async function parseMentions(body) {
  const handles = [...new Set((String(body).match(/@([a-zA-Z0-9_.-]+)/g) || []).map((m) => m.slice(1)))];
  if (handles.length === 0) return [];
  const users = await User.find({ username: { $in: handles } }).select("_id");
  return users.map((u) => u._id);
}

export const getTaskComments = async (req, res) => {
  try {
    const comments = await Comment.find({ taskId: req.params.id })
      .populate("authorId", "username avatarUrl")
      .populate("mentions", "username")
      .sort({ createdAt: 1 });
    return res.status(200).json({ success: true, comments });
  } catch (error) {
    console.error("List Comments Error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error while fetching comments" });
  }
};

export const addComment = async (req, res) => {
  const { id } = req.params; // task id (resolved + membership-checked by middleware)
  const { body } = req.body;
  const userId = req.user.id;

  if (!body || !String(body).trim()) {
    return res.status(400).json({ message: "Comment body is required" });
  }

  try {
    const task = await Task.findById(id).lean();
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const mentions = await parseMentions(body);

    const comment = await Comment.create({
      taskId: id,
      authorId: userId,
      body: String(body).trim(),
      mentions,
    });

    const populated = await Comment.findById(comment._id)
      .populate("authorId", "username avatarUrl")
      .populate("mentions", "username");

    // Real-time broadcast to everyone viewing the project.
    emitToProject(String(task.projectId), "comment:new", { comment: populated });

    // Activity entry.
    const project = await Project.findById(task.projectId).select("teamId").lean();
    if (project) {
      logActivity({
        teamId: project.teamId,
        projectId: String(task.projectId),
        actorId: userId,
        action: "comment.created",
        target: { type: "comment", id: String(comment._id) },
        metadata: { taskId: String(task._id), taskTitle: task.title },
      });
    }

    // Mention notifications (+ email — mentions are high-priority).
    for (const mentionedId of mentions) {
      if (String(mentionedId) === String(userId)) continue;
      await createNotification({
        userId: mentionedId,
        type: "mentioned",
        payload: {
          commentId: String(comment._id),
          taskId: String(task._id),
          taskTitle: task.title,
          excerpt: String(body).slice(0, 140),
        },
        email: true,
        emailSubject: `[Matrix] You were mentioned on "${task.title}"`,
      });
    }

    return res.status(201).json({ success: true, comment: populated });
  } catch (error) {
    console.error("Add Comment Error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error while posting comment" });
  }
};

// Membership gate shared by both endpoints: any team member may read/post.
export const requireTaskMember = verifyTaskRole();

export default { getTaskComments, addComment, requireTaskMember };
