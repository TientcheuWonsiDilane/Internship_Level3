import React from "react";
import { Link } from "react-router-dom";
import { FolderGit2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import PageShell from "../components/PageShell";
import api from "../lib/api";
import { asItem, formatDate } from "../lib/workspace";

const Repositories = () => {
  const { projects, setCurrentProject } = useAuth();
  const [repos, setRepos] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      const found = [];
      for (const project of projects) {
        try {
          const res = await api.get(`/repositories/project/${project._id}`);
          const repo = asItem(res, "repository");
          if (repo?._id) found.push({ ...repo, project });
        } catch {
          // No repo connected to this project.
        }
      }
      if (mounted) {
        setRepos(found);
        setLoading(false);
      }
    };
    if (projects.length) load();
    else {
      setRepos([]);
      setLoading(false);
    }
    return () => {
      mounted = false;
    };
  }, [projects]);

  return (
    <PageShell
      title="Repositories"
      subtitle="GitHub repositories connected to this team's projects">
      {loading ? (
        <div className="text-sm text-white/45">Loading…</div>
      ) : (
        <div className="space-y-3">
          {repos.map((repo) => (
            <Link
              key={repo._id}
              to={`/repositories/${repo._id}`}
              onClick={() => setCurrentProject(repo.project)}
              className="flex items-start gap-4 rounded-xl border border-white/8 bg-white/[0.03] p-4 hover:bg-white/5">
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                <FolderGit2 className="w-5 h-5 text-white/70" />
              </div>
              <div className="min-w-0">
                <div className="font-medium truncate">{repo.fullName}</div>
                <div className="text-sm text-white/40">
                  {repo.project?.name} · last synced {formatDate(repo.lastSyncedAt)}
                </div>
              </div>
            </Link>
          ))}
          {repos.length === 0 && (
            <div className="rounded-xl border border-white/8 bg-white/[0.03] p-6 text-sm text-white/45">
              No repositories connected yet. Team heads can link one from GitHub Sync.
            </div>
          )}
        </div>
      )}
    </PageShell>
  );
};

export default Repositories;
