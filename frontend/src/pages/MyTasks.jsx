import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PageShell from "../components/PageShell";
import api from "../lib/api";
import { asList, formatDate, statusLabel } from "../lib/workspace";

const MyTasks = () => {
  const { projects, currentProject } = useAuth();
  const [tasks, setTasks] = React.useState([]);
  const [status, setStatus] = React.useState("");
  const [priority, setPriority] = React.useState("");
  const [projectId, setProjectId] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  const load = React.useCallback(async () => {
    setLoading(true);
    setError("");
    const params = new URLSearchParams({ assignee: "me" });
    if (status) params.set("status", status);
    if (priority) params.set("priority", priority);
    if (projectId) params.set("projectId", projectId);
    try {
      const res = await api.get(`/tasks?${params.toString()}`);
      setTasks(asList(res, "tasks"));
    } catch (err) {
      setError(err.body?.message || err.message || "Could not load your tasks");
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [status, priority, projectId]);

  React.useEffect(() => {
    load();
  }, [load]);

  return (
    <PageShell
      title="My Tasks"
      subtitle="Every task assigned to you across teams and projects">
      {error && (
        <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </div>
      )}
      <div className="flex flex-wrap gap-2 mb-6">
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
          {currentProject &&
            !projects.some((p) => p._id === currentProject._id) && (
              <option value={currentProject._id}>{currentProject.name}</option>
            )}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-3 py-2 rounded-lg bg-[#0b0b0d] border border-white/10 text-sm outline-none">
          <option value="">Any status</option>
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="in_review">In Review</option>
          <option value="done">Done</option>
        </select>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="px-3 py-2 rounded-lg bg-[#0b0b0d] border border-white/10 text-sm outline-none">
          <option value="">Any priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>

      {loading ? (
        <div className="text-sm text-white/45">Loading…</div>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => {
            const project = task.projectId;
            const slug = project?.slug || project?._id;
            return (
              <Link
                key={task._id}
                to={slug ? `/projects/${slug}/tasks/${task._id}` : "/projects"}
                className="block rounded-xl border border-white/8 bg-white/[0.03] p-4 hover:bg-white/5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-medium">{task.title}</div>
                    <div className="text-xs text-white/40 mt-1">
                      {project?.name || "Project"} · {statusLabel(task.status)} · due{" "}
                      {formatDate(task.dueDate)}
                    </div>
                  </div>
                  <span className="text-[11px] uppercase text-white/45">
                    {task.priority}
                  </span>
                </div>
              </Link>
            );
          })}
          {tasks.length === 0 && (
            <p className="text-sm text-white/40">No assigned tasks match these filters.</p>
          )}
        </div>
      )}
    </PageShell>
  );
};

export default MyTasks;
