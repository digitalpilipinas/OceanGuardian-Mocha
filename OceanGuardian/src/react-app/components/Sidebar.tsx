import { Link, useLocation } from "react-router";
import { Waves, Map, Target, User, Globe, Shield, FlaskConical, LayoutDashboard, Settings } from "lucide-react";
import { cn } from "@/react-app/lib/utils";
import { useUserProfile } from "@/react-app/hooks/useUserProfile";

export default function Sidebar() {
    const location = useLocation();
    const { profile } = useUserProfile();

    const navItems = [
        { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
        { path: "/map", icon: Map, label: "World Map" },
        { path: "/missions", icon: Target, label: "Missions" },
        { path: "/leaderboard", icon: Globe, label: "Leaderboard" },
        { path: "/learning", icon: Globe, label: "Learning Hub" }, // Updated icon to Lucide
        { path: "/profile", icon: User, label: "My Profile" },
    ];

    if (profile?.role === "admin") {
        navItems.push({ path: "/admin", icon: Shield, label: "Admin Panel" });
    }
    if (profile?.role === "scientist" || profile?.role === "admin") {
        navItems.push({ path: "/scientist/dashboard", icon: FlaskConical, label: "Research" });
    }

    const isActive = (path: string) => location.pathname === path;

    return (
        <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 bg-sidebar/80 backdrop-blur-xl border-r border-white/5 px-4 py-8 gap-10">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center gap-3 px-2">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center neo-flat">
                    <Waves className="text-white w-6 h-6" />
                </div>
                <span className="font-bold text-xl tracking-tight text-foreground">
                    Ocean<span className="text-primary">Guardian</span>
                </span>
            </Link>

            {/* Navigation Links */}
            <nav className="flex-1 flex flex-col gap-2">
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
                                    ? "bg-primary/20 text-white shadow-[0_0_20px_rgba(3,169,244,0.15)]"
                                    : "text-white/60 hover:bg-white/5 hover:text-white"
                            )}
                        >
                            <Icon className={cn("w-5 h-5 transition-transform duration-300 group-hover:scale-110", active ? "text-primary" : "text-white/40")} />
                            <span className={cn("font-bold tracking-wide", active ? "text-white" : "text-white/70")}>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Settings at Bottom */}
            <div className="mt-auto">
                <Link
                    to="/settings"
                    className={cn(
                        "flex items-center gap-3 px-5 py-4 rounded-2xl transition-all duration-300 group hover:bg-white/5",
                        isActive("/settings")
                            ? "bg-white/10 text-white"
                            : "text-white/60 hover:text-white"
                    )}
                >
                    <Settings className="w-5 h-5 group-hover:rotate-90 transition-transform duration-700" />
                    <span className="font-bold">Settings</span>
                </Link>
            </div>
        </aside>
    );
}
