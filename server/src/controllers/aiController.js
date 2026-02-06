import { GoogleGenerativeAI } from '@google/generative-ai';
import Task from '../models/Task.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const prioritizeTasks = async (req, res) => {
    try {
        // Fetch user's tasks
        const tasks = await Task.find({ userId: req.userId, status: 'todo' });

        if (tasks.length === 0) {
            return res.json({
                prioritizedTasks: [],
                reasoning: 'No tasks to prioritize'
            });
        }

        // Prepare task data for AI
        const taskData = tasks.map(task => ({
            id: task._id.toString(),
            title: task.title,
            description: task.description,
            priority: task.priority,
            estimatedTime: task.estimatedTime,
            dueDate: task.dueDate.toISOString()
        }));

        // Create prompt for Gemini
        const prompt = `You are an AI task prioritization assistant. Analyze the following tasks and return a prioritized list with reasoning for EACH task.

Tasks:
${JSON.stringify(taskData, null, 2)}

Please respond in the following JSON format:
{
  "prioritizedTasks": [
    { "id": "task_id", "reasoning": "Why this task is ranked here (e.g., 'Due in 2 hours', 'High impact')" },
    ...
  ],
  "globalStrategy": "Brief explanation of the overall strategy used."
}

Consider:
- Due dates (urgent tasks first)
- Priority levels (high > medium > low)
- Estimated time (balance quick wins with important tasks)
- Task dependencies and logical order

Respond ONLY with valid JSON, no additional text.`;

        // Call Gemini API
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Parse AI response
        let aiResponse;
        try {
            // Extract JSON from response (in case there's extra text)
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            aiResponse = JSON.parse(jsonMatch ? jsonMatch[0] : text);
        } catch (parseError) {
            console.error('Failed to parse AI response:', text);
            // Fallback: simple priority-based sorting
            const sortedTasks = tasks.sort((a, b) => {
                const priorityOrder = { high: 3, medium: 2, low: 1 };
                return priorityOrder[b.priority] - priorityOrder[a.priority];
            });

            return res.json({
                prioritizedTasks: sortedTasks,
                reasoning: 'AI parsing failed, using priority sort'
            });
        }

        // Map reasoning to tasks and reorder
        const prioritizedTasksWithReasoning = aiResponse.prioritizedTasks.map(item => {
            const task = tasks.find(t => t._id.toString() === item.id);
            if (task) {
                // Return task as a plain object with added reasoning property
                return { ...task.toObject(), aiReasoning: item.reasoning };
            }
            return null;
        }).filter(Boolean);

        // Add any tasks that weren't in the AI response (append to end)
        const includedIds = new Set(prioritizedTasksWithReasoning.map(t => t._id.toString()));
        const remainingTasks = tasks
            .filter(task => !includedIds.has(task._id.toString()))
            .map(task => ({ ...task.toObject(), aiReasoning: 'Remaining task' }));

        res.json({
            prioritizedTasks: [...prioritizedTasksWithReasoning, ...remainingTasks],
            reasoning: aiResponse.globalStrategy || 'Tasks prioritized by AI'
        });

    } catch (error) {
        console.error('AI prioritization error:', error);

        // Fallback: return tasks sorted by priority and due date
        try {
            const tasks = await Task.find({ userId: req.userId, status: 'todo' });
            const sortedTasks = tasks.sort((a, b) => {
                const priorityOrder = { high: 3, medium: 2, low: 1 };
                const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
                if (priorityDiff !== 0) return priorityDiff;
                return new Date(a.dueDate) - new Date(b.dueDate);
            });

            res.json({
                prioritizedTasks: sortedTasks,
                reasoning: 'Tasks sorted by priority and due date (AI service unavailable)'
            });
        } catch (fallbackError) {
            res.status(500).json({ error: 'Failed to prioritize tasks' });
        }
    }
};

export const analyzeTask = async (req, res) => {
    const { title } = req.body;
    if (!title) return res.status(400).json({ error: 'Title required' });

    // Heuristic analysis (Fallback)
    const runHeuristics = (text) => {
        const lower = text.toLowerCase();
        let priority = 'medium';
        let estimatedTime = 30;

        // Priority Logic
        if (lower.match(/(urgent|asap|critical|exam|deadline|important|immediate)/)) {
            priority = 'high';
            estimatedTime = 60;
        } else if (lower.match(/(buy|email|call|schedule|check|lunch|break|read)/)) {
            priority = 'low';
            estimatedTime = 15;
        }

        // Time Logic (Context dependent)
        if (lower.match(/(project|presentation|develop|build|create|write|report|study|learn)/)) {
            estimatedTime = 60;
            // Projects are usually important
            if (priority === 'medium') priority = 'high';
        }

        if (lower.match(/(fix|debug|error|issue|deploy)/)) {
            estimatedTime = 45;
            priority = 'high';
        }

        if (lower.match(/(meeting|sync|standup|discuss)/)) {
            estimatedTime = 30;
            priority = 'medium';
        }

        return {
            priority,
            estimatedTime,
            description: 'AI Offline: Estimated based on keywords (Check API Key)'
        };
    };

    try {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error("No API Key");
        }

        const prompt = `Analyze this task title: "${title}".
        Return a JSON object with:
        - priority: one of ["high", "medium", "low"] based on urgency/importance words.
        - estimatedTime: integer (minutes) reasonable for the task.
        - description: short inferred description.

        Respones ONLY with valid JSON. Do not include markdown formatting.`;

        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const analysis = JSON.parse(jsonMatch ? jsonMatch[0] : text);

        res.json(analysis);

    } catch (error) {
        console.warn('AI Analyze failed/skipped (using heuristics):', error.message);
        // Fallback to heuristics
        res.json(runHeuristics(title));
    }
};
