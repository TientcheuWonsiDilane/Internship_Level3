import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GitBranch } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import OnboardingShell from "../components/onboarding/OnboardingShell";
import {
  clearOnboarding,
  getOnboardingProjectId,
  getOnboardingTeamId,
  isTeamHeadOf,
} from "../lib/onboarding";

const OnboardingConnectRepo = () => {
  const navigate = useNavigate();
  const { user, currentTeam } = useAuth();
  const teamId =
    getOnboardingTeamId() ||
    currentTeam ||
    user?.memberships?.[0]?.teamId ||
    user?.memberships?.[0]?.team;
  const projectId = getOnboardingProjectId();

  useEffect(() => {
    if (!teamId) {
      navigate("/onboarding", { replace: true });
      return;
    }
    if (user && !isTeamHeadOf(user, teamId)) {
      navigate("/dashboard", { replace: true });
    }
  }, [teamId, user, navigate]);

  const finish = () => {
    clearOnboarding();
    navigate("/dashboard");
  };

  return (
    <OnboardingShell
      stepIndex={3}
      title="Connect a repository"
      subtitle="Optional. Link GitHub later from the project so tasks, branches, and pull requests stay in one place.">
      <div className="bg-[#0b0b0d] border border-white/5 p-8 rounded-2xl space-y-6">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center">
            <GitBranch className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-semibold text-lg">Authorize GitHub when you are ready</h2>
            <p className="text-sm text-gray-400 mt-1">
              Install access for your organization or personal account, then pick a
              repository to attach{projectId ? " to this project" : ""}. You can do
              this from the project page at any time.
            </p>
          </div>
        </div>

        <ol className="space-y-3 text-sm text-gray-300 list-decimal list-inside">
          <li>Authorize Matrix to see the repositories you choose.</li>
          <li>Select one or more repos for this project.</li>
          <li>Sync starts automatically after they are linked.</li>
        </ol>

        <button
          type="button"
          onClick={() => {
            window.location.href = "http://localhost:5000/api/auth/github";
          }}
          className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold bg-white text-black hover:bg-gray-200">
          Continue with GitHub
        </button>
        <button
          type="button"
          onClick={finish}
          className="w-full py-2.5 text-sm font-semibold text-white hover:text-gray-300">
          Skip and go to dashboard
        </button>
      </div>
    </OnboardingShell>
  );
};

export default OnboardingConnectRepo;
