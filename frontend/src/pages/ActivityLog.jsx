import React from "react";
import { useAuth } from "../context/AuthContext";
import PageShell from "../components/PageShell";
import api from "../lib/api";
import { asList, formatDate } from "../lib/workspace";

const ActivityLog = () => {
  const { projects } = useAuth();
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    const load = async () => {
      const found = [];
      for (const project of projects) {
        try {
          const res = await api.get(`/tasks/project/${project._id}`);
          asList(res, "tasks").forEach((t) => found.push({ ...t, project }));
        } catch {
          // skip
        }
      }
      found.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      if (mounted) {
        setRows(found);
        setLoading(false);
      }
    };
    if (projects.length) load();
    else setLoading(false);
    return () => {
      mounted = false;
    };
  }, [projects]);

  return (
    <PageShell
      title="Activity Log"
      subtitle="Task changes across this team's projects. Live push updates are a later-level feature.">
      {loading ? (
        <div className="text-sm text-white/45">Loading…</div>
      ) : (
        <div className="space-y-2">
          {rows.map((row) => (
            <div
              key={row._id}
              className="rounded-xl border border-white/8 bg-white/[0.03] p-4 text-sm">
              <div className="font-medium">{row.title}</div>
              <div className="text-white/40 mt-1">
                {row.project?.name} · {String(row.status || "").replace("_", " ")} ·{" "}
                {formatDate(row.updatedAt)}
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
