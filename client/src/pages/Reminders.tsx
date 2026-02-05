import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Bell, Clock, Calendar as CalendarIcon, PieChart, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTimer } from '../context/TimerContext';

export default function Reminders() {
    const { reminders, addReminder, deleteReminder } = useTimer();
    const [newGoal, setNewGoal] = useState('');
    const [newDate, setNewDate] = useState('');

    const handleAddGoal = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newGoal || !newDate) return;

        const targetTime = new Date(newDate).getTime();
        if (isNaN(targetTime)) return;

        addReminder(newGoal, new Date(targetTime));

        setNewGoal('');
        setNewDate('');
    };

    // Calculate Stats
    const total = reminders.length;
    const completed = reminders.filter(r => r.triggered).length;
    const pending = total - completed;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Filter upcoming (not triggered)
    const upcomingReminders = reminders
        .filter(r => !r.triggered)
        .sort((a, b) => a.targetTime - b.targetTime);

    return (
        <div className="space-y-8 pb-10 relative">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Standalone Reminders</h1>
                <p className="text-muted-foreground mt-1">Set timers for your tasks. This tool runs locally in your browser.</p>
            </div>

            {/* Stats Overview */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card className="bg-primary/5 border-primary/20">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Completion Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-primary">{completionRate}%</div>
                        <p className="text-xs text-muted-foreground mt-1">timers finished</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Active Timers</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold">{pending}</div>
                        <p className="text-xs text-muted-foreground mt-1">counting down</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Finished</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-green-500">{completed}</div>
                        <p className="text-xs text-muted-foreground mt-1">past reminders</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
                {/* Add Goal Form */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-primary" />
                            Set New Timer
                        </CardTitle>
                        <CardDescription>Enter a task and when you want to be reminded.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleAddGoal} className="space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="goal" className="text-sm font-medium leading-none">Reminder Message</label>
                                <Input
                                    id="goal"
                                    placeholder="e.g. Check roast in oven"
                                    value={newGoal}
                                    onChange={(e) => setNewGoal(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none">Alarm Time</label>
                                <div className="relative">
                                    <Input
                                        type="datetime-local"
                                        value={newDate}
                                        onChange={(e) => setNewDate(e.target.value)}
                                        onClick={(e) => {
                                            if ('showPicker' in HTMLInputElement.prototype) {
                                                try {
                                                    (e.currentTarget as HTMLInputElement).showPicker();
                                                } catch (err) { }
                                            }
                                        }}
                                        required
                                        className="w-full pl-10 cursor-pointer"
                                    />
                                    <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                                </div>
                            </div>
                            <Button type="submit" className="w-full">
                                Set Alarm
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Visual Chart Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <PieChart className="w-5 h-5 text-primary" />
                            Timer Visuals
                        </CardTitle>
                        <CardDescription>Overview of active vs finished timers.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center p-6">
                        {/* CSS-only Donut Chart */}
                        <div className="relative w-48 h-48">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle
                                    cx="96"
                                    cy="96"
                                    r="88"
                                    fill="transparent"
                                    stroke="currentColor"
                                    strokeWidth="16"
                                    className="text-secondary"
                                />
                                <circle
                                    cx="96"
                                    cy="96"
                                    r="88"
                                    fill="transparent"
                                    stroke="currentColor"
                                    strokeWidth="16"
                                    strokeDasharray={2 * Math.PI * 88}
                                    strokeDashoffset={2 * Math.PI * 88 * (1 - completionRate / 100)}
                                    strokeLinecap="round"
                                    className="text-primary transition-all duration-1000 ease-out"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-3xl font-bold">{completionRate}%</span>
                                <span className="text-xs text-muted-foreground uppercase tracking-wide">Finished</span>
                            </div>
                        </div>

                        <div className="flex gap-8 mt-8 w-full justify-center">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-primary" />
                                <span className="text-sm font-medium">Finished ({completed})</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-secondary" />
                                <span className="text-sm font-medium">Running ({pending})</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Upcoming List */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bell className="w-5 h-5" />
                        Active Timers
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {upcomingReminders.length > 0 ? (
                            upcomingReminders.map(reminder => (
                                <motion.div
                                    key={reminder.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-secondary/10 transition-colors"
                                >
                                    <div className="flex flex-col gap-1">
                                        <span className="font-semibold">{reminder.title}</span>
                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            Alarm at {new Date(reminder.targetTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({new Date(reminder.targetTime).toLocaleDateString()})
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Countdown target={reminder.targetTime} />
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => deleteReminder(reminder.id)}
                                            className="text-destructive hover:bg-destructive/10"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                <Clock className="w-10 h-10 mx-auto mb-3 opacity-20" />
                                <p>No active timers running.</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function Countdown({ target }: { target: number }) {
    const [left, setLeft] = useState(target - Date.now());

    useEffect(() => {
        const interval = setInterval(() => setLeft(target - Date.now()), 1000);
        return () => clearInterval(interval);
    }, [target]);

    if (left <= 0) return <span className="text-xs font-bold text-red-500 animate-pulse">DUE NOW</span>;

    const seconds = Math.floor((left / 1000) % 60);
    const minutes = Math.floor((left / (1000 * 60)) % 60);
    const hours = Math.floor((left / (1000 * 60 * 60)) % 24);
    const days = Math.floor(left / (1000 * 60 * 60 * 24));

    return (
        <span className="text-sm font-mono bg-secondary px-2 py-1 rounded">
            {days > 0 && `${days}d `}
            {hours.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
        </span>
    );
}
