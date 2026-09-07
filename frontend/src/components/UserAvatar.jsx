import React from "react";
import { initialsOf } from "../lib/workspace";

const PALETTE = [
  "#7c5cbf",
  "#e07a5f",
  "#2a9d8f",
  "#f2c94c",
  "#56ccf2",
  "#f2994a",
  "#9b5de5",
  "#00b395",
];

function hashString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

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

  const base = String(name || "");
  const color = PALETTE[hashString(base) % PALETTE.length];

  return (
    <div
      className={`${sizes[size]} rounded-full text-white flex items-center justify-center font-semibold shrink-0`}
      style={{ backgroundColor: color }}>
      {initialsOf(name)}
    </div>
  );
};

export default UserAvatar;
