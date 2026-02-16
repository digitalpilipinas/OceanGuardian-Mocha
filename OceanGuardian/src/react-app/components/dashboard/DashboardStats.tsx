import { useEffect, useState } from "react";
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
            <div className="p-10 bg-secondary border border-white/5 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex justify-between items-start mb-6">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/60 group-hover:text-primary transition-colors">Total Sightings</p>
                    <div className="p-3 bg-primary/20 rounded-2xl">
                        <Map className="h-5 w-5 text-primary" />
                    </div>
                </div>
                <div className="text-4xl font-black text-white tracking-tighter italic">{stats?.totalSightings.toLocaleString() || 0}</div>
                <p className="text-[10px] text-primary brightness-150 mt-4 font-black uppercase tracking-widest flex items-center gap-2">
                    <TrendingUp className="h-3 w-3" />
                    Verified Reports
                </p>
            </div>

            <div className="p-10 bg-secondary border border-white/5 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-tr from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex justify-between items-start mb-6">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/60 group-hover:text-accent transition-colors">Active Missions</p>
                    <div className="p-3 bg-accent/20 rounded-2xl">
                        <Award className="h-5 w-5 text-accent" />
                    </div>
                </div>
                <div className="text-4xl font-black text-white tracking-tighter italic">{stats?.activeMissions.toLocaleString() || 0}</div>
                <p className="text-[10px] text-accent mt-4 font-black uppercase tracking-widest italic animate-pulse">
                    Join Cleanup Ops
                </p>
            </div>

            <div className="p-10 bg-secondary border border-white/5 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex justify-between items-start mb-6">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/60 group-hover:text-primary transition-colors">Ocean Guardians</p>
                    <div className="p-3 bg-primary/20 rounded-2xl">
                        <Users className="h-5 w-5 text-primary" />
                    </div>
                </div>
                <div className="text-4xl font-black text-white tracking-tighter italic">{stats?.totalGuardians.toLocaleString() || 0}</div>
                <p className="text-[10px] text-white/40 mt-4 font-black uppercase tracking-widest">
                    Community Frequency
                </p>
            </div>
        </div>
    );
}
