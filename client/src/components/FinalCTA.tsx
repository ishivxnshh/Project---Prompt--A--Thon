import { useNavigate } from 'react-router-dom';
import { CallToAction } from './ui/cta-3';

export function FinalCTA() {
    const navigate = useNavigate();

    return (
        <section className="w-full py-16 z-10 relative">
            <CallToAction onClick={() => navigate('/signup')} />
        </section>
    );
}
