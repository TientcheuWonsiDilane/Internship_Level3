import Task from "../models/TaskModel.js";
import Project from "../models/ProjectModel.js";
import Repository from "../models/RepositoryModel.js";

/**
 * Task auto-linking.
 *
 * A task can be referenced from a commit message or a pull-request title/body
 * by embedding its 24-hex ObjectId (e.g. "Fixes 5f8c9d2e1b7a4c0e9d8f6a2b").
 * The branch name produced by `claimTicket` (`task-<id>-slug`) is also a valid
 * reference source, so pushing to a claimed task's branch is recognised too.
 *
 * Status automation (per spec §9.5):
 *   - `pull_request` opened / reopened -> linked tasks move to `in_review`
 *   - `pull_request` closed AND merged   -> linked tasks move to `done`
 *   - `push` with a task ref             -> linked tasks in `todo` move to `in_progress`
 */

const TASK_REF_RE = /\b[0-9a-f]{24}\b/g;

/** Extract unique 24-hex task ids that appear in the given text. */
export function extractTaskReferences(...texts) {
  const ids = new Set();
  for (const raw of texts) {
    if (!raw) continue;
    const text = String(raw);
    const matches = text.match(TASK_REF_RE);
    if (matches) {
      for (const m of matches) ids.add(m);
    }
  }
  return Array.from(ids);
}

/** Resolve references that actually belong to tasks in the same project. */
export async function resolveLinkedTasks(references, projectId) {
  if (!references?.length || !projectId) return [];
  const tasks = await Task.find({
    _id: { $in: references },
    projectId,
  }).select("_id title status projectId");
  return tasks;
}

async function getProjectForRepository(repositoryId) {
  const repo = await Repository.findById(repositoryId).select("projectId").lean();
  return repo?.projectId || null;
}

/** Apply push-based automation: todo -> in_progress for referenced tasks. */
export async function applyPushLink(references, repositoryId) {
  const projectId = await getProjectForRepository(repositoryId);
  if (!projectId) return [];
  const tasks = await resolveLinkedTasks(references, projectId);
  const updated = [];
  for (const task of tasks) {
    if (task.status === "todo") {
      task.status = "in_progress";
      await task.save(); // task:updated/moved hook broadcasts the change
      updated.push(task);
    }
  }
  return updated;
}

/** Apply PR-based automation. `merged` moves to done; otherwise open -> in_review. */
export async function applyPullRequestLink(references, repositoryId, { merged }) {
  const projectId = await getProjectForRepository(repositoryId);
  if (!projectId) return [];
  const tasks = await resolveLinkedTasks(references, projectId);
  const updated = [];
  const targetStatus = merged ? "done" : "in_review";
  for (const task of tasks) {
    if (task.status !== "done" && task.status !== targetStatus) {
      task.status = targetStatus;
      await task.save();
      updated.push(task);
    }
  }
  return updated;
}

export default {
  extractTaskReferences,
  resolveLinkedTasks,
  applyPushLink,
  applyPullRequestLink,
};
