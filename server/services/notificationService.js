import Notification from "../models/NotificationModel.js";
import User from "../models/UserModel.js";
import { emitToUser } from "./socketService.js";
import { sendMail } from "./emailService.js";

/**
 * Central Notification Service: every domain event that concerns a specific
 * user funnels through here. It persists the notification, delivers it
 * instantly over the recipient's socket (`notification:new`), and dispatches
 * an email when the event is flagged high-priority.
 */
export async function createNotification({
  userId,
  type,
  payload = {},
  email = false,
  emailSubject = null,
}) {
  if (!userId) return null;

  const notification = await Notification.create({
    userId,
    type,
    payload,
    isRead: false,
  });

  emitToUser(userId, "notification:new", {
    id: notification._id,
    type: notification.type,
    payload: notification.payload,
    isRead: false,
    createdAt: notification.createdAt,
  });

  if (email) {
    const user = await User.findById(userId).select("email username").lean();
    if (user?.email) {
      const subject = emailSubject || `[Matrix] ${type.replace(/_/g, " ")} update`;
      sendMail({
        to: user.email,
        subject,
        text: JSON.stringify(payload),
        html: `<p>${subject}</p><pre>${JSON.stringify(payload, null, 2)}</pre>`,
      });
    }
  }

  return notification;
}

export default { createNotification };
