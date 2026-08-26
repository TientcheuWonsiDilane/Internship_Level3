import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "task_assigned",
        "mentioned",
        "pr_merged",
        "comment_reply",
        "invitation_accepted",
        "task_review_submitted",
      ],
      default: "task_assigned",
    },
    // Denormalised data needed to render the notification without a follow-up query.
    payload: { type: mongoose.Schema.Types.Mixed, default: {} },
    isRead: { type: Boolean, default: false },
    // TTL index prunes this document once it expires (used for old, read notifications).
    expiresAt: { type: Date, default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
  },
  { timestamps: true },
);

// Prune old notifications automatically once they pass their expiry.
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
// Fast listing for a recipient, newest first.
notificationSchema.index({ userId: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
