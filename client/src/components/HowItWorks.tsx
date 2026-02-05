import { motion } from 'framer-motion';
import { Calendar, CheckCircle2, LayoutDashboard } from 'lucide-react';

const steps = [
    {
        icon: <Calendar className="w-6 h-6 text-primary" />,
        title: "Plan Your Week",
        description: "Drag and drop tasks onto our smart calendar interface to visualize your time."
    },
    {
        icon: <CheckCircle2 className="w-6 h-6 text-primary" />,
        title: "Execute with Focus",
        description: "Enter focus mode to block distractions and execute your tasks one by one."
    },
    {
        icon: <LayoutDashboard className="w-6 h-6 text-primary" />,
        title: "Track & Optimize",
        description: "Review your analytics dashboard to see where your time goes and improve."
    }
];

export function HowItWorks() {
    return (
        <section className="w-full max-w-7xl mx-auto px-6 py-16 relative z-10">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">How TimeMap Works</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                    Three simple steps to reclaim your schedule and boost productivity.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {steps.map((step, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.2, duration: 0.5 }}
                        className="relative group p-8 rounded-2xl bg-card/20 backdrop-blur-sm border border-border/50 hover:bg-card/40 transition-colors duration-300"
                    >
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 ring-1 ring-primary/20 group-hover:scale-110 transition-transform duration-300">
                            {step.icon}
                        </div>
                        <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            {step.description}
                        </p>

                        {/* Connecting Line (Desktop only, not on last item) */}
                        {index !== steps.length - 1 && (
                            <div className="hidden md:block absolute top-14 left-full w-full h-[2px] bg-gradient-to-r from-primary/20 to-transparent -translate-x-8 pointer-events-none" />
                        )}
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
