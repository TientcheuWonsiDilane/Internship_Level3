import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronUp, LogOut, SlidersHorizontal, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { roleLabel } from "../lib/workspace";
import UserAvatar from "./UserAvatar";

const SidebarProfile = () => {
  const { user, isTeamHead, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef(null);

  React.useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const handleKey = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  if (!user) return null;

  const displayName = user.username || user.name || "Workspace User";
  const displayRole = isTeamHead() ? "team_head" : "developer";
  const githubUrl = user.username
    ? `https://github.com/${user.username}`
    : null;

  const goToSettings = () => {
    setOpen(false);
    navigate("/profile");
  };

  const openGitHub = () => {
    setOpen(false);
    if (githubUrl) {
      window.open(githubUrl, "_blank", "noopener,noreferrer");
    } else {
      navigate("/profile");
    }
  };

  return (
    <div ref={rootRef} className="p-3 border-t border-white/8 bg-black">
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="w-full flex items-center gap-3 px-1 py-2 rounded-lg hover:bg-white/4 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30">
        <UserAvatar name={displayName} src={user.avatarUrl} size="lg" />
        <div className="flex-1 text-left min-w-0">
          <div className="text-sm font-semibold text-white truncate">
            {displayName}
          </div>
          <span className="mt-1 inline-flex items-center rounded-md bg-[#3a2a55] px-2 py-0.5 text-[11px] font-medium text-[#c4b0e8]">
            {roleLabel(displayRole)}
          </span>
        </div>
        <ChevronUp
          className={`w-4 h-4 text-white/55 shrink-0 transition-transform ${open ? "" : "rotate-180"}`}
        />
      </button>

      {open && (
        <div role="menu" className="mt-2 space-y-0.5">
          <button
            type="button"
            role="menuitem"
            onClick={openGitHub}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-white rounded-lg bg-white/8 hover:bg-white/12 transition-colors">
            <User className="w-4 h-4" />
            <span>My GitHub Profile</span>
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={goToSettings}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-white/55 rounded-lg hover:bg-white/5 hover:text-white/80 transition-colors">
            <SlidersHorizontal className="w-4 h-4" />
            <span>Account Settings</span>
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              logout();
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-500 rounded-lg hover:bg-red-500/10 transition-colors">
            <LogOut className="w-4 h-4" />
            <span>Log out</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default SidebarProfile;
