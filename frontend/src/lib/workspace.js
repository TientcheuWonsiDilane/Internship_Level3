export const idOf = (value) => {
  if (!value) return "";
  if (typeof value === "object") return String(value._id || value.id || "");
  return String(value);
};

export const asList = (res, ...keys) => {
  if (Array.isArray(res)) return res;
  for (const key of keys) {
    if (Array.isArray(res?.[key])) return res[key];
  }
  if (Array.isArray(res?.message)) return res.message;
  return [];
};

export const asItem = (res, ...keys) => {
  for (const key of keys) {
    const value = res?.[key];
    if (value && typeof value === "object" && !Array.isArray(value)) return value;
  }
  if (res?.message && typeof res.message === "object" && !Array.isArray(res.message)) {
    return res.message;
  }
  return res && typeof res === "object" ? res : null;
};

export const initialsOf = (name) =>
  String(name || "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "U";

export const roleLabel = (role) => {
  if (role === "team_head") return "Team Head";
  if (role === "developer") return "Developer";
  return role ? String(role).replace(/_/g, " ") : "Member";
};

export const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const formatDateTime = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

export const statusLabel = (status) =>
  String(status || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase()) || "—";

export const notificationCopy = (item) => {
  const p = item?.payload || {};
  switch (item?.type) {
    case "task_assigned":
      return p.taskTitle ? `You were assigned “${p.taskTitle}”.` : "A task was assigned to you.";
    case "mentioned":
      return p.taskTitle
        ? `You were mentioned on “${p.taskTitle}”.`
        : "You were mentioned in a comment.";
    case "pr_merged":
      return p.title ? `Pull request merged: ${p.title}` : "A linked pull request was merged.";
    case "comment_reply":
      return p.taskTitle ? `New comment on “${p.taskTitle}”.` : "Someone replied to a comment.";
    case "invitation_accepted":
      return p.teamName
        ? `${p.username || "Someone"} accepted an invite to ${p.teamName}.`
        : "An invitation was accepted.";
    case "task_review_submitted":
      return p.taskTitle
        ? `“${p.taskTitle}” was submitted for review.`
        : "A task was submitted for review.";
    default:
      return p.excerpt || p.message || item?.type || "Notification";
  }
};
