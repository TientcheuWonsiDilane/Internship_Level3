import React from "react";
import api from "../lib/api";
import { useNavigate } from "react-router-dom";

const AuthContext = React.createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [currentTeam, setCurrentTeam] = React.useState(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    let mounted = true;
    api
      .get("/me")
      .then((u) => {
        if (!mounted) return;
        setUser(u || null);
        if (u && u.memberships && u.memberships.length > 0) {
          setCurrentTeam(
            u.memberships[0].teamId || u.memberships[0].team || null,
          );
        }
      })
      .catch(() => setUser(null))
      .finally(() => mounted && setLoading(false));
    return () => (mounted = false);
  }, []);

  const login = async (credentials) => {
    const res = await api.post("/auth/login", credentials);
    setUser(res.user || res);
    if (res.user && res.user.memberships && res.user.memberships.length) {
      setCurrentTeam(
        res.user.memberships[0].teamId || res.user.memberships[0].team,
      );
    }
    navigate("/dashboard");
  };

  const register = async (payload) => {
    const res = await api.post("/auth/register", {
      ...payload,
      username: payload.username || payload.name,
    });
    setUser(res.user || res);
    navigate("/dashboard");
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (e) {}
    setUser(null);
    navigate("/login");
  };

  const isTeamHead = (teamId = currentTeam) => {
    if (!user || !user.memberships) return false;
    return user.memberships.some(
      (m) => (m.teamId || m.team) === teamId && m.role === "team_head",
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
        currentTeam,
        setCurrentTeam,
        isTeamHead,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => React.useContext(AuthContext);

export default AuthContext;
