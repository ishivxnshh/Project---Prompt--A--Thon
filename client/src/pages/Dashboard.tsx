import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTimer } from '../context/TimerContext';
import { taskAPI, aiAPI } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle2,
    Clock,
    AlertCircle,
    Sparkles,
    Play,
    Pause,
    RotateCcw,
    BrainCircuit,
    Calendar,
    ArrowRight
} from 'lucide-react';
import { cn } from '../lib/utils';

// Types
type Task = {
    _id: string;
    title: string;
    description?: string;
    priority: 'low' | 'medium' | 'high';
    estimatedTime: number; // minutes
    dueDate: string;
    status: 'todo' | 'done';
    completed: boolean;
    aiReasoning?: string;
};

export default function Dashboard() {
    const { user } = useAuth();
    const { startFocus } = useTimer();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [aiGlobalReasoning, setAiGlobalReasoning] = useState<string | null>(null);
    const [focusTask, setFocusTask] = useState<Task | null>(null);
    const [isThinking, setIsThinking] = useState(false);

    // Audio Refs
    const alertAudio = useRef<HTMLAudioElement | null>(null);

    // Initial Fetch
    useEffect(() => {
        fetchData();
        // Initialize audio with error handling
        try {
            alertAudio.current = new Audio('/mixkit-digital-clock-digital-alarm-buzzer-992.wav');
        } catch (error) {
            console.warn('Audio initialization failed:', error);
        }
    }, []);

    // Reminder System
    useEffect(() => {
        const interval = setInterval(() => {
            checkReminders();
        }, 60000); // Check every minute
        return () => clearInterval(interval);
    }, [tasks]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const fetchedTasks = await taskAPI.getTasks();
            setTasks(fetchedTasks);

            // Only prioritize if we have tasks and haven't done it recently? 
            // For demo, let's auto-prioritize if there are active tasks
            const activeTasks = fetchedTasks.filter((t: Task) => !t.completed);
            if (activeTasks.length > 0) {
                runAiPrioritization();
            }
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };

    const runAiPrioritization = async () => {
        setIsThinking(true);
        try {
            const result = await aiAPI.prioritizeTasks();
            // Backend returns { prioritizedTasks: Task[], reasoning: string }
            // Note: The backend logic might return a mix of API tasks and others. 
            // We trust the backend's sorting.
            setTasks(result.prioritizedTasks);
            setAiGlobalReasoning(result.reasoning);

            // Recommend top task
            const active = result.prioritizedTasks.filter((t: Task) => !t.completed);
            if (active.length > 0) {
                setFocusTask(active[0]);
            }
        } catch (error) {
            console.error("AI Prioritization failed", error);
        } finally {
            setIsThinking(false);
        }
    };

    const handleTaskComplete = async (taskId: string) => {
        try {
            const task = tasks.find(t => t._id === taskId);
            if (!task) return;

            // Optimistic update
            const updatedTask = { ...task, completed: !task.completed, status: (!task.completed ? 'done' : 'todo') as 'done' | 'todo' };
            setTasks(tasks.map(t => t._id === taskId ? updatedTask : t));

            await taskAPI.updateTask(taskId, {
                completed: updatedTask.completed,
                status: updatedTask.status
            });

            // Re-prioritize on completion
            if (updatedTask.completed) {
                // If we completed the focus task, find the next one
                if (focusTask?._id === taskId) {
                    const remaining = tasks.filter(t => t._id !== taskId && !t.completed);
                    if (remaining.length > 0) {
                        setFocusTask(remaining[0]);
                    } else {
                        setFocusTask(null);
                    }
                }
                // Trigger AI re-sort (optional, maybe distracting? lets keep it manual or on-load mostly)
                // For demo "Automatic Re-Prioritization" requirement:
                runAiPrioritization();
            }
        } catch (error) {
            console.error("Failed to update task", error);
            // Revert on error would go here
        }
    };

    const checkReminders = () => {
        const now = new Date();
        tasks.forEach(task => {
            if (task.completed) return;
            const due = new Date(task.dueDate);
            // Check if due within last minute (simple logic)
            if (Math.abs(due.getTime() - now.getTime()) < 60000) {
                triggerAlert(`Task Due: ${task.title}`);
            }
        });
    };

    const triggerAlert = (message: string) => {
        if (alertAudio.current) {
            alertAudio.current.play().catch(e => console.log("Audio play failed", e));
        }
        // Could also show a toast or notification here
        alert(message); // Simple fallback
    };

    // Calculate Stats
    const totalMinutesPlanned = tasks.filter(t => !t.completed).reduce((acc, t) => acc + (t.estimatedTime || 0), 0);
    const hoursPlanned = Math.floor(totalMinutesPlanned / 60);
    const minutesPlanned = totalMinutesPlanned % 60;
    const isOverloaded = totalMinutesPlanned > 480; // > 8 hours

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Dashboard
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        AI-powered focus for <span className="text-primary font-medium">{user?.name}</span>
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        onClick={runAiPrioritization}
                        disabled={isThinking}
                        className="gap-2"
                    >
                        {isThinking ? <BrainCircuit className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        {isThinking ? 'Analyzing...' : 'AI Reprioritize'}
                    </Button>
                </div>
            </div>

            {/* AI Reasoning Banner */}
            <AnimatePresence>
                {aiGlobalReasoning && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex gap-3 items-start"
                    >
                        <BrainCircuit className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-semibold text-sm text-primary mb-1">AI Strategy</h4>
                            <p className="text-sm text-foreground/80">{aiGlobalReasoning}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Main Focus Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Focus Card */}
                    <Card className="border-primary/20 bg-gradient-to-br from-background to-primary/5 shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-primary">
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                                </span>
                                Recommended Focus
                            </CardTitle>
                            <CardDescription>Based on urgency, priority, and your energy cycle</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {focusTask ? (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-2xl md:text-3xl font-bold mb-2 leading-tight">
                                            {focusTask.title}
                                        </h2>
                                        {/* AI Reasoning for Focus Task */}
                                        {focusTask.aiReasoning && (
                                            <div className="mb-3 px-3 py-1.5 bg-background/50 backdrop-blur-sm border rounded-lg inline-flex items-center gap-2 text-sm text-primary/80">
                                                <Sparkles className="w-3 h-3" />
                                                Why this? {focusTask.aiReasoning}
                                            </div>
                                        )}
                                        <p className="text-muted-foreground flex items-center gap-4 text-sm md:text-base">
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                {focusTask.estimatedTime}m est.
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                Due {new Date(focusTask.dueDate).toLocaleDateString()}
                                            </span>
                                            <span className={cn(
                                                "px-2 py-0.5 rounded-full text-xs font-medium capitalize",
                                                focusTask.priority === 'high' ? 'bg-destructive/10 text-destructive' : 'bg-secondary text-secondary-foreground'
                                            )}>
                                                {focusTask.priority} Priority
                                            </span>
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap gap-3">
                                        <Button
                                            size="lg"
                                            className="w-full sm:w-auto gap-2"
                                            onClick={() => {
                                                if (focusTask?.estimatedTime) startFocus(focusTask.estimatedTime);
                                                document.getElementById('timer-section')?.scrollIntoView({ behavior: 'smooth' });
                                            }}
                                        >
                                            <Play className="w-4 h-4" /> Start Focus Session
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="lg"
                                            className="w-full sm:w-auto"
                                            onClick={() => handleTaskComplete(focusTask._id)}
                                        >
                                            <CheckCircle2 className="w-4 h-4 mr-2" /> Mark Done
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-12 text-muted-foreground">
                                    <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>All cleaned up! Add more tasks to get recommendations.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Task Queue */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            Upcoming Queue
                            <span className="bg-secondary px-2 py-0.5 rounded-full text-xs text-muted-foreground">
                                {tasks.filter(t => !t.completed && t._id !== focusTask?._id).length}
                            </span>
                        </h3>
                        <div className="space-y-3">
                            {tasks
                                .filter(t => !t.completed && t._id !== focusTask?._id)
                                .slice(0, 5) // Show top 5
                                .map((task) => (
                                    <motion.div
                                        key={task._id}
                                        layoutId={task._id}
                                        className="p-4 rounded-xl border bg-card/50 hover:bg-card hover:border-primary/20 transition-all group flex items-center gap-4"
                                    >
                                        <button
                                            onClick={() => handleTaskComplete(task._id)}
                                            className="w-5 h-5 rounded-full border-2 border-muted-foreground/30 hover:border-primary hover:bg-primary/10 transition-colors"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-0.5">
                                                <p className="font-medium truncate">{task.title}</p>
                                                {task.aiReasoning && (
                                                    <span className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded max-w-[100px] truncate ml-2">
                                                        {task.aiReasoning}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <span className={cn(
                                                    "capitalize font-medium",
                                                    task.priority === 'high' ? 'text-destructive' :
                                                        task.priority === 'medium' ? 'text-orange-500' : 'text-green-500'
                                                )}>{task.priority}</span>
                                                <span>•</span>
                                                <span>{task.estimatedTime}m</span>
                                            </div>
                                        </div>
                                        <Button size="icon" variant="ghost" className="opacity-0 group-hover:opacity-100" onClick={() => setFocusTask(task)}>
                                            <ArrowRight className="w-4 h-4" />
                                        </Button>
                                    </motion.div>
                                ))}
                            {tasks.filter(t => !t.completed).length === 0 && (
                                <p className="text-muted-foreground text-center py-4 text-sm">No upcoming tasks.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Time Load */}
                    <Card className={cn(isOverloaded ? "border-destructive/50 bg-destructive/5" : "")}>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                Time Budget
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-end gap-2 mb-2">
                                <span className="text-3xl font-bold">{hoursPlanned}h {minutesPlanned}m</span>
                                <span className="text-sm text-muted-foreground mb-1">planned</span>
                            </div>
                            {isOverloaded && (
                                <div className="text-sm text-destructive flex items-center gap-2 mt-2 font-medium">
                                    <AlertCircle className="w-4 h-4" />
                                    High Workload Warning
                                </div>
                            )}
                            <div className="w-full bg-secondary h-2 rounded-full mt-3 overflow-hidden">
                                <div
                                    className={cn("h-full rounded-full", isOverloaded ? 'bg-destructive' : 'bg-primary')}
                                    style={{ width: `${Math.min((totalMinutesPlanned / 480) * 100, 100)}%` }}
                                />
                            </div>
                            <p className="text-xs text-muted-foreground mt-2 text-right">8h Daily Limit</p>
                        </CardContent>
                    </Card>

                    {/* Timer Widget */}
                    <FocusTimer initialTime={focusTask?.estimatedTime || 25} />

                    {/* Quick Add (Could go here, but kept simple for now) */}
                </div>
            </div>
        </div>
    );
}

// Sub-component for Timer
function FocusTimer({ initialTime }: { initialTime: number }) {
    const {
        focusTimeLeft,
        focusIsActive,
        toggleFocus,
        resetFocus,
        startFocus
    } = useTimer();

    // If the task changes, and we aren't running, update the 'potential' time
    // Note: We don't want to override a running timer
    useEffect(() => {
        if (!focusIsActive) {
            // We can 'reset' the context to this new time without starting
            // Implementing a 'setTime' in context would be cleaner, but 'startFocus' sets it.
            // Actually, we probably shouldn't auto-update the Context state just on prop change unless requested.
            // But the UI needs to show the accurate time for the selected task.
            // Let's just trust that the "Start Focus Session" button handles the setup.
            // But if user scrolls down manually and clicks play on the timer card?
            // It will resume whatever was there.
            // We'll leave it simple.
        }
    }, [initialTime, focusIsActive]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Calculate progress for background effect
    // We need total time for the ratio. 
    // We can assume max 60m or use the initialTime from context if we exposed it.
    // Let's use focusTimeLeft / 60 as a rough visual or just standard.
    // Better: max time logic.
    const maxTime = Math.max(initialTime * 60, focusTimeLeft);
    const progress = maxTime > 0 ? 1 - (focusTimeLeft / maxTime) : 0;

    return (
        <Card id="timer-section" className="overflow-hidden relative">
            <div
                className="absolute inset-0 bg-primary/5 z-0"
                style={{
                    transform: `scaleY(${progress})`,
                    transformOrigin: 'bottom',
                    transition: 'transform 1s linear'
                }}
            />
            <CardHeader>
                <CardTitle className="text-base">Focus Timer</CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
                <div className="text-5xl font-mono font-bold text-center mb-6 tracking-tighter">
                    {formatTime(focusTimeLeft)}
                </div>
                <div className="flex justify-center gap-4">
                    <Button
                        variant={focusIsActive ? "secondary" : "default"}
                        size="icon"
                        className="w-12 h-12 rounded-full"
                        onClick={toggleFocus}
                    >
                        {focusIsActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        className="w-12 h-12 rounded-full"
                        onClick={resetFocus}
                    >
                        <RotateCcw className="w-5 h-5" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
