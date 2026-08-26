import mongoose from "mongoose";

const branchSchema = new mongoose.Schema(
  {
    repositoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Repository",
      required: true,
    },
    name: { type: String, required: true, trim: true },
    lastCommitSha: { type: String, default: "" },
    lastCommitMessage: { type: String, default: "" },
    lastCommitAuthor: { type: String, default: "" },
    lastCommitDate: { type: Date, default: null },
    isProtected: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// One cached document per (repository, branch name).
branchSchema.index({ repositoryId: 1, name: 1 }, { unique: true });

const Branch = mongoose.model("Branch", branchSchema);
export default Branch;
