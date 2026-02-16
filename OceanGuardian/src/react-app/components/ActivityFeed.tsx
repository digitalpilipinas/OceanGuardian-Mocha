import { useEffect, useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/react-app/components/ui/avatar";
import { Link } from "react-router";
import { Waves, Award, Target, Flame, Users } from "lucide-react";
import { useUserProfile } from "@/react-app/hooks/useUserProfile";

interface ActivityLog {
    id: number;
    user_id: string;
    type: string;
    description: string;
    xp_earned: number;
    created_at: string;
    username: string;
    avatar_url: string;
    level: number;
    metadata?: string;
}

const activityIcons: Record<string, any> = {
    sighting: Waves,
    badge: Award,
    level_up: Award,
    mission: Target,
    streak: Flame,
};


export default function ActivityFeed() {
    const { profile: user } = useUserProfile();
    const [activities, setActivities] = useState<ActivityLog[]>([]);
    const [filter, setFilter] = useState("global"); // global | following
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchActivity();
    }, [filter, user]);

    const fetchActivity = async () => {
        setLoading(true);
        try {
            const query = filter === "following" ? "?filter=following" : "";
            const res = await fetch(`/api/activity-feed${query}`);
            if (res.ok) {
                setActivities(await res.json());
            }
        } catch (error) {
            console.error("Failed to fetch activity", error);
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (isoString: string) => {
        const date = new Date(isoString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="h-full flex flex-col bg-secondary/60 border border-white/5 rounded-[3rem] shadow-2xl relative overflow-hidden group">
            <div className="p-8 pb-4">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/20 rounded-xl">
                            <Users className="h-5 w-5 text-primary" />
                        </div>
                        <h3 className="text-xl font-black text-white tracking-tighter uppercase italic">Pulse Feed</h3>
                    </div>
                    {user && (
                        <div className="flex bg-black/20 rounded-xl p-1 border border-white/5">
                            <button
                                onClick={() => setFilter("global")}
                                className={cn(
                                    "px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                                    filter === "global" ? "bg-primary text-white shadow-lg" : "text-white/40 hover:text-white"
                                )}
                            >
                                Global
                            </button>
                            <button
                                onClick={() => setFilter("following")}
                                className={cn(
                                    "px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                                    filter === "following" ? "bg-accent text-white shadow-lg" : "text-white/40 hover:text-white"
                                )}
                            >
                                Net
                            </button>
                        </div>
                    )}
                </div>

                <div className="space-y-6 max-h-[500px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-white/5 hover:scrollbar-thumb-primary/20 transition-all">
                    {loading ? (
                        <div className="text-center py-12 text-white/20 text-[10px] font-black uppercase tracking-widest italic animate-pulse">
                            Synchronizing Stream...
                        </div>
                    ) : activities.length === 0 ? (
                        <div className="text-center py-12 text-white/20 text-[10px] font-black uppercase tracking-widest italic">
                            {filter === "following"
                                ? "Zero connectivity. Expansion required."
                                : "The deep is silent."}
                        </div>
                    ) : (
                        activities.map((item) => {
                            const Icon = activityIcons[item.type] || Waves;
                            const isAccent = item.type === 'badge' || item.type === 'level_up' || item.type === 'streak';

                            return (
                                <div key={item.id} className="flex gap-4 group/item pb-6 border-b border-white/5 last:border-0 last:pb-0">
                                    <div className="mt-1">
                                        <Link to={`/profile/${item.user_id}`}>
                                            <Avatar className="h-10 w-10 border border-white/10 p-0.5 bg-secondary group-hover/item:border-primary/40 transition-colors">
                                                <AvatarImage src={item.avatar_url || undefined} className="rounded-full" />
                                                <AvatarFallback className="text-[10px] font-black uppercase bg-primary/20 text-primary">{item.username?.[0]?.toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                        </Link>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2 mb-1">
                                            <Link to={`/profile/${item.user_id}`} className="text-sm font-black text-white hover:text-primary transition-colors tracking-tight truncate uppercase">
                                                {item.username}
                                            </Link>
                                            <span className="text-[9px] font-black uppercase tracking-widest text-white/20 whitespace-nowrap">
                                                {formatTime(item.created_at)}
                                            </span>
                                        </div>

                                        <div className="flex items-start gap-3 mt-2">
                                            <div className={cn(
                                                "p-2 rounded-lg shrink-0",
                                                isAccent ? "bg-accent/10 text-accent" : "bg-primary/10 text-primary"
                                            )}>
                                                <Icon className="h-3.5 w-3.5" />
                                            </div>
                                            <p className="text-[12px] font-medium text-white/40 leading-relaxed italic">
                                                "{item.description}"
                                            </p>
                                        </div>

                                        {item.xp_earned > 0 && (
                                            <div className="mt-3 flex items-center gap-2">
                                                <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[9px] font-black uppercase tracking-widest border border-primary/20">
                                                    +{item.xp_earned} XP Uplink
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}

function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ');
}
