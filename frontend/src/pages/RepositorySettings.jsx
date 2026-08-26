import React from "react";
import { useAuth } from "../context/AuthContext";
import PageShell from "../components/PageShell";
import api from "../lib/api";
import { asItem, formatDate } from "../lib/workspace";

const EVENT_OPTIONS = ["push", "pull_request", "issues", "workflow_run"];

const RepositorySettings = () => {
  const { currentProject, isTeamHead } = useAuth();
  const [repo, setRepo] = React.useState(null);
  const [autoLinkEnabled, setAutoLinkEnabled] = React.useState(true);
  const [events, setEvents] = React.useState(EVENT_OPTIONS);
  const [message, setMessage] = React.useState("");
  const [error, setError] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  const load = React.useCallback(async () => {
    if (!currentProject?._id) {
      setRepo(null);
      return;
    }
    try {
      const res = await api.get(`/repositories/project/${currentProject._id}`);
      const connected = asItem(res, "repository");
      setRepo(connected);
      if (!connected?._id) return;
      const settingsRes = await api.get(`/repositories/${connected._id}/settings`);
      const settings = settingsRes.settings || connected.settings || {};
      setAutoLinkEnabled(settings.autoLinkEnabled !== false);
      setEvents(
        Array.isArray(settings.events) && settings.events.length
          ? settings.events
          : EVENT_OPTIONS,
      );
    } catch {
      setRepo(null);
    }
  }, [currentProject?._id]);

  React.useEffect(() => {
    load();
  }, [load]);

  const save = async (e) => {
    e.preventDefault();
    if (!repo?._id) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await api.patch(`/repositories/${repo._id}/settings`, {
        autoLinkEnabled,
        events,
      });
      setMessage("Settings saved.");
    } catch (err) {
      setError(err.body?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  const disconnect = async () => {
    if (!repo?._id) return;
    try {
      await api.del(`/repositories/disconnect/${repo._id}`);
      setMessage("Repository disconnected.");
      await load();
    } catch (err) {
      setError(err.body?.message || err.message);
    }
  };

  const toggleEvent = (name) => {
    setEvents((prev) =>
      prev.includes(name) ? prev.filter((e) => e !== name) : [...prev, name],
    );
  };

  return (
    <PageShell
      title="Repository Settings"
      subtitle={
        currentProject
          ? `Webhook events and auto-linking for ${currentProject.name}`
          : "Select a project first"
      }>
      {!repo && (
        <p className="text-sm text-white/45">
          No repository is connected to this project. Use GitHub Sync to link one.
        </p>
      )}
      {repo && (
        <form
          onSubmit={save}
          className="rounded-xl border border-white/8 bg-white/[0.03] p-5 max-w-lg space-y-4">
          <div>
            <div className="font-medium">{repo.fullName}</div>
            <div className="text-sm text-white/40">
              Default branch {repo.defaultBranch || "main"} · last synced{" "}
              {formatDate(repo.lastSyncedAt)}
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={autoLinkEnabled}
              onChange={(e) => setAutoLinkEnabled(e.target.checked)}
              disabled={!isTeamHead()}
            />
            Auto-link tasks from commit messages and PR titles
          </label>
          <div>
            <div className="text-sm text-white/50 mb-2">Subscribed webhook events</div>
            <div className="space-y-2">
              {EVENT_OPTIONS.map((name) => (
                <label key={name} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={events.includes(name)}
                    onChange={() => toggleEvent(name)}
                    disabled={!isTeamHead()}
                  />
                  {name}
                </label>
              ))}
            </div>
          </div>
          {isTeamHead() && (
            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-white text-black text-sm font-semibold">
                {saving ? "Saving…" : "Save settings"}
              </button>
              <button
                type="button"
                onClick={disconnect}
                className="px-4 py-2 rounded-lg border border-red-500/40 text-red-400 text-sm hover:bg-red-500/10">
                Disconnect repository
              </button>
            </div>
          )}
        </form>
      )}
      {message && <p className="mt-4 text-sm text-emerald-400">{message}</p>}
      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
    </PageShell>
  );
};

export default RepositorySettings;
