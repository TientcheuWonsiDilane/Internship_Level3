import React, { useEffect, useState } from "react";
import api from "../lib/api";

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    api
      .get("/projects")
      .then((res) => mounted && setProjects(res))
      .catch(() => {})
      .finally(() => mounted && setLoading(false));
    return () => (mounted = false);
  }, []);

  return (
    <div className="p-8">
      <h2 className="text-2xl font-semibold mb-4">Projects</h2>
      {loading ? (
        <div className="text-sm text-gray-500">Loading…</div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {projects.length === 0 && (
            <div className="text-gray-600">No projects yet.</div>
          )}
          {projects.map((p) => (
            <div key={p._id} className="p-4 bg-white rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{p.name}</div>
                  <div className="text-sm text-gray-500">{p.description}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Projects;
