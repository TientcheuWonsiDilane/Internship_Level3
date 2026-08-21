import React from "react";
import sections from "./sidebarItems.js";
import { useLocation } from "react-router-dom";
import SidebarItem from "./SidebarItem";
import { ChevronDown, LogOut, ExternalLink, Settings } from "lucide-react";

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

  return (
    <nav
      className="fixed left-0 top-0 w-72 bg-[#06040a] text-white h-screen border-r border-white/6 z-20 flex flex-col justify-between"
      aria-label="Main navigation">
      <style>{`.sidebar-scroll::-webkit-scrollbar{width:8px}.sidebar-scroll::-webkit-scrollbar-track{background:transparent}.sidebar-scroll::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.06);border-radius:999px;border:2px solid transparent;background-clip:padding-box}.sidebar-scroll::-webkit-scrollbar-thumb:hover{background:rgba(255,255,255,0.12)}@supports (scrollbar-color: auto){.sidebar-scroll{scrollbar-width:thin;scrollbar-color:rgba(255,255,255,0.06) transparent}}`}</style>
      <div className="p-4">
        <div className="flex items-center gap-3 px-2 py-3">
          <div className="w-10 h-10 rounded-md bg-gradient-to-br from-[#6f3ce6] to-[#4c1d95] flex items-center justify-center font-bold">
            M
          </div>
          <div>
            <div className="text-sm font-semibold">Metrix</div>
            <div className="text-xs text-white/60">Team Head</div>
          </div>
        </div>

        <div className="mt-6 px-2">
          <div className="flex items-center justify-between">
            <div className="text-xs text-white/70">Titan Project</div>
            <button className="text-xs bg-white/6 px-3 py-1 rounded-lg">
              ⋯
            </button>
          </div>
          <button className="w-full mt-3 bg-gradient-to-r from-[#6f3ce6] to-[#4c1d95] text-white px-4 py-2 rounded-lg font-medium">
            + New Task
          </button>
        </div>

        <div className="mt-6 pt-4 border-t border-white/3">
          <div className="h-[calc(100vh-240px)] overflow-y-auto sidebar-scroll p-2 space-y-3">
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
                    {section.items.map((item) => (
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

      <div className="p-4 border-t border-white/6">
        <div className="relative">
          <button
            type="button"
            onClick={() => setProfileOpen((s) => !s)}
            className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6f3ce6] to-[#4c1d95] flex items-center justify-center font-medium">
              AD
            </div>
            <div className="flex-1 text-left">
              <div className="text-sm font-medium">Alex Dev</div>
              <div className="text-xs text-white/60">Team Head</div>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-white/70 transition-transform ${profileOpen ? "rotate-180" : ""}`}
            />
          </button>

          {profileOpen && (
            <div className="mt-2 bg-[#0b0710] rounded-lg shadow-md p-2">
              <button
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-white/90 rounded-md hover:bg-white/3"
                onClick={() => setProfileOpen(false)}>
                <ExternalLink className="w-4 h-4" />
                <span>My GitHub Profile</span>
              </button>
              <button
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-white/90 rounded-md hover:bg-white/3 mt-1"
                onClick={() => setProfileOpen(false)}>
                <Settings className="w-4 h-4" />
                <span>Account Settings</span>
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-500 rounded-md hover:bg-white/5 mt-1">
                <LogOut className="w-4 h-4" />
                <span>Log out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Sidebar;
