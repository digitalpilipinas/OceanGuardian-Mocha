import { Link, useLocation } from "react-router";
import { LayoutDashboard, Map, Plus, Target, User, Globe, Trophy } from "lucide-react";
import { cn } from "@/react-app/lib/utils";

export default function BottomNav() {
    const location = useLocation();
    const isActive = (path: string) => location.pathname === path;

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-8 h-28 flex items-center justify-center">
            <div className="w-full h-18 flex items-center justify-around px-4 relative">
                {/* Background Layer - Absolute positioned to avoid overflow clipping on parent */}
                <div className="absolute inset-0 glass-liquid rounded-[2.5rem] shadow-2xl shadow-black/40 -z-10" />

                {/* Left Side Items */}
                <Link
                    to="/dashboard"
                    className={cn(
                        "flex flex-col items-center gap-1.5 transition-all",
                        isActive("/dashboard") ? "text-primary scale-110" : "text-white/70 hover:text-white/90"
                    )}
                >
                    <LayoutDashboard className="w-5 h-5 md:w-6 md:h-6" />
                    <span className="text-[9px] font-black uppercase tracking-wider">Base</span>
                </Link>

                <Link
                    to="/map"
                    className={cn(
                        "flex flex-col items-center gap-1.5 transition-all",
                        isActive("/map") ? "text-primary scale-110" : "text-white/70 hover:text-white/90"
                    )}
                >
                    <Map className="w-5 h-5 md:w-6 md:h-6" />
                    <span className="text-[9px] font-black uppercase tracking-wider">Map</span>
                </Link>

                <Link
                    to="/learning"
                    className={cn(
                        "flex flex-col items-center gap-1.5 transition-all",
                        isActive("/learning") ? "text-primary scale-110" : "text-white/70 hover:text-white/90"
                    )}
                >
                    <Globe className="w-5 h-5 md:w-6 md:h-6" />
                    <span className="text-[9px] font-black uppercase tracking-wider">Info</span>
                </Link>

                {/* Center FAB Space */}
                <div className="w-16 h-16 -mt-10 transition-transform hover:scale-105 active:scale-95">
                    <Link
                        to="/report"
                        className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/40 border-4 border-background"
                    >
                        <Plus className="text-white w-8 h-8" />
                    </Link>
                </div>

                <Link
                    to="/missions"
                    className={cn(
                        "flex flex-col items-center gap-1.5 transition-all",
                        isActive("/missions") ? "text-primary scale-110" : "text-white/70 hover:text-white/90"
                    )}
                >
                    <Target className="w-5 h-5 md:w-6 md:h-6" />
                    <span className="text-[9px] font-black uppercase tracking-wider">Quest</span>
                </Link>

                <Link
                    to="/leaderboard"
                    className={cn(
                        "flex flex-col items-center gap-1.5 transition-all",
                        isActive("/leaderboard") ? "text-primary scale-110" : "text-white/70 hover:text-white/90"
                    )}
                >
                    <Trophy className="w-5 h-5 md:w-6 md:h-6" />
                    <span className="text-[9px] font-black uppercase tracking-wider">Hero</span>
                </Link>

                <Link
                    to="/profile"
                    className={cn(
                        "flex flex-col items-center gap-1.5 transition-all",
                        isActive("/profile") ? "text-primary scale-110" : "text-white/70 hover:text-white/90"
                    )}
                >
                    <User className="w-5 h-5 md:w-6 md:h-6" />
                    <span className="text-[9px] font-black uppercase tracking-wider">Me</span>
                </Link>
            </div>
        </nav>
    );
}
