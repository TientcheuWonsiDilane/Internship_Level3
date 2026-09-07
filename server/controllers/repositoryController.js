import Repository from '../models/RepositoryModel.js';
import Project from '../models/ProjectModel.js';
import User from '../models/UserModel.js';
import * as githubService from '../services/githubService.js';

export const connectRepository = async (req, res) => {
    const { fullName, description, repoId, projectId, repoUrl } = req.body;
    const userId = req.user.id;

    // Allow connecting by URL or by owner/repo + numeric ID
    if (!projectId) {
        return res.status(400).json({ message: "Project ID is required" });
    }

    // Try to derive fullName from repoUrl if not provided
    let derivedFullName = fullName;
    if (!derivedFullName && repoUrl) {
        try {
            const m = String(repoUrl).match(/github\.com\/(.+?)(?:\.git)?$/i);
            if (m && m[1]) derivedFullName = m[1].replace(/\/$/, "");
        } catch (e) {
            // ignore
        }
    }

    if (!derivedFullName || !repoId) {
        return res.status(400).json({ message: "Repository fullName (owner/repo) and repoId are required" });
    }

    try {
        const projectExists = await Project.findById(projectId);
        if (!projectExists) {
            return res.status(404).json({ message: "Target project not found" });
        }

        const repoExists = await Repository.findOne({ repoId });
        if (repoExists) {
            return res.status(400).json({ message: "This repository is already connected to a project" });
        }

        const newRepo = await Repository.create({
            fullName: derivedFullName,
            description: description || "",
            repoId,
            projectId,
            connectedBy: userId,
            lastSyncedAt: new Date()
        });

        projectExists.linkedRepository = newRepo._id;
        await projectExists.save();

        return res.status(201).json({ success: true, repository: newRepo });
    } catch (error) {
        console.error("Connect Repository Error:", error);
        return res.status(500).json({ message: "Internal server error during repository connection" });
    }
};

export const getProjectRepository = async (req, res) => {
    const { projectId } = req.params;

    try {
        const repository = await Repository.findOne({ projectId })
            .populate('connectedBy', 'username avatarUrl');

        if (!repository) {
            return res.status(404).json({ message: "No repository connected to this project" });
        }

        return res.status(200).json({ success: true, repository });
    } catch (error) {
        console.error("Fetch Repository Error:", error);
        return res.status(500).json({ message: "Internal server error while fetching repository" });
    }
};

export const syncRepository = async (req, res) => {
    const { id } = req.params;

    try {
        const repository = await Repository.findById(id);
        if (!repository) {
            return res.status(404).json({ message: "Repository not found" });
        }

        repository.lastSyncedAt = new Date();
        await repository.save();

        return res.status(200).json({ 
            success: true, 
            message: "Repository sync timestamp updated successfully", 
            repository 
        });
    } catch (error) {
        console.error("Sync Repository Error:", error);
        return res.status(500).json({ message: "Internal server error during repository synchronization" });
    }
};

export const disconnectRepository = async (req, res) => {
    const { id } = req.params;

    try {
        const repository = await Repository.findById(id);
        if (!repository) {
            return res.status(404).json({ message: "Repository not found" });
        }

        await Project.findByIdAndUpdate(repository.projectId, { $unset: { linkedRepository: "" } });
        await Repository.findByIdAndDelete(id);

        return res.status(200).json({ success: true, message: "Repository disconnected successfully" });
    } catch (error) {
        console.error("Disconnect Repository Error:", error);
        return res.status(500).json({ message: "Internal server error during repository disconnection" });
    }
};

/**
 * Connect a repository using the authenticated user's GitHub OAuth token.
 * Expects { fullName, repoUrl, projectId, description } in body.
 */
export const connectRepositoryViaOauth = async (req, res) => {
    const { fullName, repoUrl, projectId, description } = req.body;
    const userId = req.user.id;

    if (!projectId) {
        return res.status(400).json({ message: "Project ID is required" });
    }

    // derive fullName if needed
    let derivedFullName = fullName;
    if (!derivedFullName && repoUrl) {
        const m = String(repoUrl).match(/github\.com\/(.+?)(?:\.git)?$/i);
        if (m && m[1]) derivedFullName = m[1].replace(/\/$/, "");
    }

    if (!derivedFullName) {
        return res.status(400).json({ message: "Repository fullName (owner/repo) is required" });
    }

    try {
        const user = await User.findById(userId).select('+github_token');
        if (!user || !user.github_token) {
            return res.status(400).json({ message: "GitHub OAuth token not available for this user. Re-authenticate via GitHub to grant repository access." });
        }

        // validate/retrieve meta using user's token
        let meta;
        try {
            meta = await githubService.fetchRepositoryMeta(derivedFullName, user.github_token);
        } catch (error) {
            console.error('GitHub meta fetch failed:', error);
            return res.status(502).json({ message: 'Failed to fetch repository metadata from GitHub with your token' });
        }

        const repoExists = await Repository.findOne({ repoId: meta.repoId });
        if (repoExists) {
            return res.status(400).json({ message: 'This repository is already connected to a project' });
        }

        const newRepo = await Repository.create({
            fullName: meta.fullName,
            description: meta.description || description || '',
            repoId: meta.repoId,
            projectId,
            connectedBy: userId,
            lastSyncedAt: new Date(),
        });

        await Project.findByIdAndUpdate(projectId, { linkedRepository: newRepo._id });

        return res.status(201).json({ success: true, repository: newRepo });
    } catch (error) {
        console.error('Connect via OAuth Error:', error);
        return res.status(500).json({ message: 'Internal server error during repository connection' });
    }
};
