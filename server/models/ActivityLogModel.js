import mongoose from "mongoose";

// Sub-schema so the spec-shaped `target: { type, id }` isn't misinterpreted by
// Mongoose (a field literally named "type" requires this indirection).
const targetSchema = new mongoose.Schema(
  {
    type: { type: String, default: "" }, // e.g. "task" | "pull_request" | "member"
    id: { type: String, default: "" },
  },
  { _id: false },
);

const activityLogSchema = new mongoose.Schema(
  {
    // Owning team — every action rolls up to team level for the Activity Log page.
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },
    // Set when the action occurred within a specific project; omitted for
    // team-level actions such as membership or organization changes.
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      default: null,
    },
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    action: { type: String, required: true, trim: true }, // e.g. task.created, repository.connected, member.joined
    target: { type: targetSchema, default: () => ({}) },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

// Activity feed queries: filter by team (optionally project), newest first.
activityLogSchema.index({ teamId: 1, createdAt: -1 });
activityLogSchema.index({ projectId: 1, createdAt: -1 });
activityLogSchema.index({ action: 1 });

const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);
export default ActivityLog;
