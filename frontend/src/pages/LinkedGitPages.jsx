import React from "react";
import { GitBranch, GitCommitHorizontal, GitPullRequest } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import PageShell from "../components/PageShell";
import api from "../lib/api";
import { asItem, asList, formatDateTime } from "../lib/workspace";

const useConnectedRepo = (project) => {
  const [repo, setRepo] = React.useState(null);

  React.useEffect(() => {
    let mounted = true;
    if (!project?._id) {
      setRepo(null);
      return undefined;
    }
    api
      .get(`/repositories/project/${project._id}`)
      .then((res) => {
        if (mounted) setRepo(asItem(res, "repository"));
      })
      .catch(() => mounted && setRepo(null));
    return () => {
      mounted = false;
    };
  }, [project?._id]);

  return repo;
};

export const PullRequests = () => {
  const { currentProject } = useAuth();
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!currentProject?._id) {
        setRows([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await api.get(`/projects/${currentProject._id}/pull-requests`);
        if (mounted) {
          setRows(asList(res, "pullRequests"));
          setError("");
        }
      } catch (err) {
        if (mounted) {
          setError(err.body?.message || err.message);
          setRows([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [currentProject?._id]);

  return (
    <PageShell
      title="Pull Requests"
      subtitle={
        currentProject
          ? `Cached PRs for ${currentProject.name}. Sync from GitHub Sync to refresh.`
          : "Select a project first"
      }>
      {error && <p className="text-sm text-red-400 mb-4">{error}</p>}
      {loading ? (
        <div className="text-sm text-white/45">Loading…</div>
      ) : (
        <div className="space-y-3">
          {rows.map((pr) => (
            <a
              key={pr._id}
              href={pr.htmlUrl || undefined}
              target={pr.htmlUrl ? "_blank" : undefined}
              rel="noreferrer"
              className="rounded-xl border border-white/8 bg-white/[0.03] p-4 flex items-start gap-3 hover:bg-white/5">
              <GitPullRequest className="w-4 h-4 mt-1 text-white/50" />
              <div className="min-w-0">
                <div className="font-medium">
                  #{pr.number} {pr.title}
                </div>
                <div className="text-sm text-white/40 mt-1">
                  {pr.state}
                  {pr.merged ? " · merged" : ""} · {pr.authorLogin || "unknown"} ·{" "}
                  {pr.headRef} → {pr.baseRef}
                </div>
                {pr.linkedTasks?.length > 0 && (
                  <div className="text-xs text-white/45 mt-1">
                    Linked: {pr.linkedTasks.map((t) => t.title || t._id).join(", ")}
                  </div>
                )}
              </div>
            </a>
          ))}
          {rows.length === 0 && (
            <div className="rounded-xl border border-white/8 bg-white/[0.03] p-6 text-sm text-white/45">
              No pull requests cached for this project yet. Connect a repository and run GitHub Sync.
            </div>
          )}
        </div>
      )}
    </PageShell>
  );
};

export const Branches = () => {
  const { currentProject } = useAuth();
  const repo = useConnectedRepo(currentProject);
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!repo?._id) {
        setRows([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await api.get(`/repositories/${repo._id}/branches`);
        if (mounted) {
          setRows(asList(res, "branches"));
          setError("");
        }
      } catch (err) {
        if (mounted) {
          setError(err.body?.message || err.message);
          setRows([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [repo?._id]);

  return (
    <PageShell
      title="Branches"
      subtitle={
        repo
          ? `Branches cached for ${repo.fullName}`
          : "Connect a repository to see branches"
      }>
      {error && <p className="text-sm text-red-400 mb-4">{error}</p>}
      {loading ? (
        <div className="text-sm text-white/45">Loading…</div>
      ) : (
        <div className="space-y-3">
          {rows.map((branch) => (
            <div
              key={branch._id || branch.name}
              className="rounded-xl border border-white/8 bg-white/[0.03] p-4 flex items-start gap-3">
              <GitBranch className="w-4 h-4 mt-1 text-white/50" />
              <div>
                <div className="font-medium">{branch.name}</div>
                <div className="text-sm text-white/40">
                  {branch.lastCommitAuthor || "—"} · {branch.lastCommitMessage || "No commit"} ·{" "}
                  {formatDateTime(branch.lastCommitDate)}
                </div>
              </div>
            </div>
          ))}
          {rows.length === 0 && (
            <div className="rounded-xl border border-white/8 bg-white/[0.03] p-6 text-sm text-white/45">
              No branches cached yet. Run GitHub Sync from the current project.
            </div>
          )}
        </div>
      )}
    </PageShell>
  );
};

export const Commits = () => {
  const { currentProject } = useAuth();
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!currentProject?._id) {
        setRows([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await api.get(`/projects/${currentProject._id}/commits`);
        if (mounted) {
          setRows(asList(res, "commits"));
          setError("");
        }
      } catch (err) {
        if (mounted) {
          setError(err.body?.message || err.message);
          setRows([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [currentProject?._id]);

  return (
    <PageShell
      title="Commits"
      subtitle={
        currentProject
          ? `Commit feed for ${currentProject.name}`
          : "Select a project first"
      }>
      {error && <p className="text-sm text-red-400 mb-4">{error}</p>}
      {loading ? (
        <div className="text-sm text-white/45">Loading…</div>
      ) : (
        <div className="space-y-3">
          {rows.map((commit) => (
            <a
              key={commit._id || commit.sha}
              href={commit.htmlUrl || undefined}
              target={commit.htmlUrl ? "_blank" : undefined}
              rel="noreferrer"
              className="rounded-xl border border-white/8 bg-white/[0.03] p-4 flex items-start gap-3 hover:bg-white/5">
              <GitCommitHorizontal className="w-4 h-4 mt-1 text-white/50" />
              <div className="min-w-0">
                <div className="font-medium truncate">{commit.message || commit.sha}</div>
                <div className="text-sm text-white/40">
                  {commit.authorName || "—"} · {commit.repositoryFullName} ·{" "}
                  {String(commit.sha || "").slice(0, 7)} · {formatDateTime(commit.committedAt)}
                </div>
              </div>
            </a>
          ))}
          {rows.length === 0 && (
            <div className="rounded-xl border border-white/8 bg-white/[0.03] p-6 text-sm text-white/45">
              No commits cached yet. Connect a repository and run GitHub Sync.
            </div>
          )}
        </div>
      )}
    </PageShell>
  );
};

export default PullRequests;
