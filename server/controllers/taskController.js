import Task from '../models/TaskModel.js';

export const createTask = async (req, res) => {
    const { title, description, priority, projectId, dueDate } = req.body;

    if (!title || !projectId) {
        return res.status(400).json({ message: "Title and Project ID are required" });
    }

    try {
        const newTask = await Task.create({
            title,
            description,
            priority: priority || "medium",
            projectId,
            dueDate: dueDate || null
        });

        return res.status(201).json({ success: true, task: newTask });
    } catch (error) {
        console.error("Create Task Error:", error);
        return res.status(500).json({ message: "Internal server error during task creation" });
    }
};

export const getProjectTasks = async (req, res) => {
    const { projectId } = req.params;

    try {
        const tasks = await Task.find({ projectId })
            .populate('assignedTo', 'username avatarUrl')
            .sort({ createdAt: -1 });

        return res.status(200).json({ success: true, tasks });
    } catch (error) {
        console.error("Fetch Tasks Error:", error);
        return res.status(500).json({ message: "Internal server error while fetching tasks" });
    }
};

export const claimTicket = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        const task = await Task.findById(id);

        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        if (task.status !== 'todo' || task.assignedTo !== null) {
            return res.status(400).json({ message: "This ticket has already been claimed or is in progress" });
        }

        const generatedBranchName = `task-${id}-${task.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

        task.assignedTo = userId;
        task.status = 'in_progress';
        task.linkedBranch = generatedBranchName;
        await task.save();

        const updatedTask = await Task.findById(id).populate('assignedTo', 'username avatarUrl');

        return res.status(200).json({ 
            success: true, 
            message: "Ticket claimed successfully", 
            task: updatedTask 
        });
    } catch (error) {
        console.error("Claim Ticket Error:", error);
        return res.status(500).json({ message: "Internal server error during ticket assignment" });
    }
};

export const submitForReview = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        const task = await Task.findById(id);

        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        if (task.assignedTo?.toString() !== userId) {
            return res.status(403).json({ message: "Unauthorized: Only the assignee can submit this task for review" });
        }

        task.status = 'in_review';
        await task.save();

        return res.status(200).json({ success: true, message: "Task submitted for review successfully", task });
    } catch (error) {
        console.error("Submit Review Error:", error);
        return res.status(500).json({ message: "Internal server error during status update" });
    }
};
