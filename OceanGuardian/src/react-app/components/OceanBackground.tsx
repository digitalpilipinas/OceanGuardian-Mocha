interface OceanBackgroundProps {
    interactive?: boolean;
    bubbleDensity?: 'low' | 'medium' | 'high';
    variant?: 'default' | 'deep';
}

const OceanBackground = ({ variant = 'default' }: OceanBackgroundProps) => {
    return (
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
            {/* Deep Ocean Gradient Background with Caustics Simulation */}
            <div className={`absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] ${variant === 'deep' ? 'from-cyan-950 via-blue-950 to-slate-950' : 'from-cyan-900/40 via-blue-950 to-slate-950'} z-0`}></div>

            {/* Noise Overlay */}
            <div className="absolute inset-0 opacity-5 z-0 [background-image:radial-gradient(rgba(255,255,255,0.07)_1px,transparent_1px)] [background-size:3px_3px]"></div>

            {/* Static ambient lighting layers */}
            <div className="absolute top-[-10%] left-1/4 w-[500px] h-[500px] bg-cyan-500/15 rounded-full blur-[128px] mix-blend-screen"></div>
            <div className="absolute bottom-[-10%] right-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[128px] mix-blend-screen"></div>
        </div>
    );
};

export default OceanBackground;
