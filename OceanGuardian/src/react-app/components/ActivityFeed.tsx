import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/react-app/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/react-app/components/ui/avatar";
import { Badge } from "@/react-app/components/ui/badge";
import { Link } from "react-router";
import { Waves, Award, Target, Flame, Users } from "lucide-react";
import { useAuth } from "@getmocha/users-service/react";

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

const activityColors: Record<string, string> = {
    sighting: "text-blue-500 bg-blue-100 dark:bg-blue-900/30",
    badge: "text-amber-500 bg-amber-100 dark:bg-amber-900/30",
    level_up: "text-purple-500 bg-purple-100 dark:bg-purple-900/30",
    mission: "text-green-500 bg-green-100 dark:bg-green-900/30",
    streak: "text-orange-500 bg-orange-100 dark:bg-orange-900/30",
};

export default function ActivityFeed() {
    const { user } = useAuth();
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
        <Card className="h-full">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Community Activity
                    </CardTitle>
                    {user && (
                        <div className="flex bg-muted rounded-lg p-1">
                            <button
                                onClick={() => setFilter("global")}
                                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${filter === "global" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                            >
                                Global
                            </button>
                            <button
                                onClick={() => setFilter("following")}
                                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${filter === "following" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                            >
                                Following
                            </button>
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                    {loading ? (
                        <div className="text-center py-8 text-muted-foreground text-sm">
                            Loading updates...
                        </div>
                    ) : activities.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground text-sm">
                            {filter === "following"
                                ? "No activity from people you follow yet. Follow more users!"
                                : "No recent activity."}
                        </div>
                    ) : (
                        activities.map((item) => {
                            const Icon = activityIcons[item.type] || Waves;
                            const colorClass = activityColors[item.type] || activityColors.sighting;

                            return (
                                <div key={item.id} className="flex gap-3 group">
                                    <div className="mt-1">
                                        <Link to={`/profile/${item.user_id}`}>
                                            <Avatar className="h-8 w-8 border-2 border-background shadow-sm">
                                                <AvatarImage src={item.avatar_url || undefined} />
                                                <AvatarFallback className="text-xs">{item.username?.[0]?.toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                        </Link>
                                    </div>
                                    <div className="flex-1 min-w-0 pb-4 border-b last:border-0 last:pb-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <Link to={`/profile/${item.user_id}`} className="text-sm font-semibold hover:underline truncate">
                                                {item.username}
                                            </Link>
                                            <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                                {formatTime(item.created_at)}
                                            </span>
                                        </div>

                                        <div className="flex items-start gap-2 mt-1">
                                            <div className={`p-1 rounded-md shrink-0 ${colorClass}`}>
                                                <Icon className="h-3 w-3" />
                                            </div>
                                            <p className="text-sm text-muted-foreground leading-snug">
                                                {item.description}
                                            </p>
                                        </div>

                                        {item.xp_earned > 0 && (
                                            <Badge variant="secondary" className="mt-2 text-[10px] h-5 px-1.5">
                                                +{item.xp_earned} XP
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
