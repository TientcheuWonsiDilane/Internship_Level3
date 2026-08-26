import React from "react";
import { useAuth } from "../context/AuthContext";
import { useModal } from "../context/ModalContext";
import InviteMemberModal from "../components/modals/InviteMemberModal";
import PageShell from "../components/PageShell";
import UserAvatar from "../components/UserAvatar";
import api from "../lib/api";
import { asList, roleLabel } from "../lib/workspace";

const Teams = () => {
  const { currentTeam, isTeamHead } = useAuth();
  const { showModal } = useModal();
  const [members, setMembers] = React.useState([]);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    let mounted = true;
    if (!currentTeam) return;
    api
      .get(`/teams/${currentTeam}/members`)
      .then((res) => mounted && setMembers(asList(res, "members")))
      .catch((err) => mounted && setError(err.body?.message || "Could not load members"));
    return () => {
      mounted = false;
    };
  }, [currentTeam]);

  return (
    <PageShell
      title="Members"
      subtitle="Everyone who belongs to the current team"
      actions={
        isTeamHead() ? (
          <button
            type="button"
            onClick={() => showModal(InviteMemberModal)}
            className="px-4 py-2 rounded-lg bg-white text-black text-sm font-semibold hover:bg-gray-200">
            Invite member
          </button>
        ) : null
      }>
      {error && <p className="text-sm text-red-400 mb-4">{error}</p>}
      <div className="space-y-2">
        {members.map((m) => (
          <div
            key={m.membershipId}
            className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.03] p-3">
            <UserAvatar name={m.user?.username} src={m.user?.avatarUrl} />
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{m.user?.username}</div>
              <div className="text-xs text-white/40 truncate">{m.user?.email}</div>
            </div>
            <span className="text-[11px] rounded-md bg-[#3a2a55] text-[#c4b0e8] px-2 py-0.5">
              {roleLabel(m.role)}
            </span>
          </div>
        ))}
        {members.length === 0 && (
          <p className="text-sm text-white/40">No members found.</p>
        )}
      </div>
    </PageShell>
  );
};

export default Teams;
