import Repository from "../models/RepositoryModel.js";
import Project from "../models/ProjectModel.js";
import Branch from "../models/BranchModel.js";
import Commit from "../models/CommitModel.js";
import PullRequest from "../models/PullRequestModel.js";
import * as githubService from "../services/githubService.js";
import { logActivity } from "../services/activityService.js";
import { GithubUnavailableError } from "../services/githubService.js";

/**
 * On-demand pull of a repository's data through the GitHub REST API,
 * replacing the local cache with a fresh snapshot.
 */
export const syncRepositoryFromGithub = async (req, res) => {
  const { id } = req.params;

  try {
    const repo = await Repository.findById(id);
    if (!repo) {
      return res.status(404).json({ message: "Repository not found" });
    }

    let meta;
    try {
      [meta] = await Promise.all([
        githubService.fetchRepositoryMeta(repo.fullName),
        // Warm the client; individual fetches below reuse it implicitly.
      ]);
    } catch (error) {
      if (error instanceof GithubUnavailableError || error.name === "GithubUnavailableError") {
        return res.status(503).json({
          message:
            "GitHub is not configured on this server (missing GITHUB_TOKEN). Connect a token to enable live sync.",
        });
      }
      return res.status(502).json({ message: "GitHub request failed", detail: error.message });
    }

    // Fetch all three datasets in parallel for a fast snapshot.
    const [branches, commits, pullRequests] = await Promise.all([
      githubService.fetchBranches(repo.fullName).catch(() => []),
      githubService.fetchCommits(repo.fullName).catch(() => []),
      githubService.fetchPullRequests(repo.fullName, undefined, "all").catch(() => []),
    ]);

    // Snapshot strategy: replace cached rows per repository.
    await Promise.all([
      Branch.deleteMany({ repositoryId: repo._id }),
      Commit.deleteMany({ repositoryId: repo._id }),
      PullRequest.deleteMany({ repositoryId: repo._id }),
    ]);

    await Promise.all([
      branches.length &&
        Branch.insertMany(branches.map((b) => ({ ...b, repositoryId: repo._id }))),
      commits.length &&
        Commit.insertMany(commits.map((c) => ({ ...c, repositoryId: repo._id }))),
      pullRequests.length &&
        PullRequest.insertMany(
          pullRequests.map((p) => ({ ...p, repositoryId: repo._id })),
        ),
    ]);

    repo.lastSyncedAt = new Date();
    if (meta?.defaultBranch && meta.defaultBranch !== repo.defaultBranch) {
      repo.defaultBranch = meta.defaultBranch;
    }
    await repo.save();

    const owningProject = await Project.findById(repo.projectId).select("teamId").lean();
    await logActivity({
      teamId: owningProject?.teamId,
      projectId: String(repo.projectId),
      actorId: req.user.id,
      action: "repository.synced",
      target: { type: "repository", id: String(repo._id) },
      metadata: {
        fullName: repo.fullName,
        branches: branches.length,
        commits: commits.length,
        pullRequests: pullRequests.length,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Repository synced from GitHub",
      summary: {
        branches: branches.length,
        commits: commits.length,
        pullRequests: pullRequests.length,
        lastSyncedAt: repo.lastSyncedAt,
      },
    });
  } catch (error) {
    console.error("GitHub Sync Error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error during GitHub sync" });
  }
};

/** Cached pull requests across every repository connected to a project. */
export const getProjectPullRequests = async (req, res) => {
  try {
    const repos = await Repository.find({ projectId: req.params.id }).select("_id").lean();
    const repoIds = repos.map((r) => r._id);

    if (repoIds.length === 0) {
      return res.status(200).json({ success: true, pullRequests: [] });
    }

    const pullRequests = await PullRequest.find({ repositoryId: { $in: repoIds } })
      .sort({ updatedAt: -1 })
      .limit(100)
      .populate("linkedTasks", "_id title status");

    return res.status(200).json({ success: true, pullRequests });
  } catch (error) {
    console.error("List Project PRs Error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error while fetching pull requests" });
  }
};

/** Cached commit feed across every repository connected to a project. */
export const getProjectCommits = async (req, res) => {
  try {
    const repos = await Repository.find({ projectId: req.params.id }).select("_id fullName").lean();
    const repoIds = repos.map((r) => r._id);

    if (repoIds.length === 0) {
      return res.status(200).json({ success: true, commits: [] });
    }

    const commits = await Commit.find({ repositoryId: { $in: repoIds } })
      .sort({ committedAt: -1 })
      .limit(100)
      .lean();

    const nameById = new Map(repos.map((r) => [String(r._id), r.fullName]));
    const decorated = commits.map((c) => ({
      ...c,
      repositoryFullName: nameById.get(String(c.repositoryId)) || "",
    }));

    return res.status(200).json({ success: true, commits: decorated });
  } catch (error) {
    console.error("List Project Commits Error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error while fetching commits" });
  }
};

/** Cached branches for one repository. */
export const getRepositoryBranches = async (req, res) => {
  try {
    const branches = await Branch.find({ repositoryId: req.params.id })
      .sort({ name: 1 })
      .lean();
    return res.status(200).json({ success: true, branches });
  } catch (error) {
    console.error("List Branches Error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error while fetching branches" });
  }
};

/** Per-repository webhook & auto-linking settings. */
export const getRepositorySettings = async (req, res) => {
  try {
    const repo = await Repository.findById(req.params.id)
      .select("fullName defaultBranch webhookId settings lastSyncedAt")
      .lean();
    if (!repo) {
      return res.status(404).json({ message: "Repository not found" });
    }
    return res.status(200).json({ success: true, settings: repo.settings, repository: repo });
  } catch (error) {
    console.error("Get Repo Settings Error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error while fetching repository settings" });
  }
};

export const updateRepositorySettings = async (req, res) => {
  const { autoLinkEnabled, events } = req.body;

  try {
    const update = {};
    if (typeof autoLinkEnabled === "boolean") {
      update["settings.autoLinkEnabled"] = autoLinkEnabled;
    }
    if (Array.isArray(events)) {
      const allowed = ["push", "pull_request", "issues", "workflow_run"];
      const filtered = events.filter((e) => allowed.includes(e));
      if (filtered.length !== events.length) {
        return res
          .status(400)
          .json({ message: `Allowed events: ${allowed.join(", ")}` });
      }
      update["settings.events"] = filtered;
    }

    if (Object.keys(update).length === 0) {
      return res
        .status(400)
        .json({ message: "Provide autoLinkEnabled or events to update" });
    }

    const repo = await Repository.findByIdAndUpdate(
      req.params.id,
      { $set: update },
      { new: true },
    ).select("fullName defaultBranch webhookId settings");
    if (!repo) {
      return res.status(404).json({ message: "Repository not found" });
    }

    const owningProject = await Project.findById(repo.projectId).select("teamId").lean();
    await logActivity({
      teamId: owningProject?.teamId,
      projectId: String(repo.projectId),
      actorId: req.user.id,
      action: "repository.settings_updated",
      target: { type: "repository", id: String(repo._id) },
      metadata: update,
    });

    return res.status(200).json({ success: true, repository: repo });
  } catch (error) {
    console.error("Update Repo Settings Error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error while updating repository settings" });
  }
};
