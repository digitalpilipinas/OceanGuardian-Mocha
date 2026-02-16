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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
            <Card variant="glass" className="border-white/5 group pt-8">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-white/40 group-hover:text-primary transition-colors">Total Sightings</CardTitle>
                    <Map className="h-5 w-5 text-primary opacity-50" />
                </CardHeader>
                <CardContent>
                    <div className="text-4xl font-black text-white tracking-tighter">{stats?.totalSightings.toLocaleString() || 0}</div>
                    <p className="text-[10px] text-white/30 mt-3 font-bold uppercase tracking-widest flex items-center gap-2">
                        <TrendingUp className="h-3 w-3 text-secondary" />
                        Verified Reports
                    </p>
                </CardContent>
            </Card>

            <Card variant="glass" className="border-white/5 group pt-8">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-white/40 group-hover:text-primary transition-colors">Active Missions</CardTitle>
                    <Award className="h-5 w-5 text-primary opacity-50" />
                </CardHeader>
                <CardContent>
                    <div className="text-4xl font-black text-white tracking-tighter">{stats?.activeMissions.toLocaleString() || 0}</div>
                    <p className="text-[10px] text-primary/60 mt-3 font-black uppercase tracking-widest italic group-hover:text-primary transition-colors">
                        Join cleanup efforts
                    </p>
                </CardContent>
            </Card>

            <Card variant="glass" className="border-white/5 group pt-8">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-white/40 group-hover:text-primary transition-colors">Ocean Guardians</CardTitle>
                    <Users className="h-5 w-5 text-primary opacity-50" />
                </CardHeader>
                <CardContent>
                    <div className="text-4xl font-black text-white tracking-tighter">{stats?.totalGuardians.toLocaleString() || 0}</div>
                    <p className="text-[10px] text-white/30 mt-3 font-bold uppercase tracking-widest">
                        Community Pulse
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
