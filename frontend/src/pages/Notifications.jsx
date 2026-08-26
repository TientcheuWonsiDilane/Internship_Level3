import React from "react";
import { useAuth } from "../context/AuthContext";
import PageShell from "../components/PageShell";
import api from "../lib/api";
import { asList, roleLabel } from "../lib/workspace";

const Notifications = () => {
  const { isTeamHead } = useAuth();
  const [invites, setInvites] = React.useState([]);

  React.useEffect(() => {
    api
      .get("/invitations/my-invitations")
      .then((res) => setInvites(asList(res, "invitations")))
      .catch(() => setInvites([]));
  }, []);

  return (
    <PageShell
      title="Notifications"
      subtitle="Invites and items that need your attention. Real-time sockets are not enabled at this level.">
      <div className="space-y-2">
        {invites.map((inv) => (
          <div
            key={inv._id}
            className="rounded-xl border border-white/8 bg-white/[0.03] p-4">
            <div className="text-sm">
              You were invited to {inv.teamId?.name || "a team"} as{" "}
              {roleLabel(inv.role)}.
            </div>
            <div className="text-xs text-white/40 mt-1">
              From {inv.inviterId?.username}
            </div>
          </div>
        ))}
        {invites.length === 0 && (
          <p className="text-sm text-white/40">
            {isTeamHead()
              ? "No notifications right now."
              : "No notifications right now."}
          </p>
        )}
      </div>
    </PageShell>
  );
};

export default Notifications;
