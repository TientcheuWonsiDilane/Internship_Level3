const TEAM_KEY = "matrix.onboarding.teamId";
const PROJECT_KEY = "matrix.onboarding.projectId";

export function setOnboardingTeamId(id) {
  if (id) sessionStorage.setItem(TEAM_KEY, String(id));
}

export function getOnboardingTeamId() {
  return sessionStorage.getItem(TEAM_KEY);
}

export function setOnboardingProjectId(id) {
  if (id) sessionStorage.setItem(PROJECT_KEY, String(id));
}

export function getOnboardingProjectId() {
  return sessionStorage.getItem(PROJECT_KEY);
}

export function clearOnboarding() {
  sessionStorage.removeItem(TEAM_KEY);
  sessionStorage.removeItem(PROJECT_KEY);
}

export function pickId(res, ...keys) {
  for (const key of keys) {
    const value = res?.[key];
    const id = value?._id || value?.id;
    if (id) return String(id);
  }
  const nested = res?.message;
  return String(res?._id || res?.id || nested?._id || nested?.id || "");
}

export function extractInviteToken(input) {
  const trimmed = String(input || "").trim();
  if (!trimmed) return "";
  try {
    const url = new URL(trimmed);
    const parts = url.pathname.split("/").filter(Boolean);
    return parts[parts.length - 1] || trimmed;
  } catch {
    return trimmed.split("/").filter(Boolean).pop() || trimmed;
  }
}

export function hasTeam(user) {
  return Boolean(user?.memberships?.length);
}

export function isTeamHeadOf(user, teamId) {
  if (!user?.memberships || !teamId) return false;
  return user.memberships.some(
    (m) =>
      String(m.teamId || m.team) === String(teamId) && m.role === "team_head",
  );
}
