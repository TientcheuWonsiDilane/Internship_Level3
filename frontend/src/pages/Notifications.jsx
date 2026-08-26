import React from "react";
import { Link } from "react-router-dom";
import PageShell from "../components/PageShell";
import api from "../lib/api";
import { asList, formatDateTime, notificationCopy } from "../lib/workspace";

const Notifications = () => {
  const [items, setItems] = React.useState([]);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  const load = React.useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/notifications");
      setItems(asList(res, "notifications"));
      setUnreadCount(res.unreadCount || 0);
    } catch (err) {
      setError(err.body?.message || err.message || "Could not load notifications");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const markRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setItems((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)),
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      setError(err.body?.message || err.message);
    }
  };

  const markAll = async () => {
    try {
      await api.post("/notifications/read-all", {});
      setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      setError(err.body?.message || err.message);
    }
  };

  const linkFor = (item) => {
    const p = item.payload || {};
    if (p.taskId && p.projectSlug) return `/projects/${p.projectSlug}/tasks/${p.taskId}`;
    if (p.taskId) return "/tasks/mine";
    return null;
  };

  return (
    <PageShell
      title="Notifications"
      subtitle={
        unreadCount
          ? `${unreadCount} unread`
          : "Mentions, assignments, and repository events"
      }
      actions={
        unreadCount > 0 ? (
          <button
            type="button"
            onClick={markAll}
            className="px-4 py-2 rounded-lg border border-white/15 text-sm hover:bg-white/5">
            Mark all read
          </button>
        ) : null
      }>
      {error && (
        <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </div>
      )}
      {loading ? (
        <div className="text-sm text-white/45">Loading…</div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => {
            const to = linkFor(item);
            const inner = (
              <>
                <div className="text-sm">{notificationCopy(item)}</div>
                <div className="text-xs text-white/40 mt-1">
                  {item.type?.replace(/_/g, " ")} · {formatDateTime(item.createdAt)}
                </div>
              </>
            );
            return (
              <div
                key={item._id}
                className={`rounded-xl border border-white/8 p-4 flex items-start justify-between gap-3 ${
                  item.isRead ? "bg-white/[0.02]" : "bg-white/[0.06]"
                }`}>
                <div className="min-w-0">
                  {to ? (
                    <Link to={to} onClick={() => !item.isRead && markRead(item._id)}>
                      {inner}
                    </Link>
                  ) : (
                    inner
                  )}
                </div>
                {!item.isRead && (
                  <button
                    type="button"
                    onClick={() => markRead(item._id)}
                    className="text-xs text-white/50 hover:text-white shrink-0">
                    Mark read
                  </button>
                )}
              </div>
            );
          })}
          {items.length === 0 && (
            <p className="text-sm text-white/40">No notifications right now.</p>
          )}
        </div>
      )}
    </PageShell>
  );
};

export default Notifications;
