import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";
import OnboardingShell from "../components/onboarding/OnboardingShell";
import {
  getOnboardingTeamId,
  isTeamHeadOf,
  setOnboardingTeamId,
} from "../lib/onboarding";

const OnboardingOrganization = () => {
  const navigate = useNavigate();
  const { user, currentTeam } = useAuth();
  const [mode, setMode] = useState("create");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [orgs, setOrgs] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const teamId =
    getOnboardingTeamId() ||
    currentTeam ||
    user?.memberships?.[0]?.teamId ||
    user?.memberships?.[0]?.team;

  useEffect(() => {
    if (teamId) setOnboardingTeamId(teamId);
    if (!teamId) {
      navigate("/onboarding", { replace: true });
      return;
    }
    if (user && !isTeamHeadOf(user, teamId)) {
      navigate("/dashboard", { replace: true });
    }
  }, [teamId, user, navigate]);

  useEffect(() => {
    let mounted = true;
    api
      .get("/organizations")
      .then((res) => {
        if (!mounted) return;
        const list = res.organizations || res || [];
        setOrgs(Array.isArray(list) ? list : []);
        if (list[0]?._id) setSelectedOrg(String(list[0]._id));
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const skip = () => navigate("/onboarding/create-project");

  const continueFlow = () => navigate("/onboarding/create-project");

  const createOrg = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post("/organizations", {
        name,
        description,
        teamId,
      });
      continueFlow();
    } catch (err) {
      setError(err.body?.message || err.message || "Failed to create organization");
    } finally {
      setLoading(false);
    }
  };

  const attachExisting = async (e) => {
    e.preventDefault();
    if (!selectedOrg) {
      setError("Select an organization");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await api.post(`/organizations/${selectedOrg}/teams`, { teamId });
      continueFlow();
    } catch (err) {
      setError(err.body?.message || err.message || "Failed to attach team");
    } finally {
      setLoading(false);
    }
  };

  return (
    <OnboardingShell
      stepIndex={1}
      title="Group under an organization"
      subtitle="Optional. Teams work the same way with or without one — skip if you do not need shared grouping yet.">
      <div className="grid sm:grid-cols-2 gap-3 mb-6">
        <button
          type="button"
          onClick={() => setMode("create")}
          className={`text-left p-4 rounded-2xl border ${
            mode === "create"
              ? "bg-white text-black border-white"
              : "bg-[#0b0b0d] border-white/10"
          }`}>
          <div className="font-semibold">Create organization</div>
          <p className={`text-sm mt-1 ${mode === "create" ? "text-black/60" : "text-gray-400"}`}>
            You become the owner and this team is attached.
          </p>
        </button>
        <button
          type="button"
          onClick={() => setMode("attach")}
          className={`text-left p-4 rounded-2xl border ${
            mode === "attach"
              ? "bg-white text-black border-white"
              : "bg-[#0b0b0d] border-white/10"
          }`}>
          <div className="font-semibold">Use one you own</div>
          <p className={`text-sm mt-1 ${mode === "attach" ? "text-black/60" : "text-gray-400"}`}>
            Attach this team to an existing organization.
          </p>
        </button>
      </div>

      <div className="bg-[#0b0b0d] border border-white/5 p-8 rounded-2xl">
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg">
            {error}
          </div>
        )}

        {mode === "create" ? (
          <form onSubmit={createOrg} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Organization name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="e.g. Acme Labs"
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
                placeholder="How teams in this organization relate"
                className="block w-full px-4 py-2.5 border border-white/10 rounded-xl bg-white/5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="w-full flex justify-center items-center py-2.5 px-4 rounded-xl text-sm font-semibold bg-white text-black hover:bg-gray-200 disabled:opacity-50">
              {loading ? "Creating..." : "Create and continue"}
              {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
            </button>
          </form>
        ) : orgs.length === 0 ? (
          <p className="text-gray-400 text-sm">
            You do not own any organizations yet. Create one, or skip for now.
          </p>
        ) : (
          <form onSubmit={attachExisting} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Organization
              </label>
              <select
                value={selectedOrg}
                onChange={(e) => setSelectedOrg(e.target.value)}
                className="block w-full px-4 py-2.5 border border-white/10 rounded-xl bg-[#0b0b0d] text-white focus:outline-none focus:ring-2 focus:ring-white/50">
                {orgs.map((org) => (
                  <option key={org._id} value={org._id}>
                    {org.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={loading || !selectedOrg}
              className="w-full flex justify-center items-center py-2.5 px-4 rounded-xl text-sm font-semibold bg-white text-black hover:bg-gray-200 disabled:opacity-50">
              {loading ? "Attaching..." : "Attach team and continue"}
            </button>
          </form>
        )}

        <button
          type="button"
          onClick={skip}
          className="mt-6 w-full py-2.5 text-sm font-semibold text-white hover:text-gray-300">
          Not now, skip
        </button>
      </div>
    </OnboardingShell>
  );
};

export default OnboardingOrganization;
