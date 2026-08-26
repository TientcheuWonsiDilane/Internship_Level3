import React from "react";
import { useAuth } from "../context/AuthContext";
import { useModal } from "../context/ModalContext";
import CreateTaskModal from "../components/modals/CreateTaskModal";
import PageShell from "../components/PageShell";
import api from "../lib/api";
import { asList } from "../lib/workspace";

const Dashboard = () => {
  const { currentTeam, currentProject, projects, isTeamHead } = useAuth();
  const { showModal } = useModal();
  const [tasks, setTasks] = React.useState([]);
  const [members, setMembers] = React.useState([]);

  React.useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!currentTeam) return;
      try {
        const mem = await api.get(`/teams/${currentTeam}/members`);
        if (mounted) setMembers(asList(mem, "members"));
      } catch {
        if (mounted) setMembers([]);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [currentTeam]);

  React.useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!currentProject?._id) {
        setTasks([]);
        return;
      }
      try {
        const res = await api.get(`/tasks/project/${currentProject._id}`);
        if (mounted) setTasks(asList(res, "tasks"));
      } catch {
        if (mounted) setTasks([]);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [currentProject?._id]);

  const counts = {
    todo: tasks.filter((t) => t.status === "todo").length,
    progress: tasks.filter((t) => t.status === "in_progress").length,
    review: tasks.filter((t) => t.status === "in_review").length,
    done: tasks.filter((t) => t.status === "done").length,
  };

  const cards = [
    { label: "Projects", value: projects.length },
    { label: "Members", value: members.length },
    { label: "Open tasks", value: counts.todo + counts.progress + counts.review },
    { label: "Done", value: counts.done },
  ];

  return (
    <PageShell
      title="Dashboard"
      subtitle={
        currentProject
          ? `Overview for ${currentProject.name}`
          : "Your team workspace overview"
      }
      actions={
        currentProject ? (
          <button
            type="button"
            onClick={() => showModal(CreateTaskModal)}
            className="px-4 py-2 rounded-lg bg-white text-black text-sm font-semibold hover:bg-gray-200">
            + New Task
          </button>
        ) : null
      }>
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-white/8 bg-white/[0.03] p-4">
            <div className="text-xs text-white/45">{card.label}</div>
            <div className="text-2xl font-semibold mt-2">{card.value}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-xl border border-white/8 bg-white/[0.03] p-5">
          <h2 className="text-sm font-medium text-white/70 mb-4">Board snapshot</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              ["To Do", counts.todo],
              ["In Progress", counts.progress],
              ["In Review", counts.review],
              ["Done", counts.done],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg bg-black/40 border border-white/6 p-3">
                <div className="text-xs text-white/40">{label}</div>
                <div className="text-xl mt-1">{value}</div>
              </div>
            ))}
          </div>
          {!currentProject && (
            <p className="text-sm text-white/40 mt-4">
              {isTeamHead()
                ? "Create a project to start tracking work."
                : "Ask a team head to create a project."}
            </p>
          )}
        </div>
        <div className="rounded-xl border border-white/8 bg-white/[0.03] p-5">
          <h2 className="text-sm font-medium text-white/70 mb-4">Recent tasks</h2>
          <div className="space-y-3">
            {tasks.slice(0, 6).map((task) => (
              <div key={task._id} className="text-sm">
                <div className="text-white truncate">{task.title}</div>
                <div className="text-xs text-white/40 capitalize">
                  {String(task.status || "").replace("_", " ")}
                </div>
              </div>
            ))}
            {tasks.length === 0 && (
              <p className="text-sm text-white/40">No tasks yet.</p>
            )}
          </div>
        </div>
      </div>
    </PageShell>
  );
};

export default Dashboard;
