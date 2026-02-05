import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { authAPI } from '../services/api';

type User = {
    id: string;
    email: string;
    name: string;
    token: string;
};

type AuthContextType = {
    user: User | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    signup: (email: string, password: string, name?: string) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check for stored user on mount
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                localStorage.removeItem('user');
            }
        }
        setIsLoading(false);
    }, []);

    const signup = async (email: string, password: string, name?: string) => {
        const response = await authAPI.signup(email, password, name);
        const userData = {
            id: response.user.id,
            email: response.user.email,
            name: response.user.name,
            token: response.token
        };
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    const login = async (email: string, password: string) => {
        const response = await authAPI.login(email, password);
        const userData = {
            id: response.user.id,
            email: response.user.email,
            name: response.user.name,
            token: response.token
        };
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, signup, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
