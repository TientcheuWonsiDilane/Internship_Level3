import React from "react";
import { GitPullRequest } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import PageShell from "../components/PageShell";
import api from "../lib/api";
import { asList } from "../lib/workspace";

const LinkedWorkList = ({ title, subtitle, field, empty }) => {
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
          asList(res, "tasks")
            .filter((t) => t[field])
            .forEach((t) => found.push({ ...t, project }));
        } catch {
          // Ignore projects without tasks.
        }
      }
      if (mounted) {
        setRows(found);
        setLoading(false);
      }
    };
    if (projects.length) load();
    else {
      setRows([]);
      setLoading(false);
    }
    return () => {
      mounted = false;
    };
  }, [projects, field]);

  return (
    <PageShell title={title} subtitle={subtitle}>
      {loading ? (
        <div className="text-sm text-white/45">Loading…</div>
      ) : (
        <div className="space-y-3">
          {rows.map((row) => (
            <div
              key={row._id}
              className="rounded-xl border border-white/8 bg-white/[0.03] p-4 flex items-start gap-3">
              <GitPullRequest className="w-4 h-4 mt-1 text-white/50" />
              <div>
                <div className="font-medium">{row[field]}</div>
                <div className="text-sm text-white/40">
                  {row.title} · {row.project?.name}
                </div>
              </div>
            </div>
          ))}
          {rows.length === 0 && (
            <div className="rounded-xl border border-white/8 bg-white/[0.03] p-6 text-sm text-white/45">
              {empty}
            </div>
          )}
        </div>
      )}
    </PageShell>
  );
};

export const PullRequests = () => (
  <LinkedWorkList
    title="Pull Requests"
    subtitle="PRs linked to tasks in this team. Automatic GitHub PR creation is not part of this level."
    field="linkedPullRequest"
    empty="No pull requests are linked to tasks yet."
  />
);

export const Branches = () => (
  <LinkedWorkList
    title="Branches"
    subtitle="Branches recorded on tasks when work is claimed."
    field="linkedBranch"
    empty="No branches linked yet. Claiming a task records a branch name."
  />
);

export const Commits = () => (
  <LinkedWorkList
    title="Commits"
    subtitle="Commit SHAs linked to tasks."
    field="linkedCommit"
    empty="No commits linked to tasks yet."
  />
);

export default PullRequests;
