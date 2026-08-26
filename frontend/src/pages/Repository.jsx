import React from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PageShell from "../components/PageShell";
import api from "../lib/api";
import { asItem, formatDate } from "../lib/workspace";

const Repository = () => {
  const { id } = useParams();
  const { projects } = useAuth();
  const [repo, setRepo] = React.useState(null);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    let mounted = true;
    const load = async () => {
      for (const project of projects) {
        try {
          const res = await api.get(`/repositories/project/${project._id}`);
          const item = asItem(res, "repository");
          if (item && String(item._id) === String(id)) {
            if (mounted) setRepo({ ...item, project });
            return;
          }
        } catch {
          // Project has no connected repository.
        }
      }
      if (mounted) setError("Repository not found for this team.");
    };
    if (projects.length) load();
    return () => {
      mounted = false;
    };
  }, [id, projects]);

  return (
    <PageShell
      title={repo?.fullName || "Repository"}
      subtitle={repo?.description || repo?.project?.name}>
      {error && !repo && <p className="text-sm text-red-400">{error}</p>}
      {repo && (
        <div className="rounded-xl border border-white/8 bg-white/[0.03] p-5 space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-white/40">Project</span>
            <span>{repo.project?.name}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-white/40">GitHub ID</span>
            <span>{repo.repoId}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-white/40">Last synced</span>
            <span>{formatDate(repo.lastSyncedAt)}</span>
          </div>
          <a
            href={`https://github.com/${repo.fullName}`}
            target="_blank"
            rel="noreferrer"
            className="inline-block mt-2 text-sm text-white underline underline-offset-4">
            Open on GitHub
          </a>
        </div>
      )}
    </PageShell>
  );
};

export default Repository;
