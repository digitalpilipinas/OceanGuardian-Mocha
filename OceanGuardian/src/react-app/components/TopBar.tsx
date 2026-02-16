import { useLocation } from "react-router";
import { Search, User, LogOut, Settings } from "lucide-react";
import { useUserProfile } from "@/react-app/hooks/useUserProfile";
import { Avatar, AvatarFallback, AvatarImage } from "@/react-app/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/react-app/components/ui/dropdown-menu";
import NotificationPopover from "@/react-app/components/NotificationPopover";
import { Button } from "@/react-app/components/ui/button";
import { Link } from "react-router";

export default function TopBar() {
    const location = useLocation();
    const { profile, logout } = useUserProfile();

    const getPageTitle = () => {
        const path = location.pathname;
        if (path === "/dashboard") return "Dashboard Overview";
        if (path === "/map") return "Interactive Ocean Map";
        if (path === "/missions") return "Active Ocean Missions";
        if (path === "/report") return "Report Sighting";
        if (path === "/profile") return "My Guardian Profile";
        if (path === "/leaderboard") return "Global Leaderboard";
        if (path === "/learning") return "Ocean Learning Hub";
        if (path === "/settings") return "Account Settings";
        if (path.includes("/missions/")) return "Mission Details";
        if (path === "/admin") return "Admin Control Center";
        if (path === "/scientist/dashboard") return "Scientist Dashboard";
        return "OceanGuardian";
    };

    return (
        <header className="hidden md:flex h-16 items-center justify-between px-8 bg-background/50 backdrop-blur-md sticky top-0 z-40 border-b border-white/5">
            <div className="flex items-center gap-4">
                <h1 className="text-xl font-bold text-foreground">{getPageTitle()}</h1>
            </div>

            <div className="flex items-center gap-4">
                {/* Search Bar - Neomorphic */}
                <div className="relative group hidden lg:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Search missions, corals..."
                        className="h-10 w-64 pl-10 pr-4 rounded-xl bg-background neo-pressed text-sm focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all"
                    />
                </div>

                {/* Action Icons */}
                <div className="flex items-center gap-2">
                    <NotificationPopover />

                    {profile && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-10 w-10 rounded-xl p-0 neo-flat">
                                    <Avatar className="h-full w-full rounded-xl">
                                        <AvatarImage src={profile.avatar_url || undefined} alt={profile.username || 'Guardian'} />
                                        <AvatarFallback className="bg-slate-800 text-cyan-400 rounded-xl">
                                            {profile.username?.[0]?.toUpperCase() || 'G'}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 glass-liquid mt-2 border-white/10 rounded-2xl p-2">
                                <div className="px-2 py-2 mb-2">
                                    <p className="text-sm font-bold text-foreground">{profile.username}</p>
                                    <p className="text-xs text-muted-foreground truncate">{profile.email}</p>
                                </div>
                                <DropdownMenuSeparator className="bg-white/5" />
                                <DropdownMenuItem asChild className="rounded-xl focus:bg-white/5 cursor-pointer py-2.5">
                                    <Link to="/profile" className="flex items-center w-full">
                                        <User className="mr-3 h-4 w-4 text-primary" />
                                        <span>Profile</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild className="rounded-xl focus:bg-white/5 cursor-pointer py-2.5">
                                    <Link to="/settings" className="flex items-center w-full">
                                        <Settings className="mr-3 h-4 w-4 text-primary" />
                                        <span>Settings</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-white/5" />
                                <DropdownMenuItem
                                    onClick={() => logout()}
                                    className="rounded-xl focus:bg-red-500/10 text-red-400 focus:text-red-400 cursor-pointer py-2.5"
                                >
                                    <LogOut className="mr-3 h-4 w-4" />
                                    <span>Sign out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </div>
        </header>
    );
}
