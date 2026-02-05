import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from '../components/ui/button';
import { ArrowRight } from 'lucide-react';
import HoverFooter from '../components/HoverFooter';
import { FeatureCardWithWaves } from '../components/ui/feature-card-with-waves';
import { HowItWorks } from '../components/HowItWorks';
import { FinalCTA } from '../components/FinalCTA';
import { useTheme } from '../components/theme-provider';

import { GridScan } from '../components/ui/scene';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Landing() {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const { user, logout } = useAuth();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Animation variants for sections
    const fadeInUp = {
        hidden: { opacity: 0, y: 40 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: "easeOut" as const }
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-background selection:bg-primary/20">
            {/* GridScan Hero Background */}
            <div className="absolute inset-0 z-0 top-0 h-[600px] w-full opacity-60 pointer-events-none">
                <GridScan
                    sensitivity={0.55}
                    lineThickness={1}
                    linesColor={theme === 'dark' ? "#392e4e" : "#e0e0e0"}
                    gridScale={0.1}
                    scanColor={theme === 'dark' ? "#FF9FFC" : "#9f3eff"}
                    scanOpacity={0.4}
                    enablePost
                    bloomIntensity={0.6}
                    chromaticAberration={0.002}
                    noiseIntensity={0.01}
                />
            </div>

            {/* Background Gradients */}
            <div className="absolute top-10 left-10 w-72 h-72 bg-primary/20 rounded-full blur-[100px] z-0" />
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent/20 rounded-full blur-[120px] z-0" />

            {/* Header */}
            <header
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${scrolled
                    ? 'bg-background/80 backdrop-blur-md border-border/40 py-4'
                    : 'bg-transparent border-transparent py-6'
                    }`}
            >
                <div className="max-w-7xl mx-auto px-6 flex justify-between items-center w-full">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl shadow-glow">
                            T
                        </div>
                        <span className="font-bold text-xl tracking-tight hidden sm:block">TimeMap</span>
                    </div>
                    <div className="flex items-center gap-4">
                        {user ? (
                            <>
                                <Button
                                    variant="ghost"
                                    onClick={() => navigate('/dashboard')}
                                    className="text-muted-foreground hover:text-foreground"
                                >
                                    Dashboard
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        logout();
                                        navigate('/');
                                    }}
                                >
                                    Logout
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button
                                    variant="ghost"
                                    onClick={() => navigate('/login')}
                                    className="text-muted-foreground hover:text-foreground"
                                >
                                    Sign In
                                </Button>
                                <Button
                                    onClick={() => navigate('/signup')}
                                    className="shadow-md hover:shadow-lg transition-all"
                                >
                                    Get Started
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </header>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center z-10 max-w-4xl px-6 pt-40 w-full"
            >
                <div className="inline-block px-4 py-1.5 mb-6 rounded-full glass border border-primary/30 text-primary text-sm font-medium tracking-wide shadow-glow">
                    ✨ The Future of Productivity
                </div>

                <h1 className="text-6xl md:text-7xl font-bold mb-6 tracking-tight leading-tight">
                    Master Your Time, <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400 neon-text">
                        Amplify Your Focus
                    </span>
                </h1>

                <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
                    The intelligent time management assistant designed for high-performers.
                    Plan your week, track your tasks, and achieve flow state effortlessly.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-24">
                    <Button
                        size="lg"
                        className="text-lg px-8 py-6 rounded-full group shadow-[0_0_20px_rgba(0,0,0,0.2)] dark:shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:scale-105 transition-transform"
                        onClick={() => navigate(user ? '/dashboard' : '/signup')}
                    >
                        {user ? 'Go to Dashboard' : 'Get Started Now'}
                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </div>

            </motion.div>

            {/* Section Divider */}
            <motion.div
                initial={{ opacity: 0, scaleX: 0 }}
                whileInView={{ opacity: 1, scaleX: 1 }}
                viewport={{ once: false, amount: 0.2 }}
                transition={{ delay: 0.2 }}
                className="w-full max-w-7xl mx-auto px-6 py-4 z-10 relative"
            >
                <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent opacity-50" />
            </motion.div>

            {/* Feature Cards Section */}
            <section className="w-full bg-secondary/5 py-16 z-10 relative">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: false, amount: 0.2 }}
                        variants={fadeInUp}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold mb-3">Why Choose TimeMap?</h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Powerful features designed to help you reclaim your time and boost productivity.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left h-auto md:h-[450px]">
                        {[0.1, 0.2, 0.3].map((delay, index) => {
                            const CardComponent = FeatureCardWithWaves;
                            const props = [
                                { badge: "Planning", title: "Smart Planning", description: "Intuitive drag-and-drop weekly planner to organize your life in seconds." },
                                { badge: "Productivity", title: "Focus Mode", description: "Distraction-free interface to help you enter and maintain deep flow." },
                                { badge: "Security", title: "Privacy First", description: "Your data stays local. We prioritize your privacy and security above all." }
                            ][index];

                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 50 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: false, amount: 0.2 }}
                                    transition={{ duration: 0.5, delay: delay }}
                                    className="h-full"
                                >
                                    <div className="h-full hover:-translate-y-2 transition-transform duration-300">
                                        <CardComponent
                                            {...props}
                                            className="h-full"
                                        />
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>
                </div>
            </section>

            {/* Section Divider */}
            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: false, amount: 0.8 }}
                className="w-full max-w-7xl mx-auto px-6 py-8 z-10 relative"
            >
                <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent opacity-50" />
            </motion.div>

            {/* How It Works Section */}
            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: false, amount: 0.1 }}
                variants={fadeInUp}
                className="w-full"
            >
                <HowItWorks />
            </motion.div>

            {/* Section Divider */}
            <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: "100%" }}
                viewport={{ once: false, amount: 0.5 }}
                transition={{ duration: 0.8 }}
                className="w-full max-w-7xl mx-auto px-6 py-4 z-10 relative flex justify-center"
            >
                <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent w-full" />
            </motion.div>

            {/* Final CTA Section */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.5 }}
                className="w-full"
            >
                <FinalCTA />
            </motion.div>

            {/* Footer */}
            <div className="w-full z-10">
                <HoverFooter />
            </div>
        </div>
    );
}
