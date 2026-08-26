import React from "react";
import { useAuth } from "../context/AuthContext";
import PageShell from "../components/PageShell";
import UserAvatar from "../components/UserAvatar";
import api from "../lib/api";
import { idOf, roleLabel } from "../lib/workspace";

const Profile = () => {
  const { user, refreshUser, isTeamHead } = useAuth();
  const [username, setUsername] = React.useState(user?.username || "");
  const [message, setMessage] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    setUsername(user?.username || "");
  }, [user?.username]);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      await api.put(`/users/${idOf(user.id || user._id)}`, { username });
      await refreshUser();
      setMessage("Account updated.");
    } catch (err) {
      setMessage(err.body?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  const githubUrl = user?.username ? `https://github.com/${user.username}` : null;

  return (
    <PageShell title="Account Settings" subtitle="Your profile for this workspace">
      <div className="max-w-xl space-y-6">
        <div className="rounded-xl border border-white/8 bg-white/[0.03] p-5 flex items-center gap-4">
          <UserAvatar name={user?.username} src={user?.avatarUrl} size="lg" />
          <div>
            <div className="font-medium">{user?.username}</div>
            <div className="text-sm text-white/40">{user?.email}</div>
            <span className="mt-2 inline-flex rounded-md bg-[#3a2a55] px-2 py-0.5 text-[11px] text-[#c4b0e8]">
              {roleLabel(isTeamHead() ? "team_head" : "developer")}
            </span>
          </div>
        </div>

        <form onSubmit={save} className="rounded-xl border border-white/8 bg-white/[0.03] p-5 space-y-4">
          <div>
            <label className="block text-sm text-white/50 mb-1.5">Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#0b0b0d] border border-white/10 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-white/50 mb-1.5">Email</label>
            <input
              value={user?.email || ""}
              disabled
              className="w-full px-4 py-2.5 rounded-xl bg-[#0b0b0d] border border-white/10 text-white/40"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-white text-black text-sm font-semibold">
            {saving ? "Saving…" : "Save changes"}
          </button>
        </form>

        {githubUrl && (
          <a
            href={githubUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-block text-sm underline underline-offset-4">
            Open GitHub profile
          </a>
        )}
        {message && <p className="text-sm text-white/60">{message}</p>}
      </div>
    </PageShell>
  );
};

export default Profile;
