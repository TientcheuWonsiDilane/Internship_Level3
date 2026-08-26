import React from "react";
import api from "../lib/api";
import { useNavigate } from "react-router-dom";
import { hasTeam } from "../lib/onboarding";
import { asItem, asList, idOf } from "../lib/workspace";

const AuthContext = React.createContext(null);
const PROJECT_KEY = "matrix.currentProjectId";
const TEAM_KEY = "matrix.currentTeamId";

const membershipTeamIds = (user) =>
  (user?.memberships || [])
    .map((m) => idOf(m.teamId || m.team))
    .filter(Boolean);

const pickStoredTeam = (user) => {
  const ids = membershipTeamIds(user);
  if (!ids.length) return null;
  const stored = sessionStorage.getItem(TEAM_KEY);
  return ids.includes(stored) ? stored : ids[0];
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [currentTeam, setCurrentTeamState] = React.useState(null);
  const [teams, setTeams] = React.useState([]);
  const [projects, setProjects] = React.useState([]);
  const [currentProject, setCurrentProjectState] = React.useState(null);
  const navigate = useNavigate();

  const setCurrentTeam = React.useCallback((teamId) => {
    const next = teamId ? String(teamId) : null;
    setCurrentTeamState(next);
    if (next) sessionStorage.setItem(TEAM_KEY, next);
    else sessionStorage.removeItem(TEAM_KEY);
    sessionStorage.removeItem(PROJECT_KEY);
    setCurrentProjectState(null);
  }, []);

  const applyUser = React.useCallback((u) => {
    setUser(u || null);
    const nextTeam = pickStoredTeam(u);
    setCurrentTeamState(nextTeam);
    if (nextTeam) sessionStorage.setItem(TEAM_KEY, nextTeam);
    else sessionStorage.removeItem(TEAM_KEY);
    return u;
  }, []);

  const setCurrentProject = React.useCallback((project) => {
    setCurrentProjectState(project || null);
    if (project?._id) {
      sessionStorage.setItem(PROJECT_KEY, String(project._id));
    }
  }, []);

  const refreshUser = React.useCallback(async () => {
    const u = await api.get("/users/me");
    return applyUser(u || null);
  }, [applyUser]);

  const refreshProjects = React.useCallback(async (teamId = currentTeam) => {
    if (!teamId) {
      setProjects([]);
      setCurrentProjectState(null);
      return [];
    }
    try {
      const data = await api.get(`/projects/team/${teamId}`);
      const list = asList(data, "projects");
      setProjects(list);
      const stored = sessionStorage.getItem(PROJECT_KEY);
      const next =
        list.find((p) => String(p._id) === stored) || list[0] || null;
      setCurrentProjectState(next);
      return list;
    } catch {
      setProjects([]);
      return [];
    }
  }, [currentTeam]);

  React.useEffect(() => {
    let mounted = true;
    api
      .get("/users/me")
      .then((u) => {
        if (!mounted) return;
        applyUser(u || null);
      })
      .catch(() => setUser(null))
      .finally(() => mounted && setLoading(false));
    return () => (mounted = false);
  }, [applyUser]);

  const refreshTeams = React.useCallback(async (u = user) => {
    const ids = membershipTeamIds(u);
    if (!ids.length) {
      setTeams([]);
      return [];
    }
    const loaded = await Promise.all(
      ids.map(async (id) => {
        try {
          const res = await api.get(`/teams/${id}`);
          const team = asItem(res, "team");
          const membership = (u?.memberships || []).find(
            (m) => idOf(m.teamId || m.team) === id,
          );
          return team?._id
            ? { ...team, role: membership?.role || "developer" }
            : { _id: id, name: "Team", role: membership?.role };
        } catch {
          return { _id: id, name: "Team" };
        }
      }),
    );
    setTeams(loaded);
    return loaded;
  }, [user]);

  React.useEffect(() => {
    refreshProjects(currentTeam);
  }, [currentTeam, refreshProjects]);

  React.useEffect(() => {
    if (user) refreshTeams(user);
    else setTeams([]);
  }, [user, refreshTeams]);

  const login = async (credentials) => {
    const res = await api.post("/auth/login", credentials);
    const nextUser = applyUser(res.user || res);
    navigate(hasTeam(nextUser) ? "/dashboard" : "/onboarding");
  };

  const register = async (payload) => {
    const res = await api.post("/auth/register", {
      ...payload,
      username: payload.username || payload.name,
    });
    applyUser(res.user || res);
    navigate("/onboarding");
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (e) {}
    setUser(null);
    setCurrentTeamState(null);
    setTeams([]);
    setProjects([]);
    setCurrentProjectState(null);
    sessionStorage.removeItem(TEAM_KEY);
    sessionStorage.removeItem(PROJECT_KEY);
    navigate("/login");
  };

  const isTeamHead = (teamId = currentTeam) => {
    if (!user || !user.memberships) return false;
    return user.memberships.some(
      (m) => idOf(m.teamId || m.team) === idOf(teamId) && m.role === "team_head",
    );
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        register,
        refreshUser,
        currentTeam,
        setCurrentTeam,
        teams,
        refreshTeams,
        isTeamHead,
        projects,
        currentProject,
        setCurrentProject,
        refreshProjects,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => React.useContext(AuthContext);

export default AuthContext;
