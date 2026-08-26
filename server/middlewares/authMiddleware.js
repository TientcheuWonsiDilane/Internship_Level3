import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import Membership from "../models/MembershipModel.js";
import Project from "../models/ProjectModel.js";
import Task from "../models/TaskModel.js";
import Repository from "../models/RepositoryModel.js";

export const verifyJWT = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res
      .status(401)
      .json({
        message: "Access denied. No session token found. Please log in.",
      });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("JWT Verification Error:", error);
    return res
      .status(403)
      .json({
        message: "Invalid or expired session token. Please log in again.",
      });
  }
};

// Shared helper: enforce membership (and optionally a specific role) on a team.
// Returns a failure object, or null if the check passes.
async function assertTeamRole(teamId, userId, requiredRole) {
  const membership = await Membership.findOne({ teamId, userId }).lean();
  if (!membership) {
    return {
      status: 403,
      message: "Forbidden: You are not a member of this team.",
    };
  }
  if (requiredRole && membership.role !== requiredRole) {
    return {
      status: 403,
      message: `Forbidden: This action requires [${requiredRole}] privileges.`,
    };
  }
  return null;
}

/**
 * Team-scoped role gate. Resolves the team from a direct reference
 * (params.teamId, body.teamId, query.teamId) or treats params.id as the team id.
 */
export const verifyRole = (requiredRole) => {
  return async (req, res, next) => {
    const teamId =
      req.params.teamId ||
      req.body?.teamId ||
      req.query?.teamId ||
      req.params.id;

    if (!teamId) {
      return res
        .status(400)
        .json({
          message:
            "Bad request. Team ID parameter missing from route URL or body.",
        });
    }

    if (!mongoose.isValidObjectId(teamId)) {
      return res.status(400).json({ message: "Invalid team ID." });
    }

    try {
      const failure = await assertTeamRole(teamId, req.user.id, requiredRole);
      if (failure) {
        return res.status(failure.status).json({ message: failure.message });
      }
      next();
    } catch (error) {
      console.error("Role Verification Error:", error);
      return res
        .status(500)
        .json({ message: "Internal server error during role verification" });
    }
  };
};

/**
 * Project-scoped role gate. Resolves the owning team through the project
 * referenced by params.projectId, params.id, or body.projectId, then enforces
 * membership (and optionally a required role). Call with no argument to require
 * plain team membership.
 */
export const verifyProjectRole = (requiredRole) => {
  return async (req, res, next) => {
    try {
      const projectId =
        req.params.projectId || req.params.id || req.body?.projectId;

      if (!projectId) {
        return res
          .status(400)
          .json({
            message:
              "Bad request. Project ID parameter missing from route URL or body.",
          });
      }
      if (!mongoose.isValidObjectId(projectId)) {
        return res.status(400).json({ message: "Invalid project ID." });
      }

      const project = await Project.findById(projectId)
        .select("teamId")
        .lean();
      if (!project) {
        return res.status(404).json({ message: "Project not found." });
      }

      const failure = await assertTeamRole(
        project.teamId,
        req.user.id,
        requiredRole,
      );
      if (failure) {
        return res.status(failure.status).json({ message: failure.message });
      }
      next();
    } catch (error) {
      console.error("Project Role Verification Error:", error);
      return res
        .status(500)
        .json({ message: "Internal server error during role verification" });
    }
  };
};

/**
 * Task-scoped role gate. Loads the task referenced by params.id (or body.taskId)
 * and resolves its owning team via task.projectId -> project.teamId, then
 * enforces membership (and optionally a required role).
 */
export const verifyRepositoryRole = (requiredRole) => {
  return async (req, res, next) => {
    try {
      const repositoryId = req.params.id;
      if (!repositoryId || !mongoose.isValidObjectId(repositoryId)) {
        return res.status(400).json({ message: "Invalid repository ID." });
      }

      const repository = await Repository.findById(repositoryId)
        .select("projectId")
        .lean();
      if (!repository) {
        return res.status(404).json({ message: "Repository not found." });
      }

      const project = await Project.findById(repository.projectId)
        .select("teamId")
        .lean();
      if (!project) {
        return res.status(404).json({ message: "Owning project not found." });
      }

      const failure = await assertTeamRole(
        project.teamId,
        req.user.id,
        requiredRole,
      );
      if (failure) {
        return res.status(failure.status).json({ message: failure.message });
      }
      next();
    } catch (error) {
      console.error("Repository Role Verification Error:", error);
      return res
        .status(500)
        .json({ message: "Internal server error during role verification" });
    }
  };
};

export const verifyTaskRole = (requiredRole) => {
  return async (req, res, next) => {
    try {
      const taskId = req.params.id || req.body?.taskId;

      if (!taskId) {
        return res
          .status(400)
          .json({
            message:
              "Bad request. Task ID parameter missing from route URL or body.",
          });
      }
      if (!mongoose.isValidObjectId(taskId)) {
        return res.status(400).json({ message: "Invalid task ID." });
      }

      const task = await Task.findById(taskId).select("projectId").lean();
      if (!task) {
        return res.status(404).json({ message: "Task not found." });
      }
      req.task = task;

      const project = await Project.findById(task.projectId)
        .select("teamId")
        .lean();
      if (!project) {
        return res
          .status(404)
          .json({ message: "Owning project not found for this task." });
      }

      const failure = await assertTeamRole(
        project.teamId,
        req.user.id,
        requiredRole,
      );
      if (failure) {
        return res.status(failure.status).json({ message: failure.message });
      }
      next();
    } catch (error) {
      console.error("Task Role Verification Error:", error);
      return res
        .status(500)
        .json({ message: "Internal server error during role verification" });
    }
  };
};
