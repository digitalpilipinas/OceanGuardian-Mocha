import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Shield, Users, BarChart3, Trophy } from "lucide-react";
import { Button } from "@/react-app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/react-app/components/ui/card";
import { Input } from "@/react-app/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/react-app/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/react-app/components/ui/table";
import { Badge } from "@/react-app/components/ui/badge";
import { useUserProfile } from "@/react-app/hooks/useUserProfile";
import type { UserProfile, AdminStats } from "@/shared/types";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/react-app/components/ui/select";

export default function AdminDashboard() {
    const { profile, loading: profileLoading } = useUserProfile();
    const navigate = useNavigate();
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [badges, setBadges] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        if (!profileLoading && profile?.role !== "admin") {
            // navigate("/"); // Redirect if not admin? Or show access denied. 
            // Let's show access denied component or redirect.
        }
    }, [profile, profileLoading, navigate]);

    const fetchStats = async () => {
        const res = await fetch("/api/admin/stats");
        if (res.ok) setStats(await res.json());
    };

    const fetchUsers = async () => {
        let url = "/api/admin/users";
        if (searchTerm) url += `?search=${encodeURIComponent(searchTerm)}`;
        const res = await fetch(url);
        if (res.ok) setUsers(await res.json());
    };

    const fetchBadges = async () => {
        const res = await fetch("/api/admin/config/badges");
        if (res.ok) setBadges(await res.json());
    };

    useEffect(() => {
        if (profile?.role === "admin") {
            setLoading(true);
            Promise.all([fetchStats(), fetchUsers(), fetchBadges()]).finally(() => setLoading(false));
        }
    }, [profile]);

    const handleRoleChange = async (userId: string, newRole: string) => {
        try {
            const res = await fetch(`/api/admin/users/${userId}/role`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role: newRole }),
            });
            if (res.ok) {
                // Optimistic update
                setUsers(users.map(u => u.id === userId ? { ...u, role: newRole as any } : u));
            }
        } catch (err) {
            console.error(err);
        }
    };

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (profile?.role === "admin") fetchUsers();
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    if (profileLoading || loading) {
        return <div className="flex h-[50vh] items-center justify-center">Loading Admin Dashboard...</div>;
    }

    if (profile?.role !== "admin") {
        return (
            <div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-center">
                <Shield className="h-16 w-16 text-destructive/50" />
                <h1 className="text-2xl font-bold">Access Denied</h1>
                <p className="text-muted-foreground">You do not have permission to view this page.</p>
                <Button onClick={() => navigate("/")}>Go Home</Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                    <p className="text-muted-foreground">Manage users, content, and platform configuration.</p>
                </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">
                        <BarChart3 className="mr-2 h-4 w-4" /> Overview
                    </TabsTrigger>
                    <TabsTrigger value="users">
                        <Users className="mr-2 h-4 w-4" /> Users
                    </TabsTrigger>
                    <TabsTrigger value="badges">
                        <Trophy className="mr-2 h-4 w-4" /> Badges
                    </TabsTrigger>
                </TabsList>

                {/* --- OVERVIEW TAB --- */}
                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats?.total_users || 0}</div>
                                <p className="text-xs text-muted-foreground">{stats?.active_now || 0} active now</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Sightings</CardTitle>
                                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats?.total_sightings || 0}</div>
                                <p className="text-xs text-muted-foreground">Reports submitted</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Missions</CardTitle>
                                <Shield className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats?.total_missions || 0}</div>
                                <p className="text-xs text-muted-foreground">Community missions</p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        <Card className="col-span-4">
                            <CardHeader>
                                <CardTitle>Role Distribution</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {Object.entries(stats?.users_by_role || {}).map(([role, count]) => (
                                        <div key={role} className="flex items-center">
                                            <div className="w-32 capitalize font-medium">{role}</div>
                                            <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-primary"
                                                    style={{ width: `${(count / (stats?.total_users || 1)) * 100}%` }}
                                                />
                                            </div>
                                            <div className="w-12 text-right text-sm text-muted-foreground">{count}</div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="col-span-3">
                            <CardHeader>
                                <CardTitle>Recent Signups</CardTitle>
                                <CardDescription>New users in the platform.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {stats?.recent_signups.map((u) => (
                                        <div key={u.id} className="flex items-center gap-4">
                                            <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                                                {u.avatar_url ? (
                                                    <img src={u.avatar_url} alt="" className="h-full w-full object-cover" />
                                                ) : (
                                                    <UserIcon className="h-5 w-5" />
                                                )}
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <p className="text-sm font-medium leading-none">{u.username}</p>
                                                <p className="text-xs text-muted-foreground">{u.email}</p>
                                            </div>
                                            <div className="text-xs text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* --- USERS TAB --- */}
                <TabsContent value="users" className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Input
                            placeholder="Search users..."
                            className="max-w-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Card>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Level / XP</TableHead>
                                    <TableHead>Joined</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <div className="font-medium">{user.username}</div>
                                            <div className="text-xs text-muted-foreground">{user.email}</div>
                                        </TableCell>
                                        <TableCell>
                                            <Select
                                                defaultValue={user.role}
                                                onValueChange={(val) => handleRoleChange(user.id, val)}
                                            >
                                                <SelectTrigger className="w-[140px] h-8">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="player">Player</SelectItem>
                                                    <SelectItem value="ambassador">Ambassador</SelectItem>
                                                    <SelectItem value="scientist">Scientist</SelectItem>
                                                    <SelectItem value="admin">Admin</SelectItem>
                                                    <SelectItem value="guest">Guest</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                        <TableCell>
                                            Lvl {user.level} <span className="text-muted-foreground">({user.xp} XP)</span>
                                        </TableCell>
                                        <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Card>
                </TabsContent>

                {/* --- BADGES TAB --- */}
                <TabsContent value="badges" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Badges Configuration</CardTitle>
                            <CardDescription>View all configured badges.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Icon</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Rarity</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {badges.map((b) => (
                                        <TableRow key={b.id}>
                                            <TableCell className="text-2xl">{b.icon}</TableCell>
                                            <TableCell className="font-medium">{b.name}</TableCell>
                                            <TableCell className="text-muted-foreground">{b.description}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{b.category}</Badge>
                                            </TableCell>
                                            <TableCell className="capitalize">{b.rarity}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

function UserIcon({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            fill="none"
            height="24"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            width="24"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    )
}
