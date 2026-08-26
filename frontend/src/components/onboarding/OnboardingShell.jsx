import React from "react";
import { useLocation } from "react-router-dom";
import BrandLogo from "../BrandLogo";
import { useAuth } from "../../context/AuthContext";

const STEPS = [
  { path: "/onboarding", label: "Team" },
  { path: "/onboarding/organization", label: "Organization" },
  { path: "/onboarding/create-project", label: "Project" },
  { path: "/onboarding/connect-repo", label: "Repository" },
];

const OnboardingShell = ({
  title,
  subtitle,
  stepIndex,
  children,
  hideSteps = false,
}) => {
  const { logout, user } = useAuth();
  const location = useLocation();
  const activeIndex =
    typeof stepIndex === "number"
      ? stepIndex
      : STEPS.findIndex((s) => location.pathname === s.path);

  return (
    <div className="min-h-screen bg-[#050506] text-white p-4 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto pt-8 pb-16">
        <div className="flex items-center justify-between mb-10">
          <BrandLogo to="/" imageClassName="h-10 sm:h-12" />
          <div className="flex items-center gap-4 text-sm text-gray-400">
            {user?.email && <span className="hidden sm:inline">{user.email}</span>}
            <button
              type="button"
              onClick={logout}
              className="text-white hover:text-gray-300 font-medium">
              Sign out
            </button>
          </div>
        </div>

        {!hideSteps && (
          <div className="flex gap-2 mb-10">
            {STEPS.map((step, i) => (
              <div key={step.path} className="flex-1">
                <div
                  className={`h-1.5 rounded-full ${
                    i <= activeIndex ? "bg-white" : "bg-white/10"
                  }`}
                />
                <p
                  className={`mt-2 text-xs ${
                    i === activeIndex ? "text-white" : "text-gray-500"
                  }`}>
                  {step.label}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight">{title}</h1>
          {subtitle && <p className="text-gray-400 mt-2">{subtitle}</p>}
        </div>

        {children}
      </div>
    </div>
  );
};

export default OnboardingShell;
