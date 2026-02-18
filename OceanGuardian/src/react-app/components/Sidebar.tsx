import { Link, useLocation } from "react-router-dom";
import logo from "@/react-app/assets/logo-256.png";
import { Waves, Map, Target, User, Globe, Shield, FlaskConical, LayoutDashboard, Settings } from "lucide-react";
import { cn } from "@/react-app/lib/utils";
import { useUserProfile } from "@/react-app/hooks/useUserProfile";

export default function Sidebar() {
    const location = useLocation();
    const { profile } = useUserProfile();

    const navItems = [
        { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
        { path: "/map", icon: Map, label: "World Map" },
        { path: "/report", icon: Waves, label: "Report Sighting" },
        { path: "/coral-scan", icon: FlaskConical, label: "Coral Scan" },
        { path: "/missions", icon: Target, label: "Missions" },
        { path: "/leaderboard", icon: Globe, label: "Leaderboard" },
        { path: "/learning", icon: Globe, label: "Learning Hub" },
        { path: "/profile", icon: User, label: "My Profile" },
    ];

    if (profile?.role === "admin") {
        navItems.push({ path: "/admin", icon: Shield, label: "Admin Panel" });
    }
    if (profile?.role === "ambassador") {
        navItems.push({ path: "/ambassador", icon: Shield, label: "Ambassador Panel" });
    }
    if (profile?.role === "scientist" || profile?.role === "admin") {
        navItems.push({ path: "/scientist/dashboard", icon: FlaskConical, label: "Research" });
    }

    const isActive = (path: string) => location.pathname === path;

    return (
        <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 bg-secondary border-r border-white/5 px-4 py-8 gap-10 relative overflow-hidden shadow-2xl">
            {/* Subtle Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-primary/10 pointer-events-none" />

            {/* Logo */}
            <Link to="/dashboard" className="flex items-center gap-3 px-2 relative z-10 transition-transform hover:scale-105 active:scale-95">
                <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-lg shadow-accent/20 border border-white/10">
                    <img
                        src={logo}
                        alt="OceanGuardian"
                        className="h-8 w-8 transition-transform group-hover:scale-110"
                    />
                </div>
                <div className="flex flex-col -gap-1">
                    <span className="font-black text-xl tracking-tighter text-white leading-none">
                        Ocean
                    </span>
                    <span className="font-black text-lg tracking-tighter text-accent italic leading-none">
                        Guardian
                    </span>
                </div>
            </Link>

            {/* Navigation Links */}
            <nav className="flex-1 flex flex-col gap-2 relative z-10">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={cn(
                                "flex items-center gap-3 px-5 py-3.5 rounded-2xl transition-all duration-300 group hover:translate-x-1",
                                active
                                    ? "bg-primary/20 text-white shadow-[0_0_20px_rgba(3,169,244,0.15)] ring-1 ring-primary/20"
                                    : "text-white/60 hover:bg-white/5 hover:text-white"
                            )}
                        >
                            <Icon className={cn("w-5 h-5 transition-transform duration-300 group-hover:scale-110", active ? "text-primary brightness-125" : "text-white/40")} />
                            <span className={cn("font-black tracking-tight uppercase text-[10px]", active ? "text-white" : "text-white/60")}>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Settings at Bottom */}
            <div className="mt-auto relative z-10">
                <Link
                    to="/settings"
                    className={cn(
                        "flex items-center gap-3 px-5 py-4 rounded-2xl transition-all duration-300 group hover:bg-white/5",
                        isActive("/settings")
                            ? "bg-accent/20 text-white ring-1 ring-accent/20 shadow-[0_0_20px_rgba(255,100,50,0.1)]"
                            : "text-white/50 hover:text-white"
                    )}
                >
                    <Settings className={cn("w-5 h-5 transition-transform duration-700 group-hover:rotate-90", isActive("/settings") ? "text-accent" : "text-white/30")} />
                    <span className="font-black tracking-tight uppercase text-[10px]">Settings</span>
                </Link>
            </div>
        </aside>
    );
}
