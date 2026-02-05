import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Calendar as CalendarIcon, Check, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { taskAPI, aiAPI } from '../services/api';

type Task = {
    _id: string;
    title: string;
    description?: string;
    completed: boolean;
    priority: 'low' | 'medium' | 'high';
    dueDate: string;
    estimatedTime?: number;
    status: 'todo' | 'done';
};

export default function Tasks() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [newTask, setNewTask] = useState('');
    const [loading, setLoading] = useState(true);
    const [aiLoading, setAiLoading] = useState(false);
    const [error, setError] = useState('');
    const [aiReasoning, setAiReasoning] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch tasks on mount
    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const data = await taskAPI.getTasks();
            setTasks(data);
            setError('');
        } catch (err: any) {
            setError(err.message || 'Failed to load tasks');
            console.error('Fetch tasks error:', err);
        } finally {
            setLoading(false);
        }
    };

    const addTask = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Adding task:", newTask); // Debug log
        if (!newTask.trim()) return;

        try {
            setIsSubmitting(true);

            // Attempt AI analysis for better defaults
            let aiDefaults = { priority: 'medium', estimatedTime: 30 };
            try {
                const analysis = await aiAPI.analyzeTask(newTask);
                console.log("AI Analysis:", analysis);
                if (analysis) {
                    aiDefaults.priority = analysis.priority || 'medium';
                    aiDefaults.estimatedTime = analysis.estimatedTime || 30;
                }
            } catch (aiErr) {
                console.warn("AI Analysis failed, using defaults", aiErr);
            }

            const task = await taskAPI.createTask({
                title: newTask,
                priority: aiDefaults.priority as 'low' | 'medium' | 'high',
                estimatedTime: aiDefaults.estimatedTime,
                dueDate: new Date().toISOString(),
            });

            setTasks([task, ...tasks]);
            setNewTask('');
            setError('');
            console.log("Task added:", task);
        } catch (err: any) {
            console.error("Add task error:", err);
            setError(err.message || 'Failed to create task');
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleTask = async (id: string) => {
        const task = tasks.find(t => t._id === id);
        if (!task) return;

        try {
            const updated = await taskAPI.updateTask(id, {
                completed: !task.completed,
                status: !task.completed ? 'done' : 'todo'
            });

            setTasks(tasks.map(t => t._id === id ? updated : t));
            setError('');
        } catch (err: any) {
            setError(err.message || 'Failed to update task');
        }
    };

    const deleteTask = async (id: string) => {
        try {
            await taskAPI.deleteTask(id);
            setTasks(tasks.filter(t => t._id !== id));
            setError('');
        } catch (err: any) {
            setError(err.message || 'Failed to delete task');
        }
    };

    const prioritizeTasks = async () => {
        try {
            setAiLoading(true);
            setAiReasoning('');
            const result = await aiAPI.prioritizeTasks();

            setTasks(result.prioritizedTasks);
            setAiReasoning(result.reasoning);
            setError('');

            // Auto-hide reasoning after 10 seconds
            setTimeout(() => setAiReasoning(''), 10000);
        } catch (err: any) {
            setError(err.message || 'AI prioritization failed');
        } finally {
            setAiLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            {/* Error Display */}
            {error && (
                <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-md">
                    {error}
                </div>
            )}

            {/* AI Reasoning Display */}
            {aiReasoning && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-4 p-4 bg-primary/10 border border-primary/20 rounded-md"
                >
                    <div className="flex items-start gap-2">
                        <Sparkles className="w-5 h-5 text-primary mt-0.5" />
                        <div>
                            <p className="font-semibold text-sm mb-1">AI Prioritization</p>
                            <p className="text-sm text-muted-foreground">{aiReasoning}</p>
                        </div>
                    </div>
                </motion.div>
            )}

            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Task Manager</h1>
                    <p className="text-muted-foreground">Manage your detailed tasks and priorities.</p>
                </div>
                <div className="flex gap-2 items-center">
                    <span className="text-sm text-muted-foreground self-end mb-1">
                        {tasks.filter(t => t.completed).length}/{tasks.length} Completed
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={prioritizeTasks}
                        disabled={aiLoading || tasks.filter(t => !t.completed).length === 0}
                        className="gap-2"
                    >
                        {aiLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Sparkles className="w-4 h-4" />
                        )}
                        AI Prioritize
                    </Button>
                </div>
            </div>

            <Card className="mb-8 border-primary/20 bg-secondary/10">
                <CardContent className="pt-6">
                    <form onSubmit={addTask} className="flex gap-4">
                        <Input
                            value={newTask}
                            onChange={(e) => setNewTask(e.target.value)}
                            placeholder="Add a new task..."
                            className="flex-1 bg-background"
                        />
                        <Button type="submit" disabled={isSubmitting || !newTask.trim()}>
                            {isSubmitting ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Plus className="w-4 h-4 mr-2" />
                            )}
                            {isSubmitting ? 'Adding...' : 'Add Task'}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                    {tasks.map((task) => (
                        <motion.div
                            key={task._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            layout
                        >
                            <Card className={cn(
                                "group transition-colors hover:border-primary/50",
                                task.completed && "opacity-60 bg-secondary/20"
                            )}>
                                <CardContent className="p-4 flex items-center gap-4">
                                    <SimpleCheckbox
                                        checked={task.completed}
                                        onCheckedChange={() => toggleTask(task._id)}
                                    />

                                    <div className="flex-1 min-w-0">
                                        <p className={cn(
                                            "text-base font-medium truncate transition-all",
                                            task.completed && "line-through text-muted-foreground"
                                        )}>
                                            {task.title}
                                        </p>
                                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                            <span className={cn(
                                                "px-2 py-0.5 rounded-full capitalize bg-secondary",
                                                task.priority === 'high' && "text-destructive bg-destructive/10",
                                                task.priority === 'medium' && "text-orange-400 bg-orange-400/10",
                                                task.priority === 'low' && "text-green-400 bg-green-400/10",
                                            )}>
                                                {task.priority}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <CalendarIcon className="w-3 h-3" />
                                                {new Date(task.dueDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>

                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                                        onClick={() => deleteTask(task._id)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {tasks.length === 0 && (
                    <div className="text-center py-20 text-muted-foreground">
                        <p>No tasks yet. Add one above to get started!</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function SimpleCheckbox({ checked, onCheckedChange }: { checked: boolean, onCheckedChange: () => void }) {
    return (
        <button
            type="button"
            role="checkbox"
            aria-checked={checked}
            onClick={onCheckedChange}
            className={cn(
                "w-6 h-6 rounded-md border flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                checked ? "bg-primary border-primary text-primary-foreground" : "border-input bg-background hover:bg-accent hover:text-accent-foreground"
            )}
        >
            {checked && <Check className="w-4 h-4" />}
        </button>
    )
}
