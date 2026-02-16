import { Link, useLocation } from "react-router";
import { Waves, Map, Target, User, Plus, LogOut, Globe, Settings, Shield, FlaskConical } from "lucide-react";
import { Button } from "@/react-app/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
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
import OceanBackground from "@/react-app/components/OceanBackground";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const { profile, logout } = useUserProfile();

  const navItems = [
    { path: "/", icon: Waves, label: "Home" },
    { path: "/map", icon: Map, label: "Map" },
    { path: "/missions", icon: Target, label: "Missions" },
    { path: "/leaderboard", icon: Globe, label: "Leaderboard" },
    { path: "/profile", icon: User, label: "Profile" },
  ];

  if (profile?.role === "admin") {
    navItems.push({ path: "/admin", icon: Shield, label: "Admin" });
  }
  if (profile?.role === "ambassador") {
    navItems.push({ path: "/ambassador", icon: Globe, label: "Region" });
  }
  if (profile?.role === "scientist" || profile?.role === "admin") {
    if (!navItems.find(i => i.path === "/scientist/dashboard")) {
      navItems.push({ path: "/scientist/dashboard", icon: FlaskConical, label: "Science" });
    }
  }

  const isActive = (path: string) => location.pathname === path;
  const isLandingPage = location.pathname === "/";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Ocean Background Layer - Only for Dashboard */}
      {!isLandingPage && <OceanBackground bubbleDensity="low" variant="deep" />}

      {/* Top Navigation Bar - Only for Dashboard */}
      {!isLandingPage && (
        <header className="sticky top-0 z-50 w-full bg-slate-900/50 backdrop-blur-xl border-b border-white/10">
          <div className="container flex h-16 items-center justify-between px-4">
            <Link to="/" className="flex items-center gap-2 font-bold text-xl group">
              <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all group-hover:shadow-[0_0_20px_rgba(6,182,212,0.6)]">
                <Waves className="h-6 w-6 text-white" />
              </div>
              <span className="hidden sm:inline bg-gradient-to-r from-cyan-200 to-blue-400 bg-clip-text text-transparent group-hover:text-cyan-300 transition-colors">
                OceanGuardian
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.path}
                    asChild
                    variant="ghost"
                    size="sm"
                    className={isActive(item.path)
                      ? "bg-white/10 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.2)] border border-white/10"
                      : "text-slate-400 hover:text-white hover:bg-white/5"}
                  >
                    <Link to={item.path} className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  </Button>
                );
              })}

              {/* Report Button */}
              <Button asChild size="sm" className="ml-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white border-0 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                <Link to="/report" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Report
                </Link>
              </Button>

              {/* Auth Controls */}
              {profile ? (
                <div className="flex items-center gap-1">
                  <NotificationPopover />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-9 w-9 rounded-full ml-1 border border-white/10 hover:border-white/30 transition-colors">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={profile.avatar_url || undefined} alt={profile.username || 'Guardian'} />
                          <AvatarFallback className="bg-slate-800 text-cyan-300">
                            {profile.username?.[0]?.toUpperCase() || 'G'}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 bg-slate-900/90 backdrop-blur-xl border border-white/10 text-slate-200">
                      <div className="px-2 py-1.5">
                        <p className="text-sm font-medium text-white">{profile.username}</p>
                        <p className="text-xs text-slate-400">{profile.email || 'Guest User'}</p>
                      </div>
                      <DropdownMenuSeparator className="bg-white/10" />
                      <DropdownMenuItem asChild className="cursor-pointer focus:bg-white/10 focus:text-white">
                        <Link to="/profile">
                          <User className="mr-2 h-4 w-4" />
                          My Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="cursor-pointer focus:bg-white/10 focus:text-white">
                        <Link to="/settings">
                          <Settings className="mr-2 h-4 w-4" />
                          Settings
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-white/10" />
                      <DropdownMenuItem onClick={() => logout()} className="cursor-pointer focus:bg-white/10 focus:text-white text-red-400 focus:text-red-300">
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <Button asChild size="sm" className="ml-2 bg-white/10 hover:bg-white/20 text-white border border-white/20">
                  <Link to="/login">Sign In</Link>
                </Button>
              )}
            </nav>

            {/* Mobile Sign In (when not logged in) */}
            {!profile && (
              <Button asChild size="sm" className="md:hidden bg-white/10 hover:bg-white/20 text-white border border-white/20">
                <Link to="/login">Sign In</Link>
              </Button>
            )}

            {/* Mobile user avatar */}
            {profile && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full md:hidden border border-white/10">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={profile.avatar_url || undefined} alt={profile.username || 'Guardian'} />
                      <AvatarFallback className="bg-slate-800 text-cyan-300">
                        {profile.username?.[0]?.toUpperCase() || 'G'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-slate-900/90 backdrop-blur-xl border border-white/10 text-slate-200">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium text-white">{profile.username}</p>
                    <p className="text-xs text-slate-400">{profile.email || 'Guest'}</p>
                  </div>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem onClick={() => logout()} className="cursor-pointer focus:bg-white/10 focus:text-white text-red-400">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className={isLandingPage ? "flex-1" : "flex-1 overflow-x-hidden relative z-10 px-4 md:px-8 pt-6"}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={isLandingPage ? "" : "pb-24 md:pb-6 max-w-7xl mx-auto"}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation (Mobile) - Only for Dashboard */}
      {!isLandingPage && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-liquid border-none rounded-t-3xl shadow-2xl">
          <div className="container flex h-20 items-center justify-around px-2 pb-4">
            {/* Home */}
            <Link
              to="/"
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-300 ${isActive("/")
                ? "text-primary neo-pressed scale-95"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <Waves className="h-5 w-5" />
              <span className="text-xs font-semibold">Home</span>
            </Link>

            {/* Map */}
            <Link
              to="/map"
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-300 ${isActive("/map")
                ? "text-primary neo-pressed scale-95"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <Map className="h-5 w-5" />
              <span className="text-xs font-semibold">Map</span>
            </Link>

            {/* Center Report Button */}
            <Link
              to="/report"
              className="flex items-center justify-center -mt-5 bg-primary text-primary-foreground h-14 w-14 rounded-full shadow-lg hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-7 w-7" />
            </Link>

            {/* Missions */}
            <Link
              to="/missions"
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-300 ${isActive("/missions")
                ? "text-primary neo-pressed scale-95"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <Target className="h-5 w-5" />
              <span className="text-xs font-semibold">Missions</span>
            </Link>

            {/* Leaderboard */}
            <Link
              to="/leaderboard"
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-300 ${isActive("/leaderboard")
                ? "text-primary neo-pressed scale-95"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <Globe className="h-5 w-5" />
              <span className="text-xs font-semibold">Rank</span>
            </Link>

            {/* Profile */}
            <Link
              to="/profile"
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-300 ${isActive("/profile")
                ? "text-primary neo-pressed scale-95"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <User className="h-5 w-5" />
              <span className="text-xs font-semibold">Profile</span>
            </Link>
          </div>
        </nav>
      )}
    </div>
  );
}
