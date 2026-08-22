import React from "react";
import sections from "./sidebarItems.js";
import { useLocation } from "react-router-dom";
import SidebarItem from "./SidebarItem";
import { ChevronDown, LogOut, Settings, User } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useModal } from "../context/ModalContext";
import CreateTaskModal from "./modals/CreateTaskModal";
import api from "../lib/api";
import BrandLogo from "./BrandLogo";

const Sidebar = ({ activeId, onSelect }) => {
  const location = useLocation();

  const derivedActive = React.useMemo(() => {
    const all = sections.flatMap((s) => s.items || []);
    const match = all.find((i) => i.to && location.pathname.startsWith(i.to));
    return match ? match.id : null;
  }, [location.pathname]);

  const [openSections, setOpenSections] = React.useState(() => {
    const map = {};
    sections.forEach((s, i) => (map[s.id] = i === 0));
    return map;
  });

  const [profileOpen, setProfileOpen] = React.useState(false);
  const [isScrolling, setIsScrolling] = React.useState(false);
  const { user, currentTeam, isTeamHead, logout } = useAuth();
  const navigate = useNavigate();

  const [projects, setProjects] = React.useState([]);
  const [projOpen, setProjOpen] = React.useState(false);
  const { showModal } = useModal();
  const scrollTimerRef = React.useRef(null);

  React.useEffect(() => {
    let mounted = true;
    if (!currentTeam) return;
    api
      .get(`/projects?teamId=${currentTeam}`)
      .then((data) => mounted && setProjects(data))
      .catch(() => {})
      .finally(() => {});
    return () => (mounted = false);
  }, [currentTeam]);

  React.useEffect(() => {
    return () => {
      if (scrollTimerRef.current) {
        window.clearTimeout(scrollTimerRef.current);
      }
    };
  }, []);

  const handleScroll = () => {
    setIsScrolling(true);
    window.clearTimeout(scrollTimerRef.current);
    scrollTimerRef.current = window.setTimeout(() => {
      setIsScrolling(false);
    }, 180);
  };

  const displayName = user?.username || user?.name || "Workspace User";
  const displayEmail = user?.email || "team member";
  const displayRole = (user?.role || "member").replaceAll("_", " ");
  const initials =
    displayName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "U";

  return (
    <nav
      className="fixed left-0 top-0 w-72 bg-black text-white h-screen border-r border-white/8 z-20 flex flex-col justify-between"
      aria-label="Main navigation">
      <div className="p-4">
        <div className="flex items-center gap-3 px-2 py-3">
          <BrandLogo
            to="/workspace"
            imageClassName="h-8 sm:h-9 md:h-10 w-auto opacity-90"
          />
        </div>

        <div className="mt-6 px-2">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setProjOpen((p) => !p)}
              className="flex items-center gap-2 text-xs text-white/70">
              <span>
                {projects.length ? projects[0].name : "Titan Project"}
              </span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${projOpen ? "rotate-180" : ""}`}
              />
            </button>
            <button className="text-xs bg-white/6 px-3 py-1 rounded-lg">
              ⋯
            </button>
          </div>
          {projOpen && (
            <div className="mt-2 bg-black rounded-md p-2 border border-white/6">
              {projects.length === 0 && (
                <div className="text-sm text-gray-400">
                  No projects for this team.
                </div>
              )}
              {projects.map((p) => (
                <button
                  key={p._id}
                  onClick={() => navigate(`/projects/${p.slug || p._id}`)}
                  className="w-full text-left px-2 py-2 rounded-md hover:bg-white/3">
                  {p.name}
                </button>
              ))}
            </div>
          )}

          <button
            onClick={() => {
              if (showModal) showModal(CreateTaskModal);
            }}
            className="w-full mt-3 bg-white text-black hover:bg-gray-200 px-4 py-2 rounded-lg font-medium transition-colors">
            + New Task
          </button>
        </div>

        <div className="mt-6 pt-4 border-t border-white/3">
          <div
            onScroll={handleScroll}
            className={`scrollbar-auto-hide ${isScrolling ? "scrolling" : ""} h-[calc(100vh-240px)] overflow-y-auto p-2 space-y-3`}>
            {sections.map((section) => (
              <div key={section.id}>
                <button
                  type="button"
                  onClick={() =>
                    setOpenSections((prev) => ({
                      ...prev,
                      [section.id]: !prev[section.id],
                    }))
                  }
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
                    openSections[section.id] ? "max-h-96 mt-2" : "max-h-0"
                  }`}>
                  <ul className="space-y-1 px-2">
                    {section.items
                      .filter((item) => {
                        if (!item.requiresRole) return true;
                        return isTeamHead();
                      })
                      .map((item) => (
                        <li key={item.id}>
                          <SidebarItem
                            id={item.id}
                            label={item.label}
                            to={item.to}
                            icon={item.icon}
                            active={derivedActive === item.id}
                            onClick={(id) => onSelect && onSelect(id)}
                          />
                        </li>
                      ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {user && (
        <div className="p-4 border-t border-white/8 bg-black">
          <div className="relative">
            <button
              type="button"
              onClick={() => setProfileOpen((s) => !s)}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl border border-white/8 bg-white/3 hover:bg-white/6 transition-colors">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={displayName}
                  className="w-11 h-11 rounded-full object-cover border border-white/20"
                />
              ) : (
                <div className="w-11 h-11 rounded-full bg-white text-black flex items-center justify-center font-semibold text-sm">
                  {initials}
                </div>
              )}
              <div className="flex-1 text-left">
                <div className="text-sm font-semibold capitalize">
                  {displayName}
                </div>
                <div className="text-xs text-white/60 capitalize">
                  {displayRole}
                </div>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-white/70 transition-transform ${profileOpen ? "rotate-180" : ""}`}
              />
            </button>

            {profileOpen && (
              <div className="mt-2 bg-black border border-white/8 rounded-xl shadow-md p-2">
                <div className="px-3 py-2 text-xs text-white/45 truncate">
                  {displayEmail}
                </div>
                <button
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-white/90 rounded-md hover:bg-white/5"
                  onClick={() => {
                    setProfileOpen(false);
                    navigate("/profile");
                  }}>
                  <User className="w-4 h-4" />
                  <span>My Profile</span>
                </button>
                <button
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-white/90 rounded-md hover:bg-white/3"
                  onClick={() => setProfileOpen(false)}>
                  <FaGithub className="w-4 h-4" />
                  <span>My GitHub Profile</span>
                </button>
                <button
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-white/90 rounded-md hover:bg-white/3 mt-1"
                  onClick={() => setProfileOpen(false)}>
                  <Settings className="w-4 h-4" />
                  <span>Account Settings</span>
                </button>
                <button
                  onClick={() => logout()}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-500 rounded-md hover:bg-white/5 mt-1">
                  <LogOut className="w-4 h-4" />
                  <span>Log out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Sidebar;
