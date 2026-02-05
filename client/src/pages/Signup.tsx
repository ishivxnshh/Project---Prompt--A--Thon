import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SignInCard } from '../components/ui/sign-in-card';
import { ArrowLeft } from 'lucide-react';

export default function Signup() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { signup } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent, data: any) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            await signup(data.email, data.password, data.name);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Signup failed. Please try again.');
            setIsLoading(false);
        }
    };

    return (
        <div className="relative">
            {/* Back to Landing Link */}
            <Link
                to="/"
                className="fixed top-6 left-6 z-50 flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
            >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span>Back to Home</span>
            </Link>

            <SignInCard mode="signup" onSubmit={handleSubmit} isLoading={isLoading} />
            {error && (
                <div className="fixed top-4 right-4 bg-destructive text-destructive-foreground px-4 py-2 rounded-md shadow-lg z-50">
                    {error}
                </div>
            )}
        </div>
    );
}
