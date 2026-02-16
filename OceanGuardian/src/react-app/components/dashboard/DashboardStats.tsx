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
            <Card className="bg-slate-900/50 border-white/10 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-400 uppercase tracking-wider">Total Sightings</CardTitle>
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                        <Map className="h-4 w-4 text-blue-400" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-white">{stats?.totalSightings.toLocaleString() || 0}</div>
                    <p className="text-xs text-slate-400/80 mt-1">
                        <TrendingUp className="inline h-3 w-3 text-emerald-400 mr-1" />
                        <span className="text-emerald-400">Verified reports</span>
                    </p>
                </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-white/10 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-400 uppercase tracking-wider">Active Missions</CardTitle>
                    <div className="p-2 bg-amber-500/10 rounded-lg">
                        <Award className="h-4 w-4 text-amber-400" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-white">{stats?.activeMissions.toLocaleString() || 0}</div>
                    <p className="text-xs text-slate-400/80 mt-1">
                        Join cleanup efforts
                    </p>
                </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-white/10 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-400 uppercase tracking-wider">Ocean Guardians</CardTitle>
                    <div className="p-2 bg-cyan-500/10 rounded-lg">
                        <Users className="h-4 w-4 text-cyan-400" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-white">{stats?.totalGuardians.toLocaleString() || 0}</div>
                    <p className="text-xs text-slate-400/80 mt-1">
                        Community members
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
