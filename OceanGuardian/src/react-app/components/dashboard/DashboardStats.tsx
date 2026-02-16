import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/react-app/components/ui/card";
import { Map, Award, Users, TrendingUp } from "lucide-react";

interface Stats {
    totalSightings: number;
    activeMissions: number;
    totalGuardians: number;
}

export default function DashboardStats() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/dashboard/stats")
            .then((res) => res.ok ? res.json() : null)
            .then(setStats)
            .catch((err) => console.error("Failed to fetch stats", err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-pulse">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-32 bg-muted rounded-xl"></div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Sightings</CardTitle>
                    <Map className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats?.totalSightings.toLocaleString() || 0}</div>
                    <p className="text-xs text-muted-foreground">
                        <TrendingUp className="inline h-3 w-3 text-secondary mr-1" />
                        Verified reports
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Missions</CardTitle>
                    <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats?.activeMissions.toLocaleString() || 0}</div>
                    <p className="text-xs text-muted-foreground">
                        Join the cleanup efforts
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Ocean Guardians</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats?.totalGuardians.toLocaleString() || 0}</div>
                    <p className="text-xs text-muted-foreground">
                        Community members
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
