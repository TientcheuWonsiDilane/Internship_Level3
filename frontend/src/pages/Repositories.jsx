import React, { useEffect, useState } from "react";
import api from "../lib/api";

const Repositories = () => {
  const [repos, setRepos] = useState([]);

  useEffect(() => {
    let mounted = true;
    api
      .get("/repositories")
      .then((r) => mounted && setRepos(r))
      .catch(() => {});
    return () => (mounted = false);
  }, []);

  return (
    <div className="p-8">
      <h2 className="text-2xl font-semibold mb-4">Repositories</h2>
      <div className="space-y-3">
        {repos.length === 0 && (
          <div className="text-gray-600">No repositories found.</div>
        )}
        {repos.map((r) => (
          <div key={r._id} className="p-3 bg-white rounded-lg shadow-sm">
            <div className="font-medium">{r.name}</div>
            <div className="text-sm text-gray-500">{r.provider}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Repositories;
