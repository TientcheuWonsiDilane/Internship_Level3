import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Mail, Users } from "lucide-react";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";
import OnboardingShell from "../components/onboarding/OnboardingShell";
import {
  extractInviteToken,
  pickId,
  setOnboardingTeamId,
} from "../lib/onboarding";

const Onboarding = () => {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [mode, setMode] = useState("create");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [invite, setInvite] = useState("");
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    api
      .get("/invitations/my-invitations")
      .then((res) => {
        if (mounted) setInvitations(res.invitations || []);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const afterJoin = async () => {
    await refreshUser();
    navigate("/dashboard", { replace: true });
  };

  const createTeam = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/teams", { name, description });
      const teamId = pickId(res, "team");
      if (!teamId) throw new Error("Team was created but no id was returned");
      setOnboardingTeamId(teamId);
      await refreshUser();
      navigate("/onboarding/organization");
    } catch (err) {
      setError(err.body?.message || err.message || "Failed to create team");
    } finally {
      setLoading(false);
    }
  };

  const joinWithCode = async (e) => {
    e.preventDefault();
    const token = extractInviteToken(invite);
    if (!token) {
      setError("Paste an invite code or link");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await api.post(`/invitations/${token}/accept`);
      await afterJoin();
    } catch (err) {
      setError(err.body?.message || err.message || "Could not accept invite");
    } finally {
      setLoading(false);
    }
  };

  const acceptListed = async (id) => {
    setLoading(true);
    setError("");
    try {
      await api.post(`/invitations/${id}/accept`);
      await afterJoin();
    } catch (err) {
      setError(err.body?.message || err.message || "Could not accept invite");
    } finally {
      setLoading(false);
    }
  };

  return (
    <OnboardingShell
      stepIndex={0}
      hideSteps={false}
      title={`Welcome${user?.username ? `, ${user.username}` : ""}`}
      subtitle="Create your first team, or join one with an invite. Organizations are optional and come next.">
      <div className="grid sm:grid-cols-2 gap-3 mb-6">
        <button
          type="button"
          onClick={() => {
            setMode("create");
            setError("");
          }}
          className={`text-left p-5 rounded-2xl border transition-all ${
            mode === "create"
              ? "bg-white text-black border-white"
              : "bg-[#0b0b0d] border-white/10 hover:border-white/30"
          }`}>
          <Users className="h-5 w-5 mb-3" />
          <div className="font-semibold">Create a new team</div>
          <p className={`text-sm mt-1 ${mode === "create" ? "text-black/60" : "text-gray-400"}`}>
            You become Team Head and can invite others.
          </p>
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("join");
            setError("");
          }}
          className={`text-left p-5 rounded-2xl border transition-all ${
            mode === "join"
              ? "bg-white text-black border-white"
              : "bg-[#0b0b0d] border-white/10 hover:border-white/30"
          }`}>
          <Mail className="h-5 w-5 mb-3" />
          <div className="font-semibold">Join with an invite</div>
          <p className={`text-sm mt-1 ${mode === "join" ? "text-black/60" : "text-gray-400"}`}>
            Use a code, invite link, or a pending email invite.
          </p>
        </button>
      </div>

      <div className="bg-[#0b0b0d] border border-white/5 p-8 rounded-2xl shadow-2xl">
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg">
            {error}
          </div>
        )}

        {mode === "create" ? (
          <form onSubmit={createTeam} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Team name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="e.g. Platform Engineering"
                className="block w-full px-4 py-2.5 border border-white/10 rounded-xl bg-white/5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Description (optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="What does this team work on?"
                className="block w-full px-4 py-2.5 border border-white/10 rounded-xl bg-white/5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="w-full flex justify-center items-center py-2.5 px-4 rounded-xl text-sm font-semibold bg-white text-black hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? "Creating..." : "Create team"}
              {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
            </button>
          </form>
        ) : (
          <div className="space-y-6">
            <form onSubmit={joinWithCode} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Invite code or link
                </label>
                <input
                  value={invite}
                  onChange={(e) => setInvite(e.target.value)}
                  placeholder="Paste invite token or URL"
                  className="block w-full px-4 py-2.5 border border-white/10 rounded-xl bg-white/5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !invite.trim()}
                className="w-full flex justify-center items-center py-2.5 px-4 rounded-xl text-sm font-semibold bg-white text-black hover:bg-gray-200 disabled:opacity-50">
                {loading ? "Joining..." : "Join team"}
              </button>
            </form>

            {invitations.length > 0 && (
              <div>
                <p className="text-sm text-gray-400 mb-3">Pending invites for {user?.email}</p>
                <div className="space-y-2">
                  {invitations.map((inv) => (
                    <div
                      key={inv._id}
                      className="flex items-center justify-between gap-3 p-3 rounded-xl border border-white/10 bg-white/5">
                      <div>
                        <div className="font-medium">
                          {inv.teamId?.name || "Team"}
                        </div>
                        <div className="text-xs text-gray-500">
                          Invited by {inv.inviterId?.username || "a teammate"} ·{" "}
                          {inv.role}
                        </div>
                      </div>
                      <button
                        type="button"
                        disabled={loading}
                        onClick={() => acceptListed(inv._id)}
                        className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-white text-black hover:bg-gray-200">
                        Accept
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </OnboardingShell>
  );
};

export default Onboarding;
