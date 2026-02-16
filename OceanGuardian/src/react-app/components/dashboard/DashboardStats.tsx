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
            <Card variant="neomorph">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Total Sightings</CardTitle>
                    <div className="p-2 neo-pressed rounded-lg">
                        <Map className="h-4 w-4 text-primary" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold">{stats?.totalSightings.toLocaleString() || 0}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        <TrendingUp className="inline h-3 w-3 text-secondary mr-1" />
                        <span className="text-secondary font-medium">Verified reports</span>
                    </p>
                </CardContent>
            </Card>

            <Card variant="neomorph">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Active Missions</CardTitle>
                    <div className="p-2 neo-pressed rounded-lg">
                        <Award className="h-4 w-4 text-primary" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold">{stats?.activeMissions.toLocaleString() || 0}</div>
                    <p className="text-xs text-muted-foreground mt-1 text-primary italic font-medium">
                        Join cleanup efforts
                    </p>
                </CardContent>
            </Card>

            <Card variant="neomorph">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Ocean Guardians</CardTitle>
                    <div className="p-2 neo-pressed rounded-lg">
                        <Users className="h-4 w-4 text-primary" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold">{stats?.totalGuardians.toLocaleString() || 0}</div>
                    <p className="text-xs text-muted-foreground mt-1 font-medium">
                        Community pulse
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
