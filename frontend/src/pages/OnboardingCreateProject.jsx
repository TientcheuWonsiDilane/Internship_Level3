import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";
import OnboardingShell from "../components/onboarding/OnboardingShell";
import {
  getOnboardingTeamId,
  isTeamHeadOf,
  pickId,
  setOnboardingProjectId,
  setOnboardingTeamId,
} from "../lib/onboarding";

const OnboardingCreateProject = () => {
  const navigate = useNavigate();
  const { user, currentTeam } = useAuth();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
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

  const skip = () => navigate("/dashboard");

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/projects", { name, description, teamId });
      const projectId = pickId(res, "project");
      if (projectId) setOnboardingProjectId(projectId);
      navigate("/onboarding/connect-repo");
    } catch (err) {
      setError(err.body?.message || err.message || "Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <OnboardingShell
      stepIndex={2}
      title="Create a first project"
      subtitle="Skippable. You can add a project later from Projects — a team does not need one on day one.">
      <div className="bg-[#0b0b0d] border border-white/5 p-8 rounded-2xl">
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg">
            {error}
          </div>
        )}
        <form onSubmit={submit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Project name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. Website rewrite"
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
              placeholder="What will this project track?"
              className="block w-full px-4 py-2.5 border border-white/10 rounded-xl bg-white/5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 resize-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="w-full flex justify-center items-center py-2.5 px-4 rounded-xl text-sm font-semibold bg-white text-black hover:bg-gray-200 disabled:opacity-50">
            {loading ? "Creating..." : "Create project"}
            {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
          </button>
        </form>
        <button
          type="button"
          onClick={skip}
          className="mt-6 w-full py-2.5 text-sm font-semibold text-white hover:text-gray-300">
          Skip for now
        </button>
      </div>
    </OnboardingShell>
  );
};

export default OnboardingCreateProject;
