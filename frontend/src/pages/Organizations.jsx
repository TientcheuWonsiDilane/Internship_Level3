import React, { useEffect, useState } from "react";
import api from "../lib/api";

const Organizations = () => {
  const [orgs, setOrgs] = useState([]);

  useEffect(() => {
    let mounted = true;
    api
      .get("/organizations")
      .then((r) => mounted && setOrgs(r))
      .catch(() => {});
    return () => (mounted = false);
  }, []);

  return (
    <div className="p-8">
      <h2 className="text-2xl font-semibold mb-4">Organizations</h2>
      <div className="space-y-3">
        {orgs.length === 0 && (
          <div className="text-gray-600">No organizations yet.</div>
        )}
        {orgs.map((o) => (
          <div key={o._id} className="p-3 bg-white rounded-lg shadow-sm">
            <div className="font-medium">{o.name}</div>
            <div className="text-sm text-gray-500">{o.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Organizations;
