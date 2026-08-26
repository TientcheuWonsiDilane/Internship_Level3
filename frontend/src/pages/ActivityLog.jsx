import React from "react";
import { useAuth } from "../context/AuthContext";
import PageShell from "../components/PageShell";
import UserAvatar from "../components/UserAvatar";
import api from "../lib/api";
import { asList, formatDateTime, statusLabel } from "../lib/workspace";

const ActivityLog = () => {
  const { currentTeam, projects } = useAuth();
  const [rows, setRows] = React.useState([]);
  const [projectId, setProjectId] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  const load = React.useCallback(async () => {
    if (!currentTeam) {
      setRows([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    const qs = projectId ? `?projectId=${projectId}` : "";
    try {
      const res = await api.get(`/teams/${currentTeam}/activity${qs}`);
      setRows(asList(res, "activity"));
    } catch (err) {
      setError(err.body?.message || err.message || "Could not load activity");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [currentTeam, projectId]);

  React.useEffect(() => {
    load();
  }, [load]);

  return (
    <PageShell
      title="Activity Log"
      subtitle="Immutable feed of team and project actions, newest first">
      {error && (
        <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </div>
      )}
      <div className="mb-6">
        <select
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          className="px-3 py-2 rounded-lg bg-[#0b0b0d] border border-white/10 text-sm outline-none">
          <option value="">All projects</option>
          {projects.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>
      {loading ? (
        <div className="text-sm text-white/45">Loading…</div>
      ) : (
        <div className="space-y-2">
          {rows.map((row) => (
            <div
              key={row._id}
              className="rounded-xl border border-white/8 bg-white/[0.03] p-4 text-sm flex items-start gap-3">
              <UserAvatar
                name={row.actorId?.username}
                src={row.actorId?.avatarUrl}
                size="sm"
              />
              <div className="min-w-0">
                <div className="font-medium">
                  {row.actorId?.username || "System"}{" "}
                  <span className="text-white/50 font-normal">{row.action}</span>
                </div>
                <div className="text-white/40 mt-1">
                  {row.target?.type ? `${row.target.type} · ` : ""}
                  {row.metadata?.taskTitle ||
                    row.metadata?.fullName ||
                    statusLabel(row.metadata?.status) ||
                    ""}{" "}
                  · {formatDateTime(row.createdAt)}
                </div>
              </div>
            </div>
          ))}
          {rows.length === 0 && (
            <p className="text-sm text-white/40">No activity recorded yet.</p>
          )}
        </div>
      )}
    </PageShell>
  );
};

export default ActivityLog;
