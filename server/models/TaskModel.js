import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: false, trim: true },
    status: {
      type: String,
      enum: ["todo", "in_progress", "in_review", "done"],
      default: "todo",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    dueDate: { type: Date, required: false },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    linkedRepository: { type: mongoose.Schema.Types.ObjectId, ref: "Repository" },
    linkedBranch: { type: String, required: false },
    linkedCommit: { type: String, required: false },
    linkedPullRequest: { type: String, required: false }
  },
  { timestamps: true }
);

taskSchema.index({ projectId: 1, status: 1 });
taskSchema.index({ linkedBranch: 1 }, { unique: true, sparse: true });

const Task = mongoose.model("Task", taskSchema);
export default Task;
