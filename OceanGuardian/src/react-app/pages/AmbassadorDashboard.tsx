import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { Globe, MapPin, Users, Target, Trophy, Plus } from "lucide-react";
import { Button } from "@/react-app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/react-app/components/ui/card";
import { useUserProfile } from "@/react-app/hooks/useUserProfile";
import type { RegionalStats } from "@/shared/types";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/react-app/components/ui/table";


export default function AmbassadorDashboard() {
    const { profile, loading: profileLoading } = useUserProfile();
    const navigate = useNavigate();
    const [stats, setStats] = useState<RegionalStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!profileLoading && profile?.role !== "ambassador" && profile?.role !== "admin") {
            // navigate("/"); 
        }
    }, [profile, profileLoading, navigate]);

    useEffect(() => {
        if (profile?.role === "ambassador" || profile?.role === "admin") {
            setLoading(true);
            fetch("/api/ambassador/stats")
                .then(res => {
                    if (res.ok) return res.json();
                    throw new Error("Failed to fetch stats");
                })
                .then(setStats)
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    }, [profile]);


    if (profileLoading || loading) {
        return <div className="flex h-[50vh] items-center justify-center">Loading Regional Data...</div>;
    }

    if (!stats) {
        return (
            <div className="container mx-auto p-8 text-center">
                <h1 className="text-2xl font-bold">No Regional Data</h1>
                <p>You might not have a region assigned yet.</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <Globe className="h-8 w-8 text-primary" />
                        Ambassador Dashboard
                    </h1>
                    <p className="text-muted-foreground">
                        Managing region: <span className="font-semibold text-foreground">{stats.region}</span>
                    </p>
                </div>
                <Button asChild>
                    <Link to="/missions/create">
                        <Plus className="mr-2 h-4 w-4" /> Organize Mission
                    </Link>
                </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Community Members</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total_users}</div>
                        <p className="text-xs text-muted-foreground">Guardians in {stats.region}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Missions</CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.active_missions}</div>
                        <p className="text-xs text-muted-foreground">Happening now</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Impact</CardTitle>
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total_impact}</div>
                        <p className="text-xs text-muted-foreground">Sightings reported</p>
                    </CardContent>
                </Card>
            </div>

            {/* Top Contributors */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card className="col-span-2 md:col-span-1">
                    <CardHeader>
                        <CardTitle>Top Contributors</CardTitle>
                        <CardDescription>Highest XP earners in {stats.region}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]"></TableHead>
                                    <TableHead>User</TableHead>
                                    <TableHead className="text-right">XP</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {stats.top_contributors.map((user, index) => (
                                    <TableRow key={user.user_id}>
                                        <TableCell className="font-medium text-muted-foreground">
                                            {index + 1}
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">{user.username}</div>
                                        </TableCell>
                                        <TableCell className="text-right font-bold">
                                            {user.xp.toLocaleString()}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Card className="col-span-2 md:col-span-1 bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Trophy className="h-5 w-5 text-yellow-500" />
                            Ambassador Tools
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            As an Ambassador, you can organize missions and verify local sightings.
                        </p>
                        <div className="grid grid-cols-1 gap-2">
                            <Button variant="secondary" className="justify-start" asChild>
                                <Link to="/missions">
                                    <Target className="mr-2 h-4 w-4" /> Manage Missions
                                </Link>
                            </Button>
                            <Button variant="secondary" className="justify-start" asChild>
                                <Link to="/map">
                                    <MapPin className="mr-2 h-4 w-4" /> View Regional Map
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
