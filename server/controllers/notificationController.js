import Notification from "../models/NotificationModel.js";

export const listNotifications = async (req, res) => {
  const userId = req.user.id;

  try {
    const limit = Math.min(Number(req.query.limit) || 50, 100);
    const [notifications, unreadCount] = await Promise.all([
      Notification.find({ userId }).sort({ createdAt: -1 }).limit(limit).lean(),
      Notification.countDocuments({ userId, isRead: false }),
    ]);

    return res.status(200).json({ success: true, notifications, unreadCount });
  } catch (error) {
    console.error("List Notifications Error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error while fetching notifications" });
  }
};

export const markNotificationRead = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    // Only the recipient may update their own notification.
    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId },
      { isRead: true },
      { new: true },
    );
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    return res.status(200).json({ success: true, notification });
  } catch (error) {
    console.error("Mark Notification Read Error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error while updating notification" });
  }
};

export const markAllNotificationsRead = async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true },
    );

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read",
      updated: result.modifiedCount,
    });
  } catch (error) {
    console.error("Mark All Notifications Read Error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error while updating notifications" });
  }
};

export default { listNotifications, markNotificationRead, markAllNotificationsRead };
