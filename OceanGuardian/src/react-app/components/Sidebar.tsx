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
        <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 bg-background border-r border-white/5 px-4 py-6 gap-8">
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
                                "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group",
                                active
                                    ? "neo-pressed text-primary"
                                    : "text-muted-foreground hover:neo-flat hover:text-foreground"
                            )}
                        >
                            <Icon className={cn("w-5 h-5 transition-transform duration-300 group-hover:scale-110", active && "text-primary")} />
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Settings at Bottom */}
            <div className="mt-auto">
                <Link
                    to="/settings"
                    className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group",
                        isActive("/settings")
                            ? "neo-pressed text-primary"
                            : "text-muted-foreground hover:neo-flat hover:text-foreground"
                    )}
                >
                    <Settings className="w-5 h-5 group-hover:rotate-45 transition-transform duration-500" />
                    <span className="font-medium">Settings</span>
                </Link>
            </div>
        </aside>
    );
}
