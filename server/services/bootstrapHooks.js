import mongoose from "mongoose";
import Task from "../models/TaskModel.js";
import Membership from "../models/MembershipModel.js";
import Repository from "../models/RepositoryModel.js";
import User from "../models/UserModel.js";
import Project from "../models/ProjectModel.js";
import Invitation from "../models/InvitationModel.js";
import { emitToProject } from "./socketService.js";
import { logActivity } from "./activityService.js";
import { createNotification } from "./notificationService.js";
import {
  encryptSecret,
  decryptSecret,
  generateWebhookSecret,
} from "./cryptoService.js";
import * as github from "./githubService.js";

/**
 * Real-time & audit wiring via Mongoose middleware.
 *
 * Existing controllers are left untouched: every task save/delete, membership
 * creation and repository connection flows through these hooks, which
 * broadcast Socket.io events, append Activity Log entries and raise
 * notifications.
 */

const FIELDS_OF_INTEREST = ["status", "assignedTo", "priority", "dueDate", "title", "description", "linkedBranch"];

let registered = false;

function diffSummary(prev, next) {
  const changes = {};
  for (const field of FIELDS_OF_INTEREST) {
    const before = prev ? prev[field] : undefined;
    const after = next[field];
    const beforeStr = before instanceof Date ? before.toISOString() : String(before ?? "");
    const afterStr = after instanceof Date ? after.toISOString() : String(after ?? "");
    if (beforeStr !== afterStr) {
      changes[field] = { from: before ?? null, to: after ?? null };
    }
  }
  return changes;
}

async function resolveTaskScope(task) {
  if (!task?.projectId) return null;
  const project = await Project.findById(task.projectId).select("teamId").lean();
  return project ? { teamId: String(project.teamId), projectId: String(task.projectId) } : null;
}

async function onTaskSaved(task) {
  try {
    const populated = await Task.findById(task._id)
      .populate("assignedTo", "username avatarUrl")
      .lean();
    const scope = await resolveTaskScope(task);
    if (!scope) return;

    const prev = task._snapshot; // captured on init / previous save
    const isNew = !prev;

    // Refresh the snapshot for the next change detection pass.
    task._snapshot = task.toObject();

    if (isNew) {
      emitToProject(scope.projectId, "task:created", { task: populated });
      await logActivity({
        teamId: scope.teamId,
        projectId: scope.projectId,
        actorId: task.createdBy || null,
        action: "task.created",
        target: { type: "task", id: String(task._id) },
        metadata: { title: task.title, priority: task.priority },
      });
      if (task.assignedTo) {
        await createNotification({
          userId: task.assignedTo,
          type: "task_assigned",
          payload: {
            taskId: String(task._id),
            title: task.title,
            priority: task.priority,
            projectId: scope.projectId,
          },
          email: task.priority === "high",
          emailSubject: `[Matrix] New task assigned: "${task.title}"`,
        });
      }
      return;
    }

    const changes = diffSummary(prev, populated);
    if (Object.keys(changes).length === 0) return;

    // Column change -> task:moved; any other edit -> task:updated.
    const eventName = changes.status ? "task:moved" : "task:updated";
    emitToProject(scope.projectId, eventName, {
      task: populated,
      changes,
      previousStatus: prev.status ?? null,
    });

    await logActivity({
      teamId: scope.teamId,
      projectId: scope.projectId,
      action: changes.status ? "task.status_changed" : "task.updated",
      target: { type: "task", id: String(task._id) },
      metadata: {
        title: task.title,
        ...(changes.status
          ? { statusFrom: prev.status, statusTo: task.status }
          : { changedFields: Object.keys(changes) }),
      },
    });

    if (changes.assignedTo && task.assignedTo) {
      await createNotification({
        userId: task.assignedTo,
        type: "task_assigned",
        payload: {
          taskId: String(task._id),
          title: task.title,
          priority: task.priority,
          projectId: scope.projectId,
        },
        email: task.priority === "high",
        emailSubject: `[Matrix] New task assigned: "${task.title}"`,
      });
    }

    if (changes.status && task.status === "in_review" && task.assignedTo) {
      await createNotification({
        userId: task.assignedTo,
        type: "task_review_submitted",
        payload: {
          taskId: String(task._id),
          title: task.title,
          projectId: scope.projectId,
        },
      });
    }
  } catch (error) {
    console.error("[hooks] task post-save error:", error.message);
  }
}

async function onTaskDeleted(task) {
  try {
    const scope = await resolveTaskScope(task);
    if (!scope) return;
    emitToProject(scope.projectId, "task:deleted", { taskId: String(task._id) });
    await logActivity({
      teamId: scope.teamId,
      projectId: scope.projectId,
      actorId: task.createdBy || null,
      action: "task.deleted",
      target: { type: "task", id: String(task._id) },
      metadata: { title: task.title },
    });
  } catch (error) {
    console.error("[hooks] task delete error:", error.message);
  }
}

