import React, { useEffect, useState } from "react";
import api from "../lib/api";

const Dashboard = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    let mounted = true;
    api
      .get("/dashboard/stats")
      .then((s) => mounted && setStats(s))
      .catch(() => {});
    return () => (mounted = false);
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-4">Dashboard</h1>
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-lg shadow-sm">
          <div className="text-sm text-gray-500">Projects</div>
          <div className="text-xl font-bold">
            {stats ? stats.projects : "—"}
          </div>
        </div>
        <div className="p-4 bg-white rounded-lg shadow-sm">
          <div className="text-sm text-gray-500">Teams</div>
          <div className="text-xl font-bold">{stats ? stats.teams : "—"}</div>
        </div>
        <div className="p-4 bg-white rounded-lg shadow-sm">
          <div className="text-sm text-gray-500">Tasks</div>
          <div className="text-xl font-bold">{stats ? stats.tasks : "—"}</div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
