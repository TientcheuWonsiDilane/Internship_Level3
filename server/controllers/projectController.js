import Project from '../models/ProjectModel.js';

export const createProject = async (req, res) => {
    const { name, description, teamId } = req.body;
    const userId = req.user.id;

    if (!name) {
        return res.status(400).json({ message: "Project name is required" });
    }

    try {
        let generatedSlug = name
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');

        const slugExists = await Project.findOne({ slug: generatedSlug });
        if (slugExists) {
            const uniqueSuffix = Math.random().toString(36).substring(2, 6);
            generatedSlug = `${generatedSlug}-${uniqueSuffix}`;
        }

        const newProject = await Project.create({
            name,
            description,
            teamId: teamId || null,
            slug: generatedSlug,
            createdBy: userId
        });

        return res.status(201).json({ success: true, project: newProject });
    } catch (error) {
        console.error("Create Project Error:", error);
        return res.status(500).json({ message: "Internal server error during project creation" });
    }
};

export const getTeamProjects = async (req, res) => {
    const { teamId } = req.params;

    try {
        const projects = await Project.find({ teamId })
            .populate('createdBy', 'username avatarUrl')
            .sort({ createdAt: -1 });

        return res.status(200).json({ success: true, projects });
    } catch (error) {
        console.error("Fetch Projects Error:", error);
        return res.status(500).json({ message: "Internal server error while fetching projects" });
    }
};

export const getProjectBySlug = async (req, res) => {
    const { slug } = req.params;

    try {
        const project = await Project.findOne({ slug }).populate('createdBy', 'username avatarUrl');
        
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        return res.status(200).json({ success: true, project });
    } catch (error) {
        console.error("Fetch Project By Slug Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const updateProject = async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    try {
        if (updates.name) {
            let generatedSlug = updates.name
                .toLowerCase()
                .trim()
                .replace(/[^\w\s-]/g, '')
                .replace(/[\s_-]+/g, '-')
                .replace(/^-+|-+$/g, '');

            const slugExists = await Project.findOne({ slug: generatedSlug, _id: { $ne: id } });
            if (slugExists) {
                const uniqueSuffix = Math.random().toString(36).substring(2, 6);
                generatedSlug = `${generatedSlug}-${uniqueSuffix}`;
            }
            updates.slug = generatedSlug;
        }

        const updatedProject = await Project.findByIdAndUpdate(id, updates, { new: true });
        
        if (!updatedProject) {
            return res.status(404).json({ message: "Project not found" });
        }

        return res.status(200).json({ success: true, project: updatedProject });
    } catch (error) {
        console.error("Update Project Error:", error);
        return res.status(500).json({ message: "Internal server error during project update" });
    }
};

export const deleteProject = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedProject = await Project.findByIdAndDelete(id);
        
        if (!deletedProject) {
            return res.status(404).json({ message: "Project not found" });
        }

        return res.status(200).json({ success: true, message: "Project deleted successfully" });
    } catch (error) {
        console.error("Delete Project Error:", error);
        return res.status(500).json({ message: "Internal server error during project deletion" });
    }
};
