import React from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PageShell from "../components/PageShell";
import UserAvatar from "../components/UserAvatar";
import { useModal } from "../context/ModalContext";
import AssignTaskModal from "../components/modals/AssignTaskModal";
import api from "../lib/api";
import { asItem, asList, formatDate, formatDateTime, statusLabel } from "../lib/workspace";

const TaskDetail = () => {
  const { slug, taskId } = useParams();
  const { projects, currentProject, setCurrentProject, isTeamHead } = useAuth();
  const { showModal } = useModal();
  const [task, setTask] = React.useState(null);
  const [comments, setComments] = React.useState([]);
  const [body, setBody] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [sending, setSending] = React.useState(false);

  const project =
    projects.find((p) => p.slug === slug || p._id === slug) || currentProject;

  React.useEffect(() => {
    if (project) setCurrentProject(project);
  }, [project?._id, setCurrentProject]);

  const load = React.useCallback(async () => {
    if (!taskId) return;
    setLoading(true);
    setError("");
    try {
      let found = null;
      const searchProjects = project ? [project, ...projects] : projects;
      const seen = new Set();
      for (const p of searchProjects) {
        if (!p?._id || seen.has(p._id)) continue;
        seen.add(p._id);
        const res = await api.get(`/tasks/project/${p._id}`).catch(() => null);
        found = asList(res, "tasks").find((t) => String(t._id) === String(taskId));
        if (found) {
          found = { ...found, project: p };
          break;
        }
      }
      setTask(found);
      const commentRes = await api.get(`/tasks/${taskId}/comments`);
      setComments(asList(commentRes, "comments"));
    } catch (err) {
      setError(err.body?.message || err.message || "Could not load task");
    } finally {
      setLoading(false);
    }
  }, [taskId, project?._id, projects]);

  React.useEffect(() => {
    load();
  }, [load]);

  const postComment = async (e) => {
    e.preventDefault();
    if (!body.trim()) return;
    setSending(true);
    setError("");
    try {
      const res = await api.post(`/tasks/${taskId}/comments`, { body: body.trim() });
      const created = asItem(res, "comment");
      if (created) setComments((prev) => [...prev, created]);
      setBody("");
    } catch (err) {
      setError(err.body?.message || err.message || "Could not post comment");
    } finally {
      setSending(false);
    }
  };

  return (
    <PageShell
      title={task?.title || "Task"}
      subtitle={task?.project?.name || project?.name || "Task detail"}
      actions={
        <Link
          to={project?.slug ? `/projects/${project.slug}` : "/projects"}
          className="px-4 py-2 rounded-lg border border-white/15 text-sm hover:bg-white/5">
          Back to board
        </Link>
      }>
      {error && (
        <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </div>
      )}
      {loading ? (
        <div className="text-sm text-white/45">Loading…</div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-xl border border-white/8 bg-white/[0.03] p-5">
              <p className="text-sm text-white/60 whitespace-pre-wrap">
                {task?.description || "No description."}
              </p>
            </div>
            <div className="rounded-xl border border-white/8 bg-white/[0.03] p-5">
              <h2 className="text-sm font-medium text-white/70 mb-4">Comments</h2>
              <div className="space-y-3 mb-4">
                {comments.map((c) => (
                  <div key={c._id} className="flex gap-3">
                    <UserAvatar
                      name={c.authorId?.username}
                      src={c.authorId?.avatarUrl}
                      size="sm"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs text-white/40">
                        {c.authorId?.username || "Member"} · {formatDateTime(c.createdAt)}
                      </div>
                      <p className="text-sm mt-1 whitespace-pre-wrap">{c.body}</p>
                    </div>
                  </div>
                ))}
                {comments.length === 0 && (
                  <p className="text-sm text-white/40">No comments yet. Use @username to mention someone.</p>
                )}
              </div>
              <form onSubmit={postComment} className="space-y-2">
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={3}
                  placeholder="Write a comment…"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0b0b0d] border border-white/10 outline-none resize-none"
                />
                <button
                  type="submit"
                  disabled={sending || !body.trim()}
                  className="px-4 py-2 rounded-lg bg-white text-black text-sm font-semibold disabled:opacity-40">
                  {sending ? "Posting…" : "Post comment"}
                </button>
              </form>
            </div>
          </div>
          <aside className="space-y-3 text-sm">
            <div className="rounded-xl border border-white/8 bg-white/[0.03] p-4 space-y-2">
              <Row label="Status" value={statusLabel(task?.status)} />
              <Row label="Priority" value={task?.priority} />
              <Row label="Due" value={formatDate(task?.dueDate)} />
              <Row
                label="Assignee"
                value={task?.assignedTo?.username || "Unassigned"}
              />
                {isTeamHead() && (
                  <div className="mt-3">
                    <button
                      onClick={() => showModal(AssignTaskModal, { taskId: task._id })}
                      className="w-full px-3 py-2 rounded-lg bg-white text-black text-sm font-semibold">
                      Assign task
                    </button>
                  </div>
                )}
              <Row label="Branch" value={task?.linkedBranch || "—"} />
              <Row label="Pull request" value={task?.linkedPullRequest || "—"} />
            </div>
          </aside>
        </div>
      )}
    </PageShell>
  );
};

const Row = ({ label, value }) => (
  <div className="flex justify-between gap-3">
    <span className="text-white/40">{label}</span>
    <span className="text-right capitalize">{value || "—"}</span>
  </div>
);

export default TaskDetail;
