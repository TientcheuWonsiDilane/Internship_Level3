import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useModal } from "../context/ModalContext";
import CreateProjectModal from "../components/modals/CreateProjectModal";
import CreateTaskModal from "../components/modals/CreateTaskModal";
import PageShell from "../components/PageShell";
import TaskBoard from "../components/TaskBoard";

const Projects = () => {
  const { currentProject, projects, isTeamHead, setCurrentProject } = useAuth();
  const { showModal } = useModal();
  const navigate = useNavigate();

  return (
    <PageShell
      title="Task Board"
      subtitle={
        currentProject
          ? `Kanban for ${currentProject.name}`
          : "Select a project to manage tasks"
      }
      actions={
        <>
          {isTeamHead() && (
            <button
              type="button"
              onClick={() => showModal(CreateProjectModal)}
              className="px-4 py-2 rounded-lg border border-white/15 text-sm hover:bg-white/5">
              New project
            </button>
          )}
          <button
            type="button"
            onClick={() => showModal(CreateTaskModal)}
            disabled={!currentProject}
            className="px-4 py-2 rounded-lg bg-white text-black text-sm font-semibold hover:bg-gray-200 disabled:opacity-40">
            + New Task
          </button>
        </>
      }>
      {projects.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {projects.map((p) => (
            <button
              key={p._id}
              type="button"
              onClick={() => {
                setCurrentProject(p);
                navigate(`/projects/${p.slug}`);
              }}
              className={`px-3 py-1.5 rounded-full text-xs border ${
                currentProject?._id === p._id
                  ? "bg-white text-black border-white"
                  : "border-white/15 text-white/60 hover:text-white"
              }`}>
              {p.name}
            </button>
          ))}
        </div>
      )}
      <TaskBoard project={currentProject} />
    </PageShell>
  );
};

export default Projects;