async function onMembershipCreated(membership) {
  try {
    const [user, team] = await Promise.all([
      User.findById(membership.userId).select("username email").lean(),
      mongoose.model("Team").findById(membership.teamId).select("name ownerId").lean(),
    ]);
    if (!user || !team) return;

    await logActivity({
      teamId: membership.teamId,
      actorId: membership.userId,
      action: "member.joined",
      target: { type: "member", id: String(membership.userId) },
      metadata: { username: user.username, role: membership.role, teamName: team.name },
    });

    // Notify the inviter (if this join came from an accepted invitation).
    const invitation = await Invitation.findOne({
      teamId: membership.teamId,
      email: user.email,
    })
      .sort({ createdAt: -1 })
      .lean();
    if (invitation?.inviterId) {
      await createNotification({
        userId: invitation.inviterId,
        type: "invitation_accepted",
        payload: {
          username: user.username,
          teamId: String(membership.teamId),
          teamName: team.name,
          role: membership.role,
        },
      });
    }
  } catch (error) {
    console.error("[hooks] membership post-save error:", error.message);
  }
}

/** Ensure a fresh per-repo webhook secret exists (encrypted at rest). */
async function ensureWebhookSecret(repo) {
  if (!repo.isNew || repo.webhookSecret) return;
  repo.webhookSecret = encryptSecret(generateWebhookSecret());
}

/**
 * Best-effort webhook registration right after a repository is connected.
 * Requires GITHUB_TOKEN with admin access to the repository; silently skipped
 * otherwise (the secret is still stored, so registration can be retried).
 */
async function registerRepoWebhookIfPossible(repo) {
  if (!repo.isNew || repo.webhookId || !process.env.GITHUB_TOKEN) return;
  repo.__registeringWebhook = true;
  try {
    // webhookSecret is stored encrypted at rest; GitHub needs the plaintext.
    const secretPlain = decryptSecret(repo.webhookSecret);
    if (!secretPlain) return;
    const events = repo.settings?.events || ["push", "pull_request", "issues", "workflow_run"];
    const webhookId = await github.registerWebhook(
      repo.fullName,
      secretPlain,
      process.env.GITHUB_TOKEN,
      events,
    );
    repo.webhookId = webhookId;
    await repo.save();
    console.log(`[webhook] registered hook ${webhookId} for ${repo.fullName}`);
  } catch (error) {
    console.warn(
      `[webhook] auto-registration skipped for ${repo.fullName}: ${error.message}`,
    );
  } finally {
    repo.__registeringWebhook = false;
  }
}

async function onRepositorySaved(repo) {
  try {
    if (!repo.isNew) return;
    const project = await Project.findById(repo.projectId).select("teamId").lean();
    if (!project) return;

    await logActivity({
      teamId: project.teamId,
      projectId: String(repo.projectId),
      actorId: repo.connectedBy || null,
      action: "repository.connected",
      target: { type: "repository", id: String(repo._id) },
      metadata: { fullName: repo.fullName, defaultBranch: repo.defaultBranch },
    });

    if (!repo.__registeringWebhook) {
      await registerRepoWebhookIfPossible(repo);
      if (repo.isModified()) await repo.save();
    }
  } catch (error) {
    console.error("[hooks] repository post-save error:", error.message);
  }
}

export function registerDomainHooks() {
  if (registered) return;
  registered = true;

  // ---- Task -------------------------------------------------------------
  Task.schema.post("init", (doc) => {
    doc._snapshot = doc.toObject();
  });
  Task.schema.post("save", async function (doc, next) {
    // Run async work without blocking the controller response chain.
    setImmediate(() => onTaskSaved(doc));
    next();
  });
  Task.schema.post("findOneAndDelete", async function (doc, next) {
    if (doc) setImmediate(() => onTaskDeleted(doc));
    next();
  });
  Task.schema.post("deleteOne", { document: true, query: false }, async function (next) {
    setImmediate(() => onTaskDeleted(this));
    next();
  });

  // ---- Membership -------------------------------------------------------
  Membership.schema.post("save", async function (doc, next) {
    if (doc.isNew) setImmediate(() => onMembershipCreated(doc));
    next();
  });

  // ---- Repository -------------------------------------------------------
  Repository.schema.pre("validate", async function (next) {
    try {
      await ensureWebhookSecret(this);
      next();
    } catch (error) {
      next(error);
    }
  });
  Repository.schema.pre("save", async function (next) {
    try {
      await ensureWebhookSecret(this);
      next();
    } catch (error) {
      next(error);
    }
  });
  Repository.schema.post("save", async function (doc, next) {
    setImmediate(() => onRepositorySaved(doc));
    next();
  });

  console.log("Domain hooks registered (task, membership, repository)");
}
