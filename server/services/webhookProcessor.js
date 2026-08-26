import Repository from "../models/RepositoryModel.js";
import Project from "../models/ProjectModel.js";
import Task from "../models/TaskModel.js";
import Branch from "../models/BranchModel.js";
import Commit from "../models/CommitModel.js";
import PullRequest from "../models/PullRequestModel.js";
import { logActivity } from "./activityService.js";
import { createNotification } from "./notificationService.js";
import {
  extractTaskReferences,
  applyPushLink,
  applyPullRequestLink,
} from "./taskLinkingService.js";
import { emitToProject } from "./socketService.js";
import { registerHandler } from "./webhookQueue.js";

/** Resolve a repository document to its owning project + team. */
async function resolveScope(repositoryDbId) {
  const repo = await Repository.findById(repositoryDbId)
    .select("projectId settings fullName")
    .lean();
  if (!repo) return null;
  const project = await Project.findById(repo.projectId)
    .select("teamId")
    .lean();
  if (!project) return null;
  return { repo, teamId: project.teamId, projectId: String(repo.projectId) };
}

async function handlePush(job) {
  const payload = job.payload;
  const scope = await resolveScope(job.repositoryDbId);
  if (!scope || !payload?.repository) return;

  const branchName = String(payload.ref || "").replace("refs/heads/", "") || null;
  const commits = Array.isArray(payload.commits) ? payload.commits : [];
  const headCommit = payload.head_commit;

  // Cache commits (idempotent upserts keyed by sha).
  const commitDocs = [...commits];
  if (headCommit && !commitDocs.some((c) => c.id === headCommit.id)) {
    commitDocs.push(headCommit);
  }
  for (const c of commitDocs) {
    if (!c?.id) continue;
    await Commit.findOneAndUpdate(
      { repositoryId: scope.repo._id, sha: c.id },
      {
        $set: {
          message: c.message || "",
          authorName: c.author?.name || "",
          authorEmail: c.author?.email || "",
          committedAt: c.timestamp ? new Date(c.timestamp) : new Date(),
          htmlUrl: c.url || "",
        },
      },
      { upsert: true },
    );
  }

  // Update cached branch head for the pushed ref.
  if (branchName && headCommit?.id) {
    await Branch.findOneAndUpdate(
      { repositoryId: scope.repo._id, name: branchName },
      {
        $set: {
          lastCommitSha: headCommit.id,
          lastCommitMessage: headCommit.message || "",
          lastCommitAuthor: headCommit.author?.username || headCommit.author?.name || "",
          lastCommitDate: headCommit.timestamp ? new Date(headCommit.timestamp) : new Date(),
        },
      },
      { upsert: true },
    );
  }

  await logActivity({
    teamId: scope.teamId,
    projectId: scope.projectId,
    action: "repository.push",
    target: { type: "repository", id: String(scope.repo._id) },
    metadata: {
      repository: scope.repo.fullName,
      branch: branchName,
      commitCount: commits.length,
      pusher: payload.pusher?.name || "",
    },
  });

  emitToProject(scope.projectId, "repo:push", {
    repository: { id: String(scope.repo._id), fullName: scope.repo.fullName },
    branch: branchName,
    commits: commits.map((c) => ({ sha: c.id, message: c.message })),
    pushedBy: payload.pusher?.name || "",
  });

  // Task auto-linking from refs in the branch name / commit messages.
  if (scope.repo.settings?.autoLinkEnabled !== false && commits.length) {
    const references = extractTaskReferences(
      branchName,
      ...commits.map((c) => c.message),
      headCommit?.message,
    );
    const updatedTasks = await applyPushLink(references, job.repositoryDbId);
    for (const task of updatedTasks) {
      await logActivity({
        teamId: scope.teamId,
        projectId: scope.projectId,
        action: "task.auto_linked",
        target: { type: "task", id: String(task._id) },
        metadata: { source: "push", status: "in_progress", reference: "commit" },
      });
    }
  }
}

function summarizePr(pr) {
  return {
    prId: pr.prId,
    number: pr.number,
    title: pr.title,
    state: pr.state,
    merged: pr.merged,
    htmlUrl: pr.htmlUrl,
    authorLogin: pr.authorLogin,
    headRef: pr.headRef,
    baseRef: pr.baseRef,
  };
}

