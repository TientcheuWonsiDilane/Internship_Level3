import mongoose from "mongoose";

const commitSchema = new mongoose.Schema(
  {
    repositoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Repository",
      required: true,
    },
    sha: { type: String, required: true, trim: true },
    message: { type: String, default: "" },
    authorName: { type: String, default: "" },
    authorEmail: { type: String, default: "" },
    committedAt: { type: Date, default: null },
    htmlUrl: { type: String, default: "" },
  },
  { timestamps: true },
);

// One cached document per (repository, commit sha) — webhook deliveries can
// repeat, so idempotent upserts rely on this uniqueness.
commitSchema.index({ repositoryId: 1, sha: 1 }, { unique: true });
// Chronological commit feed per repository.
commitSchema.index({ repositoryId: 1, committedAt: -1 });

const Commit = mongoose.model("Commit", commitSchema);
export default Commit;
