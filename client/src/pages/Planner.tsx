import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import { Plus, Loader2, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '../components/ui/button';
import { taskAPI } from '../services/api';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

type Task = {
    _id: string;
    title: string;
    dueDate: string;
    priority: 'low' | 'medium' | 'high';
    completed: boolean;
};

export default function Planner() {
    const [selectedDay, setSelectedDay] = useState(new Date().toLocaleDateString('en-US', { weekday: 'short' }));
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const data = await taskAPI.getTasks();
            setTasks(data);
        } catch (error) {
            console.error("Failed to fetch tasks", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddTask = async (dayName: string) => {
        const title = window.prompt(`Add a new task for ${dayName}:`);
        if (!title || !title.trim()) return;

        // Calculate the date for the selected day
        const today = new Date();
        const currentDayIndex = today.getDay(); // 0 = Sun, 1 = Mon...
        const targetDayIndex = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(dayName);

        let daysDiff = targetDayIndex - currentDayIndex;
        if (daysDiff < 0) daysDiff += 7; // Target next week if day has passed

        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() + daysDiff);

        try {
            const newTask = await taskAPI.createTask({
                title: title,
                dueDate: targetDate.toISOString(),
                priority: 'medium',
            });
            setTasks([...tasks, newTask]);
        } catch (error) {
            console.error("Failed to create task", error);
            alert("Failed to create task. Please try again.");
        }
    };

    // Helper to group tasks by day
    const getTasksForDay = (dayName: string) => {
        // Group tasks by their due date's weekday
        return tasks.filter(task => {
            if (!task.dueDate) return false;
            const date = new Date(task.dueDate);
            const day = date.toLocaleDateString('en-US', { weekday: 'short' });
            return day === dayName;
        });
    };

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight mb-2">Weekly Planner</h1>
                <p className="text-muted-foreground">Visualize and organize your entire week.</p>
            </div>

            <div className="flex-1 overflow-x-auto pb-4">
                <div className="min-w-[800px] grid grid-cols-7 gap-4 h-[600px]">
                    {DAYS.map((day) => {
                        const dayTasks = getTasksForDay(day);
                        const isToday = new Date().toLocaleDateString('en-US', { weekday: 'short' }) === day;

                        return (
                            <motion.div
                                key={day}
                                whileHover={{ y: -5 }}
                                className={cn(
                                    "rounded-xl border border-border bg-card/50 flex flex-col overflow-hidden transition-colors relative",
                                    day === selectedDay ? "ring-2 ring-primary bg-card" : "hover:bg-card/80"
                                )}
                                onClick={() => setSelectedDay(day)}
                            >
                                <div className={cn(
                                    "p-3 text-center border-b border-border font-semibold text-sm flex items-center justify-center gap-2",
                                    day === selectedDay ? "bg-primary text-primary-foreground" : "bg-secondary/50",
                                    isToday && day !== selectedDay && "text-primary"
                                )}>
                                    {day}
                                    {isToday && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
                                </div>
                                <div className="p-3 flex-1 flex flex-col gap-2 overflow-y-auto">
                                    {dayTasks.length > 0 ? (
                                        dayTasks.map((task) => (
                                            <div
                                                key={task._id}
                                                className={cn(
                                                    "p-2 rounded text-xs border border-border shadow-sm truncate",
                                                    task.completed ? "bg-secondary/50 text-muted-foreground line-through" : "bg-background/80",
                                                    task.priority === 'high' && !task.completed ? "border-l-2 border-l-destructive" : ""
                                                )}
                                                title={task.title}
                                            >
                                                {task.title}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground/30 text-xs">
                                            <CalendarIcon className="w-6 h-6 mb-1 opacity-20" />
                                            No tasks
                                        </div>
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="mt-auto w-full border-dashed border border-border text-muted-foreground hover:text-foreground text-xs h-8"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleAddTask(day);
                                        }}
                                    >
                                        <Plus className="w-3 h-3 mr-1" /> Add
                                    </Button>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
