import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    CheckSquare,
    Calendar,
    LogOut,
    User,
    Bell
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { NavBar } from '../components/ui/tubelight-navbar';
import { useTheme } from '../components/theme-provider';

export default function DashboardLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { theme, setTheme } = useTheme();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const navItems = [
        { name: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
        { name: 'Tasks', url: '/dashboard/tasks', icon: CheckSquare },
        { name: 'Planner', url: '/dashboard/planner', icon: Calendar },
        { name: 'Reminders', url: '/dashboard/reminders', icon: Bell },
        { name: 'Profile', url: '/dashboard/profile', icon: User },
    ];

    return (
        <div className="min-h-screen bg-background flex flex-col items-center">
            {/* Top Header - Minimal */}
            <div className="w-full max-w-7xl mx-auto p-6 flex justify-between items-center z-10">
                <div
                    className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => navigate('/')}
                >
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl shadow-glow">
                        T
                    </div>
                    <span className="font-bold text-xl tracking-tight hidden sm:block">TimeMap</span>
                </div>

                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                        {theme === 'dark' ? '☀️' : '🌙'}
                    </Button>
                    <div className="flex items-center gap-2 pr-4 border-r border-border">
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold">
                            {user?.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium hidden sm:block">{user?.name}</span>
                    </div>
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive" onClick={handleLogout}>
                        <LogOut className="w-4 h-4 sm:mr-2" />
                        <span className="hidden sm:inline">Logout</span>
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 pb-24">
                <Outlet />
            </main>

            {/* Tubelight Navbar - Centered Bottom/Top */}
            <NavBar items={navItems} />
        </div>
    );
}
