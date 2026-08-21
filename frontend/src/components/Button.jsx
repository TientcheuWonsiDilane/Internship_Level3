import React from "react";

const Button = ({ type = "default", title, onClick, className = "" }) => {
  const base =
    "relative inline-flex items-center justify-center px-4 py-2 rounded-full font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 transition overflow-hidden";
  if (type === "white") {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`group ${base} bg-white text-black shadow-[0_10px_40px_rgba(255,255,255,0.06)] hover:shadow-[0_20px_80px_rgba(255,255,255,0.08)] hover:-translate-y-0.5 duration-150 focus-visible:ring-white/60 ${className}`}
        aria-label={title}>
        <span
          className="pointer-events-none absolute top-0 right-0 h-full w-3 md:w-4 rounded-l-full bg-gradient-to-b from-white/90 via-white/60 to-transparent blur-md opacity-90 transform translate-x-1 transition-all group-hover:translate-x-0 group-hover:opacity-100 mix-blend-screen"
          aria-hidden="true"
        />
        {title}
      </button>
    );
  }

  if (type === "outline" || type === "glow") {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`group ${base} bg-transparent text-white border border-white/20 hover:border-white/40 shadow-[0_8px_40px_rgba(255,255,255,0.04)] hover:shadow-[0_18px_80px_rgba(255,255,255,0.06)] focus-visible:ring-white/40 ${className}`}
        aria-label={title}>
        <span
          className="pointer-events-none absolute top-0 right-0 h-full w-3 md:w-4 rounded-l-full bg-gradient-to-b from-white/90 via-white/50 to-transparent blur-md opacity-75 transform translate-x-1 transition-all group-hover:translate-x-0 group-hover:opacity-100 mix-blend-screen"
          aria-hidden="true"
        />
        {title}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${base} px-3 py-2 bg-[#4c1d95] text-white hover:bg-[#3b1063] shadow-[0_12px_48px_rgba(255,255,255,0.04)] ${className}`}
      aria-label={title}>
      {title}
    </button>
  );
};

export default Button;
