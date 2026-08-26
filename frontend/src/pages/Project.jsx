import React from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useModal } from "../context/ModalContext";
import CreateTaskModal from "../components/modals/CreateTaskModal";
import PageShell from "../components/PageShell";
import TaskBoard from "../components/TaskBoard";
import api from "../lib/api";
import { asItem } from "../lib/workspace";

const Project = () => {
  const { slug } = useParams();
  const { projects, setCurrentProject, currentProject } = useAuth();
  const { showModal } = useModal();
  const [project, setProject] = React.useState(currentProject);

  React.useEffect(() => {
    const fromList = projects.find((p) => p.slug === slug || p._id === slug);
    if (fromList) {
      setProject(fromList);
      setCurrentProject(fromList);
      return;
    }
    let mounted = true;
    api
      .get(`/projects/${slug}`)
      .then((res) => {
        const item = asItem(res, "project");
        if (mounted && item?._id) {
          setProject(item);
          setCurrentProject(item);
        }
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, [slug, projects, setCurrentProject]);

  return (
    <PageShell
      title={project?.name || "Project"}
      subtitle={project?.description || "Project board"}
      actions={
        <button
          type="button"
          onClick={() => showModal(CreateTaskModal)}
          className="px-4 py-2 rounded-lg bg-white text-black text-sm font-semibold hover:bg-gray-200">
          + New Task
        </button>
      }>
      <TaskBoard project={project} />
    </PageShell>
  );
};

export default Project;
