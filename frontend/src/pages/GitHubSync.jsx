import React from "react";
import { useAuth } from "../context/AuthContext";
import PageShell from "../components/PageShell";
import api from "../lib/api";
import { asItem, formatDate } from "../lib/workspace";

const GitHubSync = () => {
  const { currentProject, isTeamHead } = useAuth();
  const [repo, setRepo] = React.useState(null);
  const [fullName, setFullName] = React.useState("");
  const [repoId, setRepoId] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const load = React.useCallback(async () => {
    if (!currentProject?._id) {
      setRepo(null);
      return;
    }
    try {
      const res = await api.get(`/repositories/project/${currentProject._id}`);
      setRepo(asItem(res, "repository"));
      setError("");
    } catch {
      setRepo(null);
    }
  }, [currentProject?._id]);

  React.useEffect(() => {
    load();
  }, [load]);

  const connect = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      await api.post("/repositories/connect", {
        fullName,
        repoId: Number(repoId),
        description,
        projectId: currentProject._id,
      });
      setMessage("Repository connected.");
      setFullName("");
      setRepoId("");
      setDescription("");
      await load();
    } catch (err) {
      setError(err.body?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const sync = async () => {
    setLoading(true);
    try {
      await api.post(`/github/repositories/${repo._id}/sync`);
      setMessage("Repository synced from GitHub.");
      await load();
    } catch (err) {
      setError(err.body?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell
      title="GitHub Sync"
      subtitle="Connect a GitHub repository to this project, then pull branches, pull requests, and commits into Matrix.">
      {!currentProject && (
        <p className="text-sm text-white/45">Select a project from the sidebar first.</p>
      )}
      {currentProject && repo && (
        <div className="rounded-xl border border-white/8 bg-white/[0.03] p-5 mb-6">
          <div className="font-medium">{repo.fullName}</div>
          <div className="text-sm text-white/40 mt-1">
            Last synced {formatDate(repo.lastSyncedAt)}
          </div>
          {isTeamHead() && (
            <button
              type="button"
              onClick={sync}
              disabled={loading}
              className="mt-4 px-4 py-2 rounded-lg bg-white text-black text-sm font-semibold">
              Sync now
            </button>
          )}
        </div>
      )}
      {currentProject && !repo && isTeamHead() && (
        <form
          onSubmit={connect}
          className="rounded-xl border border-white/8 bg-white/[0.03] p-5 space-y-4 max-w-lg">
          <p className="text-sm text-white/50">
            Link a repository that already exists on GitHub by name and numeric ID.
          </p>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="owner/repo"
            className="w-full px-4 py-2.5 rounded-xl bg-[#0b0b0d] border border-white/10 outline-none"
            required
          />
          <input
            value={repoId}
            onChange={(e) => setRepoId(e.target.value)}
            placeholder="GitHub repository ID"
            className="w-full px-4 py-2.5 rounded-xl bg-[#0b0b0d] border border-white/10 outline-none"
            required
          />
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            className="w-full px-4 py-2.5 rounded-xl bg-[#0b0b0d] border border-white/10 outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-white text-black text-sm font-semibold">
            Connect repository
          </button>
        </form>
      )}
      {currentProject && !repo && !isTeamHead() && (
        <p className="text-sm text-white/45">No repository is connected to this project yet.</p>
      )}
      {message && <p className="mt-4 text-sm text-emerald-400">{message}</p>}
      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
    </PageShell>
  );
};

export default GitHubSync;
