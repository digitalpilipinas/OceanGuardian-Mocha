import { Link, useLocation } from "react-router";
import { LayoutDashboard, Map, Plus, Target, User } from "lucide-react";
import { cn } from "@/react-app/lib/utils";

export default function BottomNav() {
    const location = useLocation();
    const isActive = (path: string) => location.pathname === path;

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-2 h-24 flex items-center justify-center">
            <div className="glass-liquid w-full h-16 rounded-3xl flex items-center justify-around px-2 relative">
                {/* Left Side Items */}
                <Link
                    to="/dashboard"
                    className={cn(
                        "flex flex-col items-center gap-1 group",
                        isActive("/dashboard") ? "text-primary" : "text-muted-foreground"
                    )}
                >
                    <div className={cn("p-2 rounded-xl transition-all", isActive("/dashboard") && "neo-pressed")}>
                        <LayoutDashboard className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold">Base</span>
                </Link>

                <Link
                    to="/map"
                    className={cn(
                        "flex flex-col items-center gap-1 group",
                        isActive("/map") ? "text-primary" : "text-muted-foreground"
                    )}
                >
                    <div className={cn("p-2 rounded-xl transition-all", isActive("/map") && "neo-pressed")}>
                        <Map className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold">Map</span>
                </Link>

                {/* Center FAB Space */}
                <div className="w-16 h-16 -mt-12 group relative flex items-center justify-center">
                    <Link
                        to="/report"
                        className="w-14 h-14 rounded-full bg-primary flex items-center justify-center neo-flat shadow-xl shadow-primary/20 hover:scale-110 active:scale-95 transition-all duration-300"
                    >
                        <Plus className="text-white w-8 h-8" />
                    </Link>
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[10px] font-bold text-primary">Report</div>
                </div>

                {/* Right Side Items */}
                <Link
                    to="/missions"
                    className={cn(
                        "flex flex-col items-center gap-1 group",
                        isActive("/missions") ? "text-primary" : "text-muted-foreground"
                    )}
                >
                    <div className={cn("p-2 rounded-xl transition-all", isActive("/missions") && "neo-pressed")}>
                        <Target className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold">Quest</span>
                </Link>

                <Link
                    to="/profile"
                    className={cn(
                        "flex flex-col items-center gap-1 group",
                        isActive("/profile") ? "text-primary" : "text-muted-foreground"
                    )}
                >
                    <div className={cn("p-2 rounded-xl transition-all", isActive("/profile") && "neo-pressed")}>
                        <User className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold">Me</span>
                </Link>
            </div>
        </nav>
    );
}
