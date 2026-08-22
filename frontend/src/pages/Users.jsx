import React, { useEffect, useState } from "react";
import api from "../lib/api";

const Users = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    let mounted = true;
    api
      .get("/users")
      .then((u) => mounted && setUsers(u))
      .catch(() => {});
    return () => (mounted = false);
  }, []);

  return (
    <div className="p-8">
      <h2 className="text-2xl font-semibold mb-4">Users</h2>
      <div className="grid grid-cols-1 gap-3">
        {users.length === 0 && (
          <div className="text-gray-600">No users found.</div>
        )}
        {users.map((user) => (
          <div
            key={user._id}
            className="p-3 bg-white rounded-lg shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
              {(user.name || user.email || "").charAt(0)}
            </div>
            <div>
              <div className="font-medium">{user.name || user.email}</div>
              <div className="text-sm text-gray-500">
                {user.role || "Member"}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Users;
