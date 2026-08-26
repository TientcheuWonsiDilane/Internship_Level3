import React from "react";
import { useAuth } from "../context/AuthContext";
import PageShell from "../components/PageShell";
import api from "../lib/api";
import { asItem, formatDate } from "../lib/workspace";

const RepositorySettings = () => {
  const { currentProject } = useAuth();
  const [repo, setRepo] = React.useState(null);
  const [message, setMessage] = React.useState("");

  const load = React.useCallback(async () => {
    if (!currentProject?._id) {
      setRepo(null);
      return;
    }
    try {
      const res = await api.get(`/repositories/project/${currentProject._id}`);
      setRepo(asItem(res, "repository"));
    } catch {
      setRepo(null);
    }
  }, [currentProject?._id]);

  React.useEffect(() => {
    load();
  }, [load]);

  const disconnect = async () => {
    if (!repo?._id) return;
    try {
      await api.del(`/repositories/disconnect/${repo._id}`);
      setMessage("Repository disconnected.");
      await load();
    } catch (err) {
      setMessage(err.body?.message || err.message);
    }
  };

  return (
    <PageShell
      title="Repository Settings"
      subtitle={
        currentProject
          ? `Connection settings for ${currentProject.name}`
          : "Select a project first"
      }>
      {!repo && (
        <p className="text-sm text-white/45">
          No repository is connected to this project. Use GitHub Sync to link one.
        </p>
      )}
      {repo && (
        <div className="rounded-xl border border-white/8 bg-white/[0.03] p-5 max-w-lg space-y-3">
          <div className="font-medium">{repo.fullName}</div>
          <div className="text-sm text-white/40">
            Last synced {formatDate(repo.lastSyncedAt)}
          </div>
          <button
            type="button"
            onClick={disconnect}
            className="px-4 py-2 rounded-lg border border-red-500/40 text-red-400 text-sm hover:bg-red-500/10">
            Disconnect repository
          </button>
        </div>
      )}
      {message && <p className="mt-4 text-sm text-white/60">{message}</p>}
    </PageShell>
  );
};

export default RepositorySettings;
