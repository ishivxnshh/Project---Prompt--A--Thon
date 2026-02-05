const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Helper function to get auth token
const getAuthToken = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            return user.token;
        } catch {
            return null;
        }
    }
    return null;
};

// Helper function to make authenticated requests
const authFetch = async (url: string, options: RequestInit = {}) => {
    const token = getAuthToken();

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
};

// Auth API
export const authAPI = {
    signup: async (email: string, password: string, name?: string) => {
        const response = await fetch(`${API_BASE_URL}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, name }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Signup failed');
        }

        return response.json();
    },

    login: async (email: string, password: string) => {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Login failed');
        }

        return response.json();
    },
};

// Task API
export const taskAPI = {
    getTasks: async () => {
        return authFetch('/tasks');
    },

    createTask: async (task: {
        title: string;
        description?: string;
        priority?: 'low' | 'medium' | 'high';
        estimatedTime?: number;
        dueDate?: string;
    }) => {
        return authFetch('/tasks', {
            method: 'POST',
            body: JSON.stringify(task),
        });
    },

    updateTask: async (id: string, updates: {
        title?: string;
        description?: string;
        priority?: 'low' | 'medium' | 'high';
        estimatedTime?: number;
        dueDate?: string;
        status?: 'todo' | 'done';
        completed?: boolean;
    }) => {
        return authFetch(`/tasks/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updates),
        });
    },

    deleteTask: async (id: string) => {
        return authFetch(`/tasks/${id}`, {
            method: 'DELETE',
        });
    },
};

// AI API
export const aiAPI = {
    prioritizeTasks: async () => {
        return authFetch('/ai/prioritize', {
            method: 'POST',
        });
    },
    analyzeTask: async (title: string) => {
        return authFetch('/ai/analyze', {
            method: 'POST',
            body: JSON.stringify({ title }),
        });
    },
};
