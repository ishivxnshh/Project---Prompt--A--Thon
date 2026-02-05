import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

export type Reminder = {
    id: string;
    title: string;
    targetTime: number; // Timestamp
    triggered: boolean;
};

type TimerContextType = {
    // Alarms / Reminders
    reminders: Reminder[];
    addReminder: (title: string, date: Date) => void;
    deleteReminder: (id: string) => void;
    activeAlarm: Reminder | null;
    dismissAlarm: () => void;

    // Focus Timer
    focusTimeLeft: number;
    focusIsActive: boolean;
    focusInitialTime: number;
    startFocus: (minutes?: number) => void;
    pauseFocus: () => void;
    resetFocus: () => void;
    toggleFocus: () => void;
};

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export function TimerProvider({ children }: { children: React.ReactNode }) {
    // --- Reminders State ---
    const [reminders, setReminders] = useState<Reminder[]>(() => {
        const saved = localStorage.getItem('timemap_reminders');
        return saved ? JSON.parse(saved) : [];
    });
    const [activeAlarm, setActiveAlarm] = useState<Reminder | null>(null);

    // --- Focus Timer State ---
    const [focusTimeLeft, setFocusTimeLeft] = useState(25 * 60);
    const [focusIsActive, setFocusIsActive] = useState(false);
    const [focusInitialTime, setFocusInitialTime] = useState(25); // Minutes

    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Save Reminders
    useEffect(() => {
        localStorage.setItem('timemap_reminders', JSON.stringify(reminders));
    }, [reminders]);

    // Check Reminders Loop
    useEffect(() => {
        const checkReminders = () => {
            const now = Date.now();
            let changed = false;
            const newReminders = reminders.map(r => {
                if (!r.triggered && r.targetTime <= now) {
                    triggerAlarm(r);
                    return { ...r, triggered: true };
                }
                return r;
            });

            // If we triggered something, update state
            // Optimization: Only set state if actual trigger happened to avoid loop
            // But here I'm mapping. I need to detect change.
            // Simplified: We can't update state inside the map easily without infinite loop if dependent.
            // Better: find triggers first.
        };

        const interval = setInterval(() => {
            const now = Date.now();
            reminders.forEach(r => {
                if (!r.triggered && r.targetTime <= now) {
                    // Check if not already active to avoid double trigger
                    setActiveAlarm(current => {
                        if (current?.id === r.id) return current;
                        triggerAlarm(r);
                        return r;
                    });
                    // Mark as triggered in storage logic
                    setReminders(prev => prev.map(pr => pr.id === r.id ? { ...pr, triggered: true } : pr));
                }
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [reminders]);

    // Focus Timer Loop
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (focusIsActive && focusTimeLeft > 0) {
            interval = setInterval(() => {
                setFocusTimeLeft(prev => {
                    if (prev <= 1) {
                        setFocusIsActive(false);
                        triggerValuesAudio(); // Play sound for timer finish
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [focusIsActive, focusTimeLeft]);

    const triggerAlarm = (reminder: Reminder) => {
        playAudio();
    };

    const triggerValuesAudio = () => {
        playAudio();
    };

    const playAudio = () => {
        if (!audioRef.current) {
            audioRef.current = new Audio('/mixkit-digital-clock-digital-alarm-buzzer-992.wav');
            audioRef.current.loop = true;
        }
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(console.error);
    };

    const stopAudio = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
    };

    const addReminder = (title: string, date: Date) => {
        const newReminder: Reminder = {
            id: Date.now().toString(),
            title,
            targetTime: date.getTime(),
            triggered: false
        };
        setReminders(prev => [...prev, newReminder]);
    };

    const deleteReminder = (id: string) => {
        setReminders(prev => prev.filter(r => r.id !== id));
    };

    const dismissAlarm = () => {
        setActiveAlarm(null);
        stopAudio();
    };

    // Focus Actions
    const startFocus = (minutes?: number) => {
        if (minutes) {
            setFocusInitialTime(minutes);
            setFocusTimeLeft(minutes * 60);
        }
        setFocusIsActive(true);
    };

    const pauseFocus = () => setFocusIsActive(false);
    const toggleFocus = () => setFocusIsActive(!focusIsActive);

    const resetFocus = () => {
        setFocusIsActive(false);
        setFocusTimeLeft(focusInitialTime * 60);
    };

    return (
        <TimerContext.Provider value={{
            reminders, addReminder, deleteReminder, activeAlarm, dismissAlarm,
            focusTimeLeft, focusIsActive, focusInitialTime, startFocus, pauseFocus, resetFocus, toggleFocus
        }}>
            {children}
        </TimerContext.Provider>
    );
}

export function useTimer() {
    const context = useContext(TimerContext);
    if (context === undefined) {
        throw new Error('useTimer must be used within a TimerProvider');
    }
    return context;
}
