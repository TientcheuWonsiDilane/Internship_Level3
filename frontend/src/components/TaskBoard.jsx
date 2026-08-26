import React from "react";
import { GitBranch, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { asList, formatDate, idOf } from "../lib/workspace";
import UserAvatar from "./UserAvatar";

const COLUMNS = [
  { id: "todo", label: "To Do" },
  { id: "in_progress", label: "In Progress" },
  { id: "in_review", label: "In Review" },
  { id: "done", label: "Done" },
];

const priorityClass = {
  high: "text-red-400 bg-red-500/10",
  medium: "text-amber-300 bg-amber-500/10",
  low: "text-emerald-300 bg-emerald-500/10",
};

const TaskBoard = ({ project }) => {
  const { user, isTeamHead } = useAuth();
  const [tasks, setTasks] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  const load = React.useCallback(async () => {
    if (!project?._id) return;
    setLoading(true);
    setError("");
    try {
      const res = await api.get(`/tasks/project/${project._id}`);
      setTasks(asList(res, "tasks"));
    } catch (err) {
      setError(err.body?.message || err.message || "Could not load tasks");
    } finally {
      setLoading(false);
    }
  }, [project?._id]);

  React.useEffect(() => {
    load();
    const onRefresh = () => load();
    window.addEventListener("matrix:refresh-tasks", onRefresh);
    return () => window.removeEventListener("matrix:refresh-tasks", onRefresh);
  }, [load]);

  const run = async (fn) => {
    try {
      await fn();
      await load();
    } catch (err) {
      setError(err.body?.message || err.message || "Action failed");
    }
  };

  const userId = idOf(user?.id || user?._id);

  if (!project) {
    return (
      <div className="rounded-xl border border-white/8 bg-white/[0.03] p-8 text-white/50">
        Create or select a project to see the task board.
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </div>
      )}
      {loading ? (
        <div className="text-sm text-white/45">Loading board…</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {COLUMNS.map((col) => {
            const items = tasks.filter((t) => t.status === col.id);
            return (
              <div
                key={col.id}
                className="rounded-xl border border-white/8 bg-white/[0.02] p-3 min-h-[320px]">
                <div className="flex items-center justify-between mb-3 px-1">
                  <h3 className="text-xs tracking-wide text-white/55 uppercase">
                    {col.label}
                  </h3>
                  <span className="text-xs text-white/35">{items.length}</span>
                </div>
                <div className="space-y-2">
                  {items.map((task) => {
                    const assignee = task.assignedTo;
                    const mine = idOf(assignee?._id || assignee) === userId;
                    return (
                      <article
                        key={task._id}
                        className="rounded-lg border border-white/8 bg-[#0c0d12] p-3 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-sm font-medium text-white leading-snug">
                            <Link
                              to={`/projects/${project.slug || project._id}/tasks/${task._id}`}
                              className="hover:underline">
                              {task.title}
                            </Link>
                          </h4>
                          <span
                            className={`text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded ${
                              priorityClass[task.priority] || "text-white/40 bg-white/5"
                            }`}>
                            {task.priority}
                          </span>
                        </div>
                        {task.description && (
                          <p className="text-xs text-white/45 line-clamp-3">
                            {task.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between text-xs text-white/40">
                          <span>{formatDate(task.dueDate)}</span>
                          {assignee ? (
                            <span className="flex items-center gap-1.5 text-white/60">
                              <UserAvatar
                                name={assignee.username}
                                src={assignee.avatarUrl}
                                size="sm"
                              />
                            </span>
                          ) : (
                            <span>Unassigned</span>
                          )}
                        </div>
                        {task.linkedBranch && (
                          <div className="flex items-center gap-1 text-[11px] text-white/45">
                            <GitBranch className="w-3 h-3" />
                            <span className="truncate">{task.linkedBranch}</span>
                          </div>
                        )}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {col.id === "todo" && !assignee && (
                            <button
                              type="button"
                              onClick={() =>
                                run(() => api.post(`/tasks/claim/${task._id}`))
                              }
                              className="text-[11px] px-2 py-1 rounded-md bg-white/8 hover:bg-white/12">
                              Claim
                            </button>
                          )}
                          {col.id === "in_progress" && mine && (
                            <button
                              type="button"
                              onClick={() =>
                                run(() => api.post(`/tasks/submit/${task._id}`))
                              }
                              className="text-[11px] px-2 py-1 rounded-md bg-white/8 hover:bg-white/12">
                              Submit for review
                            </button>
                          )}
                          {isTeamHead() && col.id === "in_review" && (
                            <button
                              type="button"
                              onClick={() =>
                                run(() =>
                                  api.put(`/tasks/update-status/${task._id}`, {
                                    status: "done",
                                  }),
                                )
                              }
                              className="text-[11px] px-2 py-1 rounded-md bg-white text-black">
                              Mark done
                            </button>
                          )}
                          {isTeamHead() && !assignee && (
                            <span className="inline-flex items-center gap-1 text-[11px] text-white/35">
                              <UserPlus className="w-3 h-3" /> assign from task
                            </span>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TaskBoard;
