import Repository from '../models/RepositoryModel.js';
import Project from '../models/ProjectModel.js';

export const connectRepository = async (req, res) => {
    const { fullName, description, repoId, projectId } = req.body;
    const userId = req.user.id;

    if (!fullName || !repoId || !projectId) {
        return res.status(400).json({ message: "Full name, Repository ID, and Project ID are required" });
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
            fullName,
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
