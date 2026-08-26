import React from "react";
import { useParams } from "react-router-dom";
import PageShell from "../components/PageShell";
import api from "../lib/api";
import { asItem } from "../lib/workspace";

const Organization = () => {
  const { id } = useParams();
  const [org, setOrg] = React.useState(null);

  React.useEffect(() => {
    let mounted = true;
    api
      .get("/organizations")
      .then((res) => {
        const list = Array.isArray(res) ? res : res?.organizations || res?.message || [];
        const found = (Array.isArray(list) ? list : []).find((o) => String(o._id) === String(id));
        if (mounted) setOrg(found || asItem(res, "organization"));
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, [id]);

  return (
    <PageShell title={org?.name || "Organization"} subtitle={org?.description}>
      <div className="rounded-xl border border-white/8 bg-white/[0.03] p-5 text-sm text-white/50">
        Organizations group teams for navigation. Membership and permissions still live on each team.
      </div>
    </PageShell>
  );
};

export default Organization;
