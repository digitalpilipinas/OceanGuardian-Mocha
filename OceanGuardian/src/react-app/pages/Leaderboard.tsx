import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/react-app/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/react-app/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/react-app/components/ui/avatar";
import { Badge } from "@/react-app/components/ui/badge";
import { ScrollArea } from "@/react-app/components/ui/scroll-area";
import { UserProfile } from "@/shared/types";
import { Trophy, MapPin, Users, Flame, Crown, Globe } from "lucide-react";
import { useUserProfile } from "@/react-app/hooks/useUserProfile";

interface LeaderboardEntry extends UserProfile {
    rank: number;
}

const Podium = ({ top3 }: { top3: LeaderboardEntry[] }) => {
    const first = top3.find(u => u.rank === 1);
    const second = top3.find(u => u.rank === 2);
    const third = top3.find(u => u.rank === 3);

    const PodiumStep = ({ user, position }: { user?: LeaderboardEntry, position: 1 | 2 | 3 }) => {
        if (!user) return <div className="flex-1" />;

        const height = position === 1 ? "h-32" : position === 2 ? "h-24" : "h-16";
        const color = position === 1 ? "bg-amber-100 border-amber-300" : position === 2 ? "bg-slate-100 border-slate-300" : "bg-orange-50 border-orange-200";
        const iconColor = position === 1 ? "text-amber-500" : position === 2 ? "text-slate-500" : "text-orange-500";

        return (
            <div className="flex flex-col items-center justify-end flex-1 z-10 transition-all hover:scale-105">
                <div className="mb-2 flex flex-col items-center relative">
                    {position === 1 && (
                        <Crown className="w-6 h-6 text-amber-500 absolute -top-8 animate-bounce" />
                    )}
                    <Avatar className={`w-16 h-16 border-4 ${position === 1 ? 'border-amber-500' : position === 2 ? 'border-slate-400' : 'border-orange-400'}`}>
                        <AvatarImage src={user.avatar_url || undefined} />
                        <AvatarFallback>{user.username?.[0] || "?"}</AvatarFallback>
                    </Avatar>
                    <div className="bg-primary text-primary-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center absolute -bottom-1 -right-1 border border-background">
                        {position}
                    </div>
                </div>
                <div className="text-center mb-2">
                    <p className="font-bold text-sm truncate max-w-[100px] text-white drop-shadow-md">{user.username}</p>
                    <p className="text-xs text-blue-200/80 font-medium">{user.xp.toLocaleString()} XP</p>
                </div>
                <div className={`w-full ${height} ${color} border-t-4 rounded-t-lg flex items-end justify-center pb-2 shadow-sm`}>
                    <Trophy className={`w-6 h-6 ${iconColor} opacity-50`} />
                </div>
            </div>
        );
    };

    return (
        <div className="flex items-end justify-center gap-4 h-64 mb-8 px-4 w-full max-w-md mx-auto">
            <PodiumStep user={second} position={2} />
            <PodiumStep user={first} position={1} />
            <PodiumStep user={third} position={3} />
        </div>
    );
};

