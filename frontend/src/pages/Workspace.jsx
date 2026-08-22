import React from "react";

const Workspace = () => {
  return (
    <div className="p-8">
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-2">Workspace Preview</h2>
        <img
          src="/src/pages/workspace.png"
          alt="workspace preview"
          className="w-full rounded-md shadow-sm"
        />
      </div>
    </div>
  );
};

export default Workspace;
