import React from "react";

const PageShell = ({ title, subtitle, actions, children }) => {
  React.useEffect(() => {
    // PageShell toggles the scrollbar-visible class on mount and unmount
    const start = () => {
      document.documentElement.classList.add("scrolling");
      document.body.classList.add("scrolling");
    };
    const stop = () => {
      document.documentElement.classList.remove("scrolling");
      document.body.classList.remove("scrolling");
    };
    // Keep initial state consistent; global listener is in App.jsx
    start();
    const t = window.setTimeout(stop, 300);
    return () => {
      window.clearTimeout(t);
      stop();
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#050506] text-white px-6 py-8 md:px-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-heading tracking-tight">{title}</h1>
          {subtitle && (
            <p className="text-sm text-white/50 mt-2 max-w-2xl">{subtitle}</p>
          )}
        </div>
        {actions ? <div className="flex items-center gap-2 shrink-0">{actions}</div> : null}
      </div>
      {children}
    </div>
  );
};

export default PageShell;
