import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: false, trim: true },
    status: {
      type: String,
      enum: ["pending", "in_progress", "completed"],
      default: "pending",
    },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization" },
  },
  { timestamps: true }
);

const Task = mongoose.model("Task", taskSchema);
export default Task;