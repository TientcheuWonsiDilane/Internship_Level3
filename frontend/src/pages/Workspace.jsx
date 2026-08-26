import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useModal } from "../context/ModalContext";
import CreateProjectModal from "../components/modals/CreateProjectModal";
import PageShell from "../components/PageShell";
import api from "../lib/api";
import { asItem, asList, formatDate, roleLabel } from "../lib/workspace";

const Workspace = () => {
  const { currentTeam, projects, isTeamHead, user, setCurrentProject } = useAuth();
  const { showModal } = useModal();
  const [team, setTeam] = React.useState(null);
  const [members, setMembers] = React.useState([]);

  React.useEffect(() => {
    let mounted = true;
    if (!currentTeam) return;
    Promise.all([
      api.get(`/teams/${currentTeam}`).catch(() => null),
      api.get(`/teams/${currentTeam}/members`).catch(() => null),
    ]).then(([teamRes, memRes]) => {
      if (!mounted) return;
      setTeam(asItem(teamRes, "team"));
      setMembers(asList(memRes, "members"));
    });
    return () => {
      mounted = false;
    };
  }, [currentTeam]);

  return (
    <PageShell
      title={team?.name || "Workspace"}
      subtitle={team?.description || "Team home — projects, people, and the current board"}
      actions={
        isTeamHead() ? (
          <button
            type="button"
            onClick={() => showModal(CreateProjectModal)}
            className="px-4 py-2 rounded-lg bg-white text-black text-sm font-semibold hover:bg-gray-200">
            New project
          </button>
        ) : null
      }>
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <div className="rounded-xl border border-white/8 bg-white/[0.03] p-4">
          <div className="text-xs text-white/45">Signed in</div>
          <div className="mt-1 font-medium">{user?.username}</div>
          <div className="text-xs text-white/40">{user?.email}</div>
        </div>
        <div className="rounded-xl border border-white/8 bg-white/[0.03] p-4">
          <div className="text-xs text-white/45">Your role</div>
          <div className="mt-1 font-medium">
            {roleLabel(isTeamHead() ? "team_head" : "developer")}
          </div>
        </div>
        <div className="rounded-xl border border-white/8 bg-white/[0.03] p-4">
          <div className="text-xs text-white/45">Members</div>
          <div className="mt-1 text-2xl font-semibold">{members.length}</div>
        </div>
      </div>

      <h2 className="text-sm text-white/55 mb-3">Projects</h2>
      <div className="grid md:grid-cols-2 gap-3">
        {projects.map((p) => (
          <Link
            key={p._id}
            to={`/projects/${p.slug}`}
            onClick={() => setCurrentProject(p)}
            className="rounded-xl border border-white/8 bg-white/[0.03] p-4 hover:bg-white/5 transition-colors">
            <div className="font-medium">{p.name}</div>
            <div className="text-sm text-white/40 mt-1 line-clamp-2">
              {p.description || "No description"}
            </div>
            <div className="text-xs text-white/30 mt-3">Created {formatDate(p.createdAt)}</div>
          </Link>
        ))}
        {projects.length === 0 && (
          <div className="text-sm text-white/40">No projects in this team yet.</div>
        )}
      </div>
    </PageShell>
  );
};

export default Workspace;
