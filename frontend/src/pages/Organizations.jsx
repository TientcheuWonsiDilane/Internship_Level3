import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useModal } from "../context/ModalContext";
import CreateOrganizationModal from "../components/modals/CreateOrganizationModal";
import PageShell from "../components/PageShell";
import api from "../lib/api";
import { asList } from "../lib/workspace";

const Organizations = () => {
  const { user } = useAuth();
  const { showModal } = useModal();
  const [orgs, setOrgs] = React.useState([]);

  React.useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await api.get("/organizations");
        if (mounted) setOrgs(asList(res, "organizations", "message"));
      } catch {
        if (user?.id || user?._id) {
          try {
            const res = await api.get(`/organizations/my-organizations/${user.id || user._id}`);
            if (mounted) setOrgs(asList(res, "organizations", "message"));
          } catch {
            if (mounted) setOrgs([]);
          }
        }
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [user]);

  return (
    <PageShell
      title="Organizations"
      subtitle="Optional grouping for teams. A team works the same with or without one."
      actions={
        <button
          type="button"
          onClick={() => showModal(CreateOrganizationModal)}
          className="px-4 py-2 rounded-lg bg-white text-black text-sm font-semibold">
          New organization
        </button>
      }>
      <div className="space-y-3">
        {orgs.map((o) => (
          <Link
            key={o._id}
            to={`/organizations/${o._id}`}
            className="block rounded-xl border border-white/8 bg-white/[0.03] p-4 hover:bg-white/5">
            <div className="font-medium">{o.name}</div>
            <div className="text-sm text-white/40">{o.description}</div>
          </Link>
        ))}
        {orgs.length === 0 && (
          <p className="text-sm text-white/40">No organizations yet.</p>
        )}
      </div>
    </PageShell>
  );
};

export default Organizations;
