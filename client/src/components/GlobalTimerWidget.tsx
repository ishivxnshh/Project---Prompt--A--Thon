import { useTimer } from '../context/TimerContext';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Clock, X, Pause, Play } from 'lucide-react';
import { Button } from './ui/button';

export function GlobalTimerWidget() {
    const {
        activeAlarm,
        dismissAlarm,
        focusIsActive,
        focusTimeLeft,
        pauseFocus,
        toggleFocus
    } = useTimer();

    const location = useLocation();
    const isDashboard = location.pathname === '/dashboard';

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <>
            {/* ALARM OVERLAY - Always High Priority */}
            <AnimatePresence>
                {activeAlarm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-background border-2 border-primary rounded-2xl p-8 max-w-md w-full text-center shadow-[0_0_50px_rgba(var(--primary),0.5)] relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-primary/5 animate-pulse" />
                            <Bell className="w-16 h-16 text-primary mx-auto mb-6 animate-bounce" />
                            <h2 className="text-3xl font-bold mb-2">Time's Up!</h2>
                            <p className="text-xl text-muted-foreground mb-8">{activeAlarm.title}</p>

                            <Button
                                size="lg"
                                onClick={dismissAlarm}
                                className="w-full text-lg h-14 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 animate-pulse"
                            >
                                Stop Alarm
                            </Button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* FOCUS TIMER PILL - Show when active and NOT on main dashboard (to avoid duplicate) */}
            <AnimatePresence>
                {focusIsActive && !isDashboard && (
                    <motion.div
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 100 }}
                        className="fixed bottom-6 right-6 z-[50] flex items-center gap-4 bg-background/80 backdrop-blur-md border border-primary/20 p-2 pr-4 rounded-full shadow-lg"
                    >
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary animate-pulse">
                            <Clock className="w-5 h-5" />
                        </div>
                        <div className="font-mono text-xl font-bold tabular-nums">
                            {formatTime(focusTimeLeft)}
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full hover:bg-primary/10"
                            onClick={toggleFocus}
                        >
                            <Pause className="w-4 h-4" />
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
