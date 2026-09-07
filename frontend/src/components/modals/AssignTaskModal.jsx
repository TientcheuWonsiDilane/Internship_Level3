import React, { useState, useEffect } from "react";
import api from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import UserAvatar from "../UserAvatar";

const AssignTaskModal = ({ taskId, close }) => {
  const { currentProject } = useAuth();
  const [members, setMembers] = useState([]);
  const [assignee, setAssignee] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get(`/projects/${currentProject._id}/members`);
        // expect res.members or res.data.members
        const list = res.members || res.data?.members || res.data || [];
        if (mounted) setMembers(list || []);
      } catch (e) {
        console.error(e);
      }
    })();
    return () => (mounted = false);
  }, [currentProject?._id]);

  const submit = async () => {
    setLoading(true);
    setError("");
    try {
      if (!assignee) throw new Error("Select a member to assign");
      await api.put(`/tasks/assignee/${taskId}`, { assignedTo: assignee });
      window.dispatchEvent(new Event("matrix:refresh-tasks"));
      close();
    } catch (e) {
      setError(e.body?.message || e.message || "Failed to assign task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-white p-4 bg-black min-w-[340px]">
      <h3 className="text-lg font-bold mb-2">Assign Task</h3>
      <p className="text-sm text-gray-400 mb-4">Choose a team member to assign this task to.</p>
      {error && <div className="mb-3 text-sm text-red-400">{error}</div>}

      <div className="space-y-2 max-h-64 overflow-auto pr-2">
        <button
          type="button"
          onClick={() => setAssignee("")}
          className={`w-full text-left p-2 rounded-lg flex items-center gap-3 ${assignee === "" ? "bg-white/5" : "hover:bg-white/3"}`}>
          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-sm text-white">-</div>
          <div className="flex-1 text-sm">Unassigned</div>
        </button>

        {members.map((m) => {
          const user = m.user || m; // controller returns { membershipId, role, user }
          const userId = user._id || user.id;
          return (
            <button
              type="button"
              key={userId}
              onClick={() => setAssignee(userId)}
              className={`w-full text-left p-2 rounded-lg flex items-center gap-3 ${assignee === userId ? "bg-white/5" : "hover:bg-white/3"}`}>
              <UserAvatar name={user.name || user.username} src={user.avatarUrl || user.avatar} size="md" />
              <div className="flex-1">
                <div className="text-sm font-medium">{user.name || user.username}</div>
                {m.role && <div className="text-xs text-gray-400">{m.role}</div>}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex justify-end gap-2 pt-3">
        <button onClick={close} className="px-3 py-2 rounded-lg text-sm text-gray-300">Cancel</button>
        <button onClick={submit} disabled={loading} className="px-3 py-2 rounded-lg bg-white text-black text-sm font-semibold">
          {loading ? "Assigning..." : "Assign"}
        </button>
      </div>
    </div>
  );
};

export default AssignTaskModal;
