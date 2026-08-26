import React from "react";
import api from "../lib/api";
import { useNavigate } from "react-router-dom";
import { hasTeam } from "../lib/onboarding";
import { asList, idOf } from "../lib/workspace";

const AuthContext = React.createContext(null);
const PROJECT_KEY = "matrix.currentProjectId";

const applyMembershipTeam = (user, setCurrentTeam) => {
  if (user && user.memberships && user.memberships.length > 0) {
    setCurrentTeam(idOf(user.memberships[0].teamId || user.memberships[0].team) || null);
  } else {
    setCurrentTeam(null);
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [currentTeam, setCurrentTeam] = React.useState(null);
  const [projects, setProjects] = React.useState([]);
  const [currentProject, setCurrentProjectState] = React.useState(null);
  const navigate = useNavigate();

  const applyUser = React.useCallback((u) => {
    setUser(u || null);
    applyMembershipTeam(u, setCurrentTeam);
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

  React.useEffect(() => {
    refreshProjects(currentTeam);
  }, [currentTeam, refreshProjects]);

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
    setCurrentTeam(null);
    setProjects([]);
    setCurrentProjectState(null);
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
