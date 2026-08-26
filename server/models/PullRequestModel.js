import mongoose from "mongoose";

const pullRequestSchema = new mongoose.Schema(
  {
    repositoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Repository",
      required: true,
    },
    prId: { type: Number, required: true }, // GitHub's global PR id
    number: { type: Number, required: true }, // Repo-scoped PR number
    title: { type: String, default: "" },
    state: {
      type: String,
      enum: ["open", "closed"],
      default: "open",
    },
    merged: { type: Boolean, default: false },
    mergedAt: { type: Date, default: null },
    closedAt: { type: Date, default: null },
    htmlUrl: { type: String, default: "" },
    authorLogin: { type: String, default: "" },
    authorAvatarUrl: { type: String, default: "" },
    headRef: { type: String, default: "" },
    baseRef: { type: String, default: "" },
    draft: { type: Boolean, default: false },
    // Tasks auto-resolved from "Fixes <taskId>" style references.
    linkedTasks: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Task", default: [] },
    ],
  },
  { timestamps: true },
);

// One cached document per (repository, PR number).
pullRequestSchema.index({ repositoryId: 1, number: 1 }, { unique: true });
// Project-level PR feeds sort by recency.
pullRequestSchema.index({ repositoryId: 1, updatedAt: -1 });

const PullRequest = mongoose.model("PullRequest", pullRequestSchema);
export default PullRequest;