const LeaderboardRow = ({ entry, currentUserId }: { entry: LeaderboardEntry, currentUserId?: string }) => {
    return (
        <div className={`flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors ${entry.id === currentUserId ? "bg-muted border border-primary/20" : ""}`}>
            <div className="w-8 text-center font-bold text-muted-foreground">
                {entry.rank > 3 ? `#${entry.rank}` : ""}
                {entry.rank <= 3 && <Trophy className={`h-4 w-4 mx-auto ${entry.rank === 1 ? "text-amber-500" :
                    entry.rank === 2 ? "text-slate-400" :
                        "text-orange-400"
                    }`} />}
            </div>

            <Avatar className="w-10 h-10 border border-border">
                <AvatarImage src={entry.avatar_url || undefined} />
                <AvatarFallback>{entry.username?.[0] || "?"}</AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <p className="font-semibold truncate">{entry.username}</p>
                    {entry.is_anonymous === 1 && (
                        <Badge variant="outline" className="text-[10px] h-4 px-1">Anon</Badge>
                    )}
                    {entry.id === currentUserId && (
                        <Badge className="text-[10px] h-4 px-1">You</Badge>
                    )}
                </div>
                <div className="flex items-center text-xs text-muted-foreground gap-2">
                    <span className="flex items-center">
                        Level {entry.level}
                    </span>
                    {entry.country && (
                        <span className="flex items-center gap-0.5">
                            • {entry.country}
                        </span>
                    )}
                </div>
            </div>

            <div className="text-right">
                <p className="font-bold">{entry.xp.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">XP</p>
            </div>
        </div>
    );
};

export default function Leaderboard() {
    const { profile: user } = useUserProfile();
    const [activeTab, setActiveTab] = useState("global");
    const [data, setData] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            setLoading(true);
            try {
                const endpoint = {
                    global: "/api/leaderboard/global",
                    regional: "/api/leaderboard/regional",
                    friends: "/api/leaderboard/friends",
                    streak: "/api/leaderboard/streak",
                }[activeTab] || "/api/leaderboard/global";

                const res = await fetch(endpoint);
                const json = await res.json();

                if (Array.isArray(json)) {
                    // Add Rank locally for now
                    const ranked = json.map((entry: any, index: number) => ({
                        ...entry,
                        rank: index + 1
                    }));
                    setData(ranked);

                    if (user) {
                        // userRank logic removed as it's not used yet
                    }
                } else {
                    setData([]);
                }
            } catch (error) {
                console.error("Failed to fetch leaderboard", error);
                setData([]);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, [activeTab, user]);

    const top3 = data.slice(0, 3);
    const rest = data.slice(3);

    return (
        <div className="container mx-auto px-4 py-8 pb-24">
            <div className="flex flex-col items-center mb-8 text-center">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent mb-2">
                    Ocean Guardians Leaderboard
                </h1>
                <p className="text-muted-foreground max-w-lg">
                    See who's making the biggest impact in ocean conservation. Compete with friends and the global community! 🌍
                </p>
            </div>

            <Tabs defaultValue="global" className="w-full max-w-3xl mx-auto" onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4 mb-8">
                    <TabsTrigger value="global" className="gap-2">
                        <Globe className="w-4 h-4" />
                        <span className="hidden sm:inline">Global</span>
                    </TabsTrigger>
                    <TabsTrigger value="regional" className="gap-2">
                        <MapPin className="w-4 h-4" />
                        <span className="hidden sm:inline">Regional</span>
                    </TabsTrigger>
                    <TabsTrigger value="friends" className="gap-2">
                        <Users className="w-4 h-4" />
                        <span className="hidden sm:inline">Friends</span>
                    </TabsTrigger>
                    <TabsTrigger value="streak" className="gap-2">
                        <Flame className="w-4 h-4" />
                        <span className="hidden sm:inline">Streak</span>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="space-y-6">
                    {loading ? (
                        <div className="text-center py-20">
                            <p className="animate-pulse">Loading leaderboard...</p>
                        </div>
                    ) : (
                        <>
                            {data.length > 0 ? (
                                <>
                                    <Podium top3={top3} />

                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-lg">Rankings</CardTitle>
                                            <CardDescription>
                                                Top 50 • {activeTab === 'streak' ? 'Sorted by Streak Days' : 'Sorted by XP'}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="p-0">
                                            <ScrollArea className="h-[500px] w-full px-4">
                                                <div className="space-y-1 py-4">
                                                    {rest.map((entry) => (
                                                        <LeaderboardRow key={entry.id} entry={entry} currentUserId={user?.id} />
                                                    ))}
                                                    {rest.length === 0 && top3.length === 0 && (
                                                        <p className="text-center text-muted-foreground py-8">No data available yet.</p>
                                                    )}
                                                </div>
                                            </ScrollArea>
                                        </CardContent>
                                    </Card>

                                    {/* Sticky user rank if not in view (optional enhancement) */}
                                </>
                            ) : (
                                <div className="text-center py-12 bg-muted/30 rounded-lg border border-dashed">
                                    <p className="text-muted-foreground">
                                        No entries found for this leaderboard yet. <br />
                                        Be the first to join!
                                    </p>
                                </div>
                            )}
                        </>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
