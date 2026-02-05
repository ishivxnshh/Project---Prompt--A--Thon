import Task from '../models/Task.js';

export const getTasks = async (req, res) => {
    try {
        const tasks = await Task.find({ userId: req.userId }).sort({ createdAt: -1 });
        res.json(tasks);
    } catch (error) {
        console.error('Get tasks error:', error);
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
};

export const createTask = async (req, res) => {
    try {
        const { title, description, priority, estimatedTime, dueDate } = req.body;

        if (!title) {
            return res.status(400).json({ error: 'Title is required' });
        }

        const task = new Task({
            userId: req.userId,
            title,
            description: description || '',
            priority: priority || 'medium',
            estimatedTime: estimatedTime || 30,
            dueDate: dueDate || new Date(Date.now() + 24 * 60 * 60 * 1000)
        });

        await task.save();
        res.status(201).json(task);
    } catch (error) {
        console.error('Create task error:', error);
        res.status(500).json({ error: 'Failed to create task' });
    }
};

export const updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const task = await Task.findOne({ _id: id, userId: req.userId });

        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        // Update allowed fields
        const allowedUpdates = ['title', 'description', 'priority', 'estimatedTime', 'dueDate', 'status', 'completed'];
        allowedUpdates.forEach(field => {
            if (updates[field] !== undefined) {
                task[field] = updates[field];
            }
        });

        // Sync completed and status
        if (updates.completed !== undefined) {
            task.status = updates.completed ? 'done' : 'todo';
        }
        if (updates.status !== undefined) {
            task.completed = updates.status === 'done';
        }

        await task.save();
        res.json(task);
    } catch (error) {
        console.error('Update task error:', error);
        res.status(500).json({ error: 'Failed to update task' });
    }
};

export const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;

        const task = await Task.findOneAndDelete({ _id: id, userId: req.userId });

        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error('Delete task error:', error);
        res.status(500).json({ error: 'Failed to delete task' });
    }
};
