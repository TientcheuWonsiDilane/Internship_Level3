import React from "react";
import PageShell from "../components/PageShell";
import UserAvatar from "../components/UserAvatar";
import api from "../lib/api";
import { asList } from "../lib/workspace";

const Users = () => {
  const [users, setUsers] = React.useState([]);

  React.useEffect(() => {
    api
      .get("/users")
      .then((u) => setUsers(asList(u, "users")))
      .catch(() => setUsers([]));
  }, []);

  return (
    <PageShell title="Users" subtitle="People registered on this Matrix instance">
      <div className="space-y-2">
        {users.map((user) => (
          <div
            key={user._id}
            className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.03] p-3">
            <UserAvatar name={user.username || user.email} src={user.avatarUrl} />
            <div>
              <div className="font-medium">{user.username || user.email}</div>
              <div className="text-sm text-white/40">{user.email}</div>
            </div>
          </div>
        ))}
        {users.length === 0 && <p className="text-sm text-white/40">No users found.</p>}
      </div>
    </PageShell>
  );
};

export default Users;
