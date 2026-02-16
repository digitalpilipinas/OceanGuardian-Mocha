import React from 'react';
import { motion, Variants, useSpring, useTransform, useMotionValue } from 'framer-motion';

interface OceanBackgroundProps {
    interactive?: boolean;
    bubbleDensity?: 'low' | 'medium' | 'high';
    variant?: 'default' | 'deep';
}

const OceanBackground = ({ interactive = false, bubbleDensity = 'medium', variant = 'default' }: OceanBackgroundProps) => {
    // Mouse move parallax effect (only if interactive)
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!interactive) return;
        const { clientX, clientY } = e;
        const { innerWidth, innerHeight } = window;
        mouseX.set(clientX / innerWidth - 0.5);
        mouseY.set(clientY / innerHeight - 0.5);
    };

    const bgParallaxX = useSpring(useTransform(mouseX, [-0.5, 0.5], [10, -10]), { stiffness: 50, damping: 30 });
    const bgParallaxY = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), { stiffness: 50, damping: 30 });

    const bubbleCount = bubbleDensity === 'high' ? 40 : bubbleDensity === 'medium' ? 20 : 10;

    const bubbleVariants: Variants = {
        animate: () => ({
            y: [0, -1200],
            x: [0, Math.random() * 50 - 25],
            opacity: [0, 0.4, 0],
            scale: [0.5, 1.5, 0.5],
            transition: {
                duration: Math.random() * 15 + 15,
                repeat: Infinity,
                delay: Math.random() * 10,
                ease: "linear"
            }
        })
    };

    return (
        <div
            className="fixed inset-0 z-0 overflow-hidden pointer-events-none"
            onMouseMove={interactive ? handleMouseMove : undefined}
        >
            {/* Deep Ocean Gradient Background with Caustics Simulation */}
            <div className={`absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] ${variant === 'deep' ? 'from-cyan-950 via-blue-950 to-slate-950' : 'from-cyan-900/40 via-blue-950 to-slate-950'} z-0`}></div>

            {/* Noise Overlay */}
            <motion.div
                style={interactive ? { x: bgParallaxX, y: bgParallaxY } : {}}
                className="absolute inset-0 opacity-5 z-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat"
            ></motion.div>

            {/* Ambient Light Effects - Dynamic */}
            <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-[-10%] left-1/4 w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-[128px] mix-blend-screen"
            ></motion.div>
            <motion.div
                animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                className="absolute bottom-[-10%] right-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[128px] mix-blend-screen"
            ></motion.div>

            {/* Bubble Particles */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                {[...Array(bubbleCount)].map((_, i) => (
                    <motion.div
                        key={i}
                        variants={bubbleVariants}
                        animate="animate"
                        className="absolute rounded-full bg-cyan-200/10 backdrop-blur-[1px] border border-white/5"
                        style={{
                            width: Math.random() * 15 + 5,
                            height: Math.random() * 15 + 5,
                            left: `${Math.random() * 100}%`,
                            bottom: '-10%'
                        }}
                    />
                ))}
            </div>
        </div>
    );
};

export default OceanBackground;
