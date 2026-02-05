import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';

type ProtectedRouteProps = {
    children: React.ReactNode;
};

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { isAuthenticated, isLoading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, isLoading, navigate]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return isAuthenticated ? <>{children}</> : null;
}
