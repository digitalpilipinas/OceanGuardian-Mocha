import { Link, useLocation } from "react-router";
import { LayoutDashboard, Map, Plus, Target, User } from "lucide-react";
import { cn } from "@/react-app/lib/utils";

export default function BottomNav() {
    const location = useLocation();
    const isActive = (path: string) => location.pathname === path;

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-8 h-28 flex items-center justify-center">
            <div className="glass-liquid w-full h-18 rounded-[2.5rem] flex items-center justify-around px-4 relative shadow-2xl shadow-black/40">
                {/* Left Side Items */}
                <Link
                    to="/dashboard"
                    className={cn(
                        "flex flex-col items-center gap-1.5 transition-all",
                        isActive("/dashboard") ? "text-primary scale-110" : "text-white/70 hover:text-white/90"
                    )}
                >
                    <LayoutDashboard className="w-6 h-6" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Base</span>
                </Link>

                <Link
                    to="/map"
                    className={cn(
                        "flex flex-col items-center gap-1.5 transition-all",
                        isActive("/map") ? "text-primary scale-110" : "text-white/70 hover:text-white/90"
                    )}
                >
                    <Map className="w-6 h-6" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Map</span>
                </Link>

                {/* Center FAB Space */}
                <div className="w-20 h-20 -mt-14 transition-transform hover:scale-105 active:scale-95">
                    <Link
                        to="/report"
                        className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/40 border-4 border-background"
                    >
                        <Plus className="text-white w-10 h-10" />
                    </Link>
                </div>

                {/* Right Side Items */}
                <Link
                    to="/missions"
                    className={cn(
                        "flex flex-col items-center gap-1.5 transition-all",
                        isActive("/missions") ? "text-primary scale-110" : "text-white/70 hover:text-white/90"
                    )}
                >
                    <Target className="w-6 h-6" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Quest</span>
                </Link>

                <Link
                    to="/profile"
                    className={cn(
                        "flex flex-col items-center gap-1.5 transition-all",
                        isActive("/profile") ? "text-primary scale-110" : "text-white/70 hover:text-white/90"
                    )}
                >
                    <User className="w-6 h-6" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Me</span>
                </Link>
            </div>
        </nav>
    );
}
