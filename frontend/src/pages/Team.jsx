import React from "react";
import { useParams } from "react-router-dom";
import PageShell from "../components/PageShell";
import UserAvatar from "../components/UserAvatar";
import api from "../lib/api";
import { asItem, asList, roleLabel } from "../lib/workspace";

const Team = () => {
  const { id } = useParams();
  const [team, setTeam] = React.useState(null);
  const [members, setMembers] = React.useState([]);

  React.useEffect(() => {
    let mounted = true;
    Promise.all([
      api.get(`/teams/${id}`),
      api.get(`/teams/${id}/members`),
    ]).then(([t, m]) => {
      if (!mounted) return;
      setTeam(asItem(t, "team"));
      setMembers(asList(m, "members"));
    });
    return () => {
      mounted = false;
    };
  }, [id]);

  return (
    <PageShell title={team?.name || "Team"} subtitle={team?.description}>
      <div className="space-y-2">
        {members.map((m) => (
          <div
            key={m.membershipId}
            className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.03] p-3">
            <UserAvatar name={m.user?.username} src={m.user?.avatarUrl} />
            <div className="flex-1">
              <div className="font-medium">{m.user?.username}</div>
              <div className="text-xs text-white/40">{roleLabel(m.role)}</div>
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
};

export default Team;
