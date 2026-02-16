import { Link, useLocation } from "react-router";
import { Waves, Map, Target, User, Plus, LogOut, Globe, Settings } from "lucide-react";
import { Button } from "@/react-app/components/ui/button";
import { useAuth } from "@getmocha/users-service/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/react-app/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/react-app/components/ui/dropdown-menu";
import NotificationPopover from "@/react-app/components/NotificationPopover";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const { user, redirectToLogin, logout } = useAuth();

  const navItems = [
    { path: "/", icon: Waves, label: "Home" },
    { path: "/map", icon: Map, label: "Map" },
    { path: "/missions", icon: Target, label: "Missions" },
    { path: "/leaderboard", icon: Globe, label: "Leaderboard" },
    { path: "/profile", icon: User, label: "Profile" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-background dark:from-blue-950/20 dark:to-background">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="bg-primary text-primary-foreground p-2 rounded-lg">
              <Waves className="h-6 w-6" />
            </div>
            <span className="hidden sm:inline bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
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
                  variant={isActive(item.path) ? "default" : "ghost"}
                  size="sm"
                >
                  <Link to={item.path} className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                </Button>
              );
            })}

            {/* Report Button */}
            <Button asChild size="sm" variant="outline" className="ml-1 border-primary text-primary hover:bg-primary hover:text-primary-foreground">
              <Link to="/report" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Report
              </Link>
            </Button>

            {/* Auth Controls */}
            {user ? (
              <div className="flex items-center gap-1">
                <NotificationPopover />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full ml-1">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={user.google_user_data.picture || undefined} alt={user.email} />
                        <AvatarFallback>
                          {user.google_user_data.given_name?.[0] || user.email[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium">{user.google_user_data.name || user.email}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link to="/profile">
                        <User className="mr-2 h-4 w-4" />
                        My Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link to="/settings">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => logout()} className="cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <Button onClick={() => redirectToLogin()} size="sm" className="ml-2">
                Sign In
              </Button>
            )}
          </nav>

          {/* Mobile Sign In (when not logged in) */}
          {!user && (
            <Button onClick={() => redirectToLogin()} size="sm" className="md:hidden">
              Sign In
            </Button>
          )}

          {/* Mobile user avatar */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full md:hidden">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user.google_user_data.picture || undefined} alt={user.email} />
                    <AvatarFallback>
                      {user.google_user_data.given_name?.[0] || user.email[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user.google_user_data.name || user.email}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logout()} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Bottom Navigation (Mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-around px-2">
          {/* Home */}
          <Link
            to="/"
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${isActive("/")
              ? "text-primary bg-primary/10"
              : "text-muted-foreground hover:text-foreground"
              }`}
          >
            <Waves className="h-5 w-5" />
            <span className="text-xs font-medium">Home</span>
          </Link>

          {/* Map */}
          <Link
            to="/map"
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${isActive("/map")
              ? "text-primary bg-primary/10"
              : "text-muted-foreground hover:text-foreground"
              }`}
          >
            <Map className="h-5 w-5" />
            <span className="text-xs font-medium">Map</span>
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
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${isActive("/missions")
              ? "text-primary bg-primary/10"
              : "text-muted-foreground hover:text-foreground"
              }`}
          >
            <Target className="h-5 w-5" />
            <span className="text-xs font-medium">Missions</span>
          </Link>

          {/* Leaderboard */}
          <Link
            to="/leaderboard"
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${isActive("/leaderboard")
              ? "text-primary bg-primary/10"
              : "text-muted-foreground hover:text-foreground"
              }`}
          >
            <Globe className="h-5 w-5" />
            <span className="text-xs font-medium">Rank</span>
          </Link>

          {/* Profile */}
          <Link
            to="/profile"
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${isActive("/profile")
              ? "text-primary bg-primary/10"
              : "text-muted-foreground hover:text-foreground"
              }`}
          >
            <User className="h-5 w-5" />
            <span className="text-xs font-medium">Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