async function handlePullRequest(job) {
  const payload = job.payload;
  const pr = payload?.pull_request;
  if (!pr) return;
  const scope = await resolveScope(job.repositoryDbId);
  if (!scope) return;

  const action = payload.action; // opened | reopened | synchronize | closed | ...
  const wasMerged = Boolean(pr.merged);

  const references = extractTaskReferences(pr.title, pr.body, pr.head?.ref);

  const doc = await PullRequest.findOneAndUpdate(
    { repositoryId: scope.repo._id, number: pr.number },
    {
      $set: {
        prId: pr.id,
        title: pr.title || "",
        state: pr.state,
        merged: wasMerged,
        mergedAt: pr.merged_at ? new Date(pr.merged_at) : null,
        closedAt: pr.closed_at ? new Date(pr.closed_at) : null,
        htmlUrl: pr.html_url || "",
        authorLogin: pr.user?.login || "",
        authorAvatarUrl: pr.user?.avatar_url || "",
        headRef: pr.head?.ref || "",
        baseRef: pr.base?.ref || "",
        draft: Boolean(pr.draft),
        linkedTasks: references,
      },
    },
    { upsert: true, new: true },
  );

  await logActivity({
    teamId: scope.teamId,
    projectId: scope.projectId,
    action: wasMerged ? "pull_request.merged" : `pull_request.${action}`,
    target: { type: "pull_request", id: String(doc._id) },
    metadata: {
      repository: scope.repo.fullName,
      number: pr.number,
      title: pr.title,
      author: pr.user?.login || "",
      url: pr.html_url || "",
    },
  });

  emitToProject(scope.projectId, "repo:pr-updated", {
    repository: { id: String(scope.repo._id), fullName: scope.repo.fullName },
    action,
    pullRequest: summarizePr(doc),
  });

  // Auto-advance linked tasks (spec §9.5).
  if (scope.repo.settings?.autoLinkEnabled !== false && references.length) {
    const shouldAutomate =
      ["opened", "reopened"].includes(action) || (action === "closed" && wasMerged);
    if (shouldAutomate) {
      const updatedTasks = await applyPullRequestLink(references, job.repositoryDbId, {
        merged: wasMerged,
      });
      for (const task of updatedTasks) {
        await logActivity({
          teamId: scope.teamId,
          projectId: scope.projectId,
          action: "task.auto_linked",
          target: { type: "task", id: String(task._id) },
          metadata: {
            source: "pull_request",
            status: task.status,
            prNumber: pr.number,
          },
        });
        if (wasMerged && task.assignedTo) {
          await createNotification({
            userId: task.assignedTo,
            type: "pr_merged",
            payload: {
              taskId: String(task._id),
              taskTitle: task.title,
              prNumber: pr.number,
              prTitle: pr.title,
              url: pr.html_url,
            },
            email: true,
            emailSubject: `[Matrix] PR #${pr.number} merged — "${task.title}" is done`,
          });
        }
      }
    }
  }
}

/** issues & workflow_run are recorded to the activity feed only. */
async function handleSimpleEvent(job, activityAction) {
  const payload = job.payload;
  const scope = await resolveScope(job.repositoryDbId);
  if (!scope) return;

  let metadata = {};
  let summary = "";
  if (job.event === "issues" && payload.issue) {
    summary = `${payload.action}: ${payload.issue.title}`;
    metadata = { issueNumber: payload.issue.number, state: payload.issue.state };
  } else if (job.event === "workflow_run" && payload.workflow_run) {
    summary = `${payload.workflow_run.name} (${payload.workflow_run.conclusion || payload.workflow_run.status})`;
    metadata = {
      runNumber: payload.workflow_run.run_number,
      conclusion: payload.workflow_run.conclusion,
    };
  }

  await logActivity({
    teamId: scope.teamId,
    projectId: scope.projectId,
    action: activityAction,
    target: { type: "repository", id: String(scope.repo._id) },
    metadata: { repository: scope.repo.fullName, summary, ...metadata },
  });
}

export function startWebhookWorker() {
  registerHandler("ping", async () => {});
  registerHandler("push", handlePush);
  registerHandler("pull_request", handlePullRequest);
  registerHandler("issues", (job) => handleSimpleEvent(job, "issue.updated"));
  registerHandler("workflow_run", (job) => handleSimpleEvent(job, "workflow.completed"));
  console.log("Webhook worker started (push, pull_request, issues, workflow_run)");
}
