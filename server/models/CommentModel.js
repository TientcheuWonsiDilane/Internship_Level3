import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    body: { type: String, required: true, trim: true },
    // Parsed @mentions, used to trigger mention notifications.
    mentions: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User", default: [] },
    ],
  },
  { timestamps: true },
);

// Thread listing for a task, oldest first (conversation order).
commentSchema.index({ taskId: 1, createdAt: 1 });

const Comment = mongoose.model("Comment", commentSchema);
export default Comment;
