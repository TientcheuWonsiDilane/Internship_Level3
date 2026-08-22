import React, { useEffect, useState } from "react";
import api from "../lib/api";

const Teams = () => {
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    let mounted = true;
    api
      .get("/teams")
      .then((t) => mounted && setTeams(t))
      .catch(() => {});
    return () => (mounted = false);
  }, []);

  return (
    <div className="p-8">
      <h2 className="text-2xl font-semibold mb-4">Teams</h2>
      <div className="space-y-3">
        {teams.length === 0 && (
          <div className="text-gray-600">No teams yet.</div>
        )}
        {teams.map((t) => (
          <div key={t._id} className="p-3 bg-white rounded-lg shadow-sm">
            <div className="font-medium">{t.name}</div>
            <div className="text-sm text-gray-500">{t.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Teams;
