import React from "react";
import { useAuth } from "../context/AuthContext";
import PageShell from "../components/PageShell";
import UserAvatar from "../components/UserAvatar";
import api from "../lib/api";
import { asList, roleLabel } from "../lib/workspace";

const ROLE_COPY = [
  {
    role: "Team Head",
    points: [
      "Owns the team, projects, and connected repositories",
      "Invites members and assigns roles",
      "Reviews work and can update or delete tasks",
    ],
  },
  {
    role: "Developer",
    points: [
      "Sees the team board and assigned work",
      "Can raise and claim tasks",
      "Submits work for review",
    ],
  },
];

const Roles = () => {
  const { currentTeam } = useAuth();
  const [members, setMembers] = React.useState([]);

  React.useEffect(() => {
    if (!currentTeam) return;
    api
      .get(`/teams/${currentTeam}/members`)
      .then((res) => setMembers(asList(res, "members")))
      .catch(() => setMembers([]));
  }, [currentTeam]);

  return (
    <PageShell
      title="Roles & Permissions"
      subtitle="Access is per team. A person can be Team Head here and a Developer on another team.">
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        {ROLE_COPY.map((block) => (
          <div key={block.role} className="rounded-xl border border-white/8 bg-white/[0.03] p-5">
            <h2 className="font-medium mb-3">{block.role}</h2>
            <ul className="space-y-2 text-sm text-white/55 list-disc pl-4">
              {block.points.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <h2 className="text-sm text-white/50 mb-3">Current assignments</h2>
      <div className="space-y-2">
        {members.map((m) => (
          <div
            key={m.membershipId}
            className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.03] p-3">
            <UserAvatar name={m.user?.username} src={m.user?.avatarUrl} />
            <div className="flex-1">{m.user?.username}</div>
            <span className="text-[11px] rounded-md bg-[#3a2a55] text-[#c4b0e8] px-2 py-0.5">
              {roleLabel(m.role)}
            </span>
          </div>
        ))}
      </div>
    </PageShell>
  );
};

export default Roles;
