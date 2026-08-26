import React from "react";
import { initialsOf } from "../lib/workspace";

const UserAvatar = ({ name, src, size = "md" }) => {
  const sizes = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-11 h-11 text-sm",
  };

  if (src) {
    return (
      <img
        src={src}
        alt={name || "User"}
        className={`${sizes[size]} rounded-full object-cover border border-white/10`}
      />
    );
  }

  return (
    <div
      className={`${sizes[size]} rounded-full bg-[#7c5cbf] text-white flex items-center justify-center font-semibold shrink-0`}>
      {initialsOf(name)}
    </div>
  );
};

export default UserAvatar;
