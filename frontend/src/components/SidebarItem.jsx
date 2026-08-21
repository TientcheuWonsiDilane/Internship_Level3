import React from "react";
import { NavLink } from "react-router-dom";

const SidebarItem = ({ id, label, to, icon: Icon, badge, active, onClick }) => {
  const base =
    "relative flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors overflow-hidden";
  const activeCls =
    "bg-gradient-to-r from-[#4c1d95] to-[#6f3ce6] text-white shadow-[0_6px_24px_rgba(79,70,229,0.16)]";
  const normalCls = "text-gray-200 hover:bg-white/3";

  const content = (
    <div className="flex gap-2 justify-center items-center">
      {Icon && (
        <span className="w-9 h-9 flex items-center justify-center text-sm rounded-md bg-white/5 text-white/90">
          <Icon className="w-4 h-4" />
        </span>
      )}
      <span className="flex-1 text-left truncate">{label}</span>
      {badge && (
        <span className="text-xs bg-white/6 px-2 py-0.5 rounded-md">
          {badge}
        </span>
      )}
    </div>
  );

  const LeftAccent = () => (
    <span
      className="absolute left-0 top-1/2 -translate-y-1/2 h-10 w-1.5 rounded-r-md bg-white/80 shadow-[0_6px_24px_rgba(79,70,229,0.14)]"
      aria-hidden="true"
    />
  );

  if (to) {
    return (
      <NavLink
        to={to}
        className={({ isActive }) =>
          `${base} ${isActive || active ? activeCls : normalCls}`
        }
        onClick={() => onClick && onClick(id)}>
        {({ isActive }) => (
          <>
            {(isActive || active) && <LeftAccent />}
            <span aria-current={isActive || active ? "page" : undefined}>
              {content}
            </span>
          </>
        )}
      </NavLink>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onClick && onClick(id)}
      className={`${base} ${active ? activeCls : normalCls}`}
      aria-current={active ? "page" : undefined}>
      {active && <LeftAccent />}
      {content}
    </button>
  );
};

export default SidebarItem;
