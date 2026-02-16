import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ArrowRight, MapPin, Calendar } from "lucide-react";

interface Mission {
    id: number;
    title: string;
    description: string;
    location_name: string;
    start_time: string;
    image_url: string | null;
    status: string;
}

export default function MissionsCarousel() {
    const [missions, setMissions] = useState<Mission[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/missions?status=active&limit=5")
            .then(res => res.ok ? res.json() : [])
            .then(data => {
                // If no active, try upcoming
                if (data.length === 0) {
                    return fetch("/api/missions?status=upcoming&limit=5")
                        .then(res => res.ok ? res.json() : []);
                }
                return data;
            })
            .then(setMissions)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="h-64 bg-muted animate-pulse rounded-xl" />;

    if (missions.length === 0) {
        return (
            <div className="bg-secondary/40 border border-dashed border-white/10 rounded-[2.5rem] p-12 text-center">
                <p className="text-white/20 font-black uppercase tracking-[0.3em] mb-6 italic">No active missions right now.</p>
                <Link
                    to="/missions/create"
                    className="inline-flex items-center px-8 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-all shadow-xl shadow-primary/20"
                >
                    Create a Mission
                </Link>
            </div>
        );
    }

    return (
        <div className="relative">
            <div className="flex overflow-x-auto pb-8 gap-6 snap-x snap-mandatory hide-scrollbar">
                {missions.map((mission) => (
                    <div key={mission.id} className="min-w-[320px] max-w-[320px] flex-shrink-0 snap-center flex flex-col h-full bg-secondary/60 border border-white/5 rounded-[3rem] shadow-2xl relative overflow-hidden group hover:border-primary/40 transition-all duration-500">
                        {mission.image_url ? (
                            <div className="h-48 w-full overflow-hidden relative">
                                <div className="absolute inset-0 bg-gradient-to-t from-secondary to-transparent z-10" />
                                <img src={mission.image_url} alt={mission.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                <span className="absolute top-6 right-6 z-20 px-3 py-1 bg-accent text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">
                                    {mission.status}
                                </span>
                            </div>
                        ) : (
                            <div className="h-48 w-full bg-primary/10 flex items-center justify-center relative">
                                <MapPin className="h-12 w-12 text-primary/40" />
                                <span className="absolute top-6 right-6 z-10 px-3 py-1 bg-accent text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">
                                    {mission.status}
                                </span>
                            </div>
                        )}
                        <div className="p-8 flex-1 flex flex-col">
                            <h3 className="text-xl font-black text-white tracking-tight line-clamp-1 mb-2 uppercase group-hover:text-primary transition-colors">{mission.title}</h3>
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary/60 mb-6">
                                <MapPin className="h-3.5 w-3.5" />
                                <span className="truncate">{mission.location_name}</span>
                            </div>

                            <p className="text-white/40 text-[13px] font-medium leading-relaxed italic line-clamp-2 mb-8">
                                "{mission.description}"
                            </p>

                            <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/20">
                                    <Calendar className="h-3.5 w-3.5" />
                                    {new Date(mission.start_time).toLocaleDateString()}
                                </div>
                                <Link
                                    to={`/missions/${mission.id}`}
                                    className="px-6 py-2.5 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest border border-primary/20 transition-all"
                                >
                                    Details
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}

                {/* View All Card */}
                <Link to="/missions" className="min-w-[180px] flex-shrink-0 snap-center group">
                    <div className="h-full flex flex-col items-center justify-center bg-white/5 border border-white/5 rounded-[3rem] hover:bg-white/10 transition-all cursor-pointer p-8 text-center group-hover:border-primary/20">
                        <div className="h-16 w-16 rounded-3xl bg-primary/20 flex items-center justify-center shadow-lg mb-6 group-hover:scale-110 transition-transform">
                            <ArrowRight className="h-8 w-8 text-primary" />
                        </div>
                        <span className="font-black text-[10px] uppercase tracking-[0.3em] text-white/40 group-hover:text-white transition-colors">Observe All</span>
                    </div>
                </Link>
            </div>
        </div>
    );
}
