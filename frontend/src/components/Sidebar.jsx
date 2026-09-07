import React from "react";
import sections from "./sidebarItems.js";
import { useLocation, useNavigate } from "react-router-dom";
import SidebarItem from "./SidebarItem";
import { ChevronDown } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useModal } from "../context/ModalContext";
import CreateTaskModal from "./modals/CreateTaskModal";
import CreateTeamModal from "./modals/CreateTeamModal";
import BrandLogo from "./BrandLogo";
import SidebarProfile from "./SidebarProfile";
import api from "../lib/api";

const Sidebar = ({ onSelect }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    isTeamHead,
    projects,
    currentProject,
    setCurrentProject,
    teams,
    currentTeam,
    setCurrentTeam,
  } = useAuth();
  const { showModal } = useModal();

  const derivedActive = React.useMemo(() => {
    const all = sections.flatMap((s) => s.items || []);
    const match = all
      .filter((i) => i.to)
      .sort((a, b) => b.to.length - a.to.length)
      .find((i) => location.pathname.startsWith(i.to));
    return match ? match.id : null;
  }, [location.pathname]);

  const [openSections, setOpenSections] = React.useState(() => {
    const map = {};
    sections.forEach((s, i) => (map[s.id] = i === 0));
    return map;
  });

  const [isScrolling, setIsScrolling] = React.useState(false);
  const [projOpen, setProjOpen] = React.useState(false);
  const [teamOpen, setTeamOpen] = React.useState(false);
  const scrollTimerRef = React.useRef(null);

  const [unreadCount, setUnreadCount] = React.useState(0);

  React.useEffect(() => {
    let mounted = true;
    api
      .get("/notifications")
      .then((res) => {
        if (mounted) setUnreadCount(res.unreadCount || 0);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, [location.pathname]);

  React.useEffect(() => {
    return () => {
      if (scrollTimerRef.current) window.clearTimeout(scrollTimerRef.current);
    };
  }, []);

  const handleScroll = () => {
    setIsScrolling(true);
    window.clearTimeout(scrollTimerRef.current);
    scrollTimerRef.current = window.setTimeout(() => {
      setIsScrolling(false);
    }, 180);
  };

  return (
    <nav
      className="fixed left-0 top-0 w-72 bg-black text-white h-screen border-r border-white/8 z-20 flex flex-col"
      aria-label="Main navigation">
      <div className="p-4 shrink-0">
        <div className="flex items-center gap-3 px-2 py-3">
          <BrandLogo
            to="/dashboard"
            imageClassName="h-8 sm:h-9 md:h-10 w-auto opacity-90"
          />
          <span className="ml-2 font-heading text-xl text-white/95 select-none">etrics</span>
        </div>

        <div className="mt-4 px-2">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setTeamOpen((p) => !p);
                setProjOpen(false);
              }}
              aria-expanded={teamOpen}
              className="flex items-center gap-2 text-xs text-white hover:text-white transition-colors min-w-0">
              <span className="truncate">
                {currentTeam?.name || teams[0]?.name || "Select a team"}
              </span>
              <ChevronDown
                className={`w-4 h-4 shrink-0 transition-transform ${teamOpen ? "rotate-180" : ""}`}
              />
            </button>
          </div>
          {teamOpen && (
            <div className="mt-2 bg-black rounded-md p-2 border border-white/6 max-h-48 overflow-y-auto">
              {teams.length === 0 && (
                <div className="text-sm text-gray-400">You are not on a team yet.</div>
              )}
              {teams.map((team) => (
                <button
                  key={team._id}
                  type="button"
                  onClick={() => {
                    setCurrentTeam(team._id);
                    setTeamOpen(false);
                    navigate("/dashboard");
                  }}
                  className={`w-full text-left px-2 py-2 rounded-md hover:bg-white/5 text-sm ${
                    String(currentTeam) === String(team._id)
                      ? "bg-white/8 text-white"
                      : "text-white/70"
                  }`}>
                  <div className="truncate">{team.name}</div>
                  <div className="text-[10px] uppercase tracking-wide text-white/35">
                    {team.role === "team_head" ? "Team Head" : "Developer"}
                  </div>
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setTeamOpen(false);
                  if (showModal) showModal(CreateTeamModal);
                }}
                className="w-full text-left px-2 py-2 rounded-md hover:bg-white/5 text-sm text-white/80 mt-1 border-t border-white/8">
                + Create team
              </button>
            </div>
          )}

          <div className="flex items-center justify-between mt-3">
            <button
              type="button"
              onClick={() => {
                setProjOpen((p) => !p);
                setTeamOpen(false);
              }}
              aria-expanded={projOpen}
              className="flex items-center gap-2 text-xs text-white/70 hover:text-white transition-colors min-w-0">
              <span className="truncate">
                {currentProject?.name || projects[0]?.name || "No project"}
              </span>
              <ChevronDown
                className={`w-4 h-4 shrink-0 transition-transform ${projOpen ? "rotate-180" : ""}`}
              />
            </button>
          </div>
          {projOpen && (
            <div className="mt-2 bg-black rounded-md p-2 border border-white/6 max-h-48 overflow-y-auto">
              {projects.length === 0 && (
                <div className="text-sm text-gray-400">No projects for this team.</div>
              )}
              {projects.map((p) => (
                <button
                  key={p._id}
                  type="button"
                  onClick={() => {
                    setCurrentProject(p);
                    setProjOpen(false);
                    navigate(`/projects/${p.slug || p._id}`);
                  }}
                  className={`w-full text-left px-2 py-2 rounded-md hover:bg-white/5 text-sm ${
                    currentProject?._id === p._id ? "bg-white/8 text-white" : "text-white/70"
                  }`}>
                  {p.name}
                </button>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              if (showModal) showModal(CreateTaskModal);
            }}
            disabled={!currentProject}
            className="w-full mt-3 bg-white text-black hover:bg-gray-200 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            + New Task
          </button>
        </div>
      </div>

      <div
        onScroll={handleScroll}
        className={`scrollbar-auto-hide ${isScrolling ? "scrolling" : ""} flex-1 min-h-0 overflow-y-auto px-4 pb-2 space-y-3`}>
        {sections.map((section) => {
          const visibleItems = section.items.filter((item) => {
            if (!item.requiresRole) return true;
            return isTeamHead();
          });
          if (visibleItems.length === 0) return null;

          return (
            <div key={section.id}>
              <button
                type="button"
                onClick={() =>
                  setOpenSections((prev) => ({
                    ...prev,
                    [section.id]: !prev[section.id],
                  }))
                }
                aria-expanded={openSections[section.id]}
                className="w-full flex items-center justify-between px-2 py-2 hover:bg-white/3 rounded-md">
                <span className="text-xs text-white/60">{section.label}</span>
                <ChevronDown
                  className={`w-4 h-4 text-white/60 transition-transform ${
                    openSections[section.id] ? "rotate-180" : ""
                  }`}
                />
              </button>

              <div
                className={`overflow-hidden transition-[max-height] duration-300 ${
                  openSections[section.id] ? "max-h-96 mt-1" : "max-h-0"
                }`}>
                <ul className="space-y-1 px-1">
                  {visibleItems.map((item) => (
                    <li key={item.id}>
                      <SidebarItem
                        id={item.id}
                        label={item.label}
                        to={item.to}
                        icon={item.icon}
                        badge={item.id === "notifications" && unreadCount ? unreadCount : undefined}
                        active={derivedActive === item.id}
                        onClick={(id) => onSelect && onSelect(id)}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      <div className="shrink-0">
        <SidebarProfile />
      </div>
    </nav>
  );
};

export default Sidebar;
