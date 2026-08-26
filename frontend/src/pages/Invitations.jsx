import React from "react";
import { useAuth } from "../context/AuthContext";
import { useModal } from "../context/ModalContext";
import InviteMemberModal from "../components/modals/InviteMemberModal";
import PageShell from "../components/PageShell";
import api from "../lib/api";
import { asList, formatDate, roleLabel } from "../lib/workspace";

const Invitations = () => {
  const { currentTeam, isTeamHead } = useAuth();
  const { showModal } = useModal();
  const [mine, setMine] = React.useState([]);
  const [sent, setSent] = React.useState([]);
  const [message, setMessage] = React.useState("");

  const teamHead = isTeamHead();

  const load = React.useCallback(async () => {
    const my = await api.get("/invitations/my-invitations").catch(() => ({ invitations: [] }));
    setMine(asList(my, "invitations"));
    if (teamHead && currentTeam) {
      const team = await api
        .get(`/invitations/team/${currentTeam}`)
        .catch(() => ({ invitations: [] }));
      setSent(asList(team, "invitations"));
    }
  }, [currentTeam, teamHead]);

  React.useEffect(() => {
    load();
  }, [load]);

  const respond = async (id, action) => {
    try {
      await api.post(`/invitations/respond/${id}`, { action });
      setMessage(`Invitation ${action}.`);
      await load();
    } catch (err) {
      setMessage(err.body?.message || err.message);
    }
  };

  return (
    <PageShell
      title="Invitations"
      subtitle="Join requests sent to you, and invites this team has issued"
      actions={
        teamHead ? (
          <button
            type="button"
            onClick={() => showModal(InviteMemberModal)}
            className="px-4 py-2 rounded-lg bg-white text-black text-sm font-semibold">
            Invite member
          </button>
        ) : null
      }>
      {message && <p className="text-sm text-white/60 mb-4">{message}</p>}
      <h2 className="text-sm text-white/50 mb-3">Waiting for you</h2>
      <div className="space-y-2 mb-8">
        {mine.map((inv) => (
          <div
            key={inv._id}
            className="rounded-xl border border-white/8 bg-white/[0.03] p-4 flex items-center justify-between gap-3">
            <div>
              <div className="font-medium">{inv.teamId?.name || "Team"}</div>
              <div className="text-xs text-white/40">
                From {inv.inviterId?.username} · {roleLabel(inv.role)}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => respond(inv._id, "accepted")}
                className="px-3 py-1.5 text-xs rounded-lg bg-white text-black font-semibold">
                Accept
              </button>
              <button
                type="button"
                onClick={() => respond(inv._id, "declined")}
                className="px-3 py-1.5 text-xs rounded-lg border border-white/15">
                Decline
              </button>
            </div>
          </div>
        ))}
        {mine.length === 0 && (
          <p className="text-sm text-white/40">No pending invitations for your email.</p>
        )}
      </div>

      {teamHead && (
        <>
          <h2 className="text-sm text-white/50 mb-3">Sent by this team</h2>
          <div className="space-y-2">
            {sent.map((inv) => (
              <div
                key={inv._id}
                className="rounded-xl border border-white/8 bg-white/[0.03] p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium">{inv.email}</div>
                  <div className="text-xs text-white/40">
                    {roleLabel(inv.role)} · {inv.status} · {formatDate(inv.createdAt)}
                  </div>
                </div>
              </div>
            ))}
            {sent.length === 0 && (
              <p className="text-sm text-white/40">No invitations sent yet.</p>
            )}
          </div>
        </>
      )}
    </PageShell>
  );
};

export default Invitations;
