import React, { useEffect, useState } from "react";
import api from "../lib/api";

const Profile = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    let mounted = true;
    api
      .get("/me")
      .then((u) => mounted && setUser(u))
      .catch(() => {});
    return () => (mounted = false);
  }, []);

  return (
    <div className="p-8">
      <h2 className="text-2xl font-semibold mb-4">My Profile</h2>
      {!user ? (
        <div className="text-gray-500">Loading…</div>
      ) : (
        <div className="grid grid-cols-2 gap-6">
          <div className="p-4 bg-white rounded-lg shadow-sm">
            <div className="font-medium text-lg">{user.name || user.email}</div>
            <div className="text-sm text-gray-500">{user.email}</div>
          </div>
          <div className="p-4 bg-white rounded-lg shadow-sm">
            <div className="text-sm text-gray-500">Role</div>
            <div className="font-medium">{user.role || "Member"}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
