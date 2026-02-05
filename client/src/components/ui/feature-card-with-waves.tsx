import React, { useEffect, useRef } from 'react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

interface FeatureCardProps {
    title: string;
    description: string;
    icon?: React.ReactNode;
    badge?: string;
    className?: string;
}

export function FeatureCardWithWaves({ title, description, badge = "Feature", className }: FeatureCardProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let time = 0;
        let animationFrameId: number;

        const waveData = Array.from({ length: 5 }).map(() => ({
            value: Math.random() * 0.5 + 0.1,
            targetValue: Math.random() * 0.5 + 0.1,
            speed: Math.random() * 0.02 + 0.01
        }));

        function resizeCanvas() {
            if (!canvas) return;
            const parent = canvas.parentElement;
            if (parent) {
                canvas.width = parent.clientWidth;
                canvas.height = parent.clientHeight;
            }
        }

        function updateWaveData() {
            waveData.forEach(data => {
                if (Math.random() < 0.01) data.targetValue = Math.random() * 0.7 + 0.1;
                const diff = data.targetValue - data.value;
                data.value += diff * data.speed;
            });
        }

        function draw() {
            if (!canvas || !ctx) return;
            // Transparent background
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            waveData.forEach((data, i) => {
                const freq = data.value * 7;
                ctx.beginPath();
                for (let x = 0; x < canvas.width; x++) {
                    const nx = (x / canvas.width) * 2 - 1;
                    const px = nx + i * 0.04 + freq * 0.03;
                    const py = Math.sin(px * 10 + time) * Math.cos(px * 2) * freq * 0.1 * ((i + 1) / 8);
                    // Position waves at the bottom third
                    const y = (py + 1) * canvas.height * 0.8;
                    x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
                }

                ctx.lineWidth = 1 + i * 0.5;
                // White/Gray strokes for B&W theme
                ctx.strokeStyle = `rgba(255,255,255,${0.1 + i * 0.1})`;
                ctx.stroke();
            });
        }

        function animate() {
            time += 0.02;
            updateWaveData();
            draw();
            animationFrameId = requestAnimationFrame(animate);
        }

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <motion.div
            whileHover={{ y: -5 }}
            className={cn("relative overflow-hidden rounded-2xl border border-border bg-card/50 backdrop-blur-sm shadow-xl group", className)}
        >
            {/* Background Canvas for Waves */}
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-50 pointer-events-none" />

            <div className="relative z-10 p-6 flex flex-col h-full">
                <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:bg-primary/20 transition-colors">
                        {/* Simulated Schema Visual */}
                        <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-primary">
                            <circle cx="6" cy="6" r="3" stroke="currentColor" strokeWidth="2" />
                            <circle cx="18" cy="18" r="3" stroke="currentColor" strokeWidth="2" />
                            <circle cx="18" cy="6" r="3" stroke="currentColor" strokeWidth="2" />
                            <path d="M9 6h6M18 9v6M8 8l8 8" stroke="currentColor" strokeWidth="1.5" className="opacity-50" />
                        </svg>
                    </div>
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-secondary text-secondary-foreground border border-border">
                        {badge}
                    </span>
                </div>

                <h3 className="text-xl font-bold mb-2 text-foreground group-hover:text-primary transition-colors">{title}</h3>
                <p className="text-muted-foreground leading-relaxed text-sm flex-1">{description}</p>

                {/* Decorative Grid Line */}
                <div className="w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent mt-6 mb-2" />

                <div className="flex justify-between items-center mt-2">
                    <button className="text-xs font-semibold text-primary flex items-center group/btn">
                        Learn more
                        <svg className="w-3 h-3 ml-1 group-hover/btn:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14m-7-7l7 7-7 7" /></svg>
                    </button>
                </div>
            </div>

            {/* Schema Floating Elements (Background Decor) */}
            <div className="absolute top-1/4 right-0 opacity-10 pointer-events-none animate-float" style={{ animationDuration: '6s' }}>
                <div className="border border-foreground rounded p-1 w-16 h-10 bg-background/50 backdrop-blur-md" />
            </div>
            <div className="absolute bottom-1/4 left-0 opacity-10 pointer-events-none animate-float" style={{ animationDuration: '8s', animationDelay: '1s' }}>
                <div className="border border-foreground rounded p-1 w-12 h-12 rounded-full bg-background/50 backdrop-blur-md" />
            </div>

        </motion.div>
    );
}
