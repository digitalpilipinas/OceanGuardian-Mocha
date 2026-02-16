import { useEffect, useState } from "react";
import { CardContent, CardHeader, CardTitle, CardDescription } from "@/react-app/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/react-app/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/react-app/components/ui/avatar";
import { Badge } from "@/react-app/components/ui/badge";
import { Button } from "@/react-app/components/ui/button";
import { ScrollArea } from "@/react-app/components/ui/scroll-area";
import { useToast } from "@/react-app/components/ui/use-toast";
import { UserProfile } from "@/shared/types";
import { Trophy, MapPin, Users, Flame, Crown, Globe, Share2 } from "lucide-react";
import { useUserProfile } from "@/react-app/hooks/useUserProfile";

interface LeaderboardEntry extends UserProfile {
    rank: number;
}

const Podium = ({ top3, activeTab }: { top3: LeaderboardEntry[], activeTab: string }) => {
    const first = top3.find(u => u.rank === 1);
    const second = top3.find(u => u.rank === 2);
    const third = top3.find(u => u.rank === 3);

    const PodiumStep = ({ user, position }: { user?: LeaderboardEntry, position: 1 | 2 | 3 }) => {
        if (!user) return <div className="flex-1" />;

        const height = position === 1 ? "h-40" : position === 2 ? "h-32" : "h-24";
        const colorClass = position === 1
            ? "border-amber-500/50 bg-amber-500/10"
            : position === 2
                ? "border-slate-400/50 bg-slate-400/10"
                : "border-orange-500/50 bg-orange-500/10";
        const iconColor = position === 1 ? "text-amber-500" : position === 2 ? "text-slate-400" : "text-orange-500";

        return (
            <div className="flex flex-col items-center justify-end flex-1 z-10 transition-all hover:scale-105 group/podium">
                <div className="mb-4 flex flex-col items-center relative">
                    {position === 1 && (
                        <Crown className="w-8 h-8 text-amber-500 absolute -top-10 animate-bounce drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
                    )}
                    <Avatar className={`w-20 h-20 border-4 ${position === 1 ? 'border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.3)]' : position === 2 ? 'border-slate-400' : 'border-orange-400'}`}>
                        <AvatarImage src={user.avatar_url || undefined} />
                        <AvatarFallback className="bg-white/10 text-white font-bold">{user.username?.[0] || "?"}</AvatarFallback>
                    </Avatar>
                    <div className="bg-primary text-white text-xs font-black rounded-full w-7 h-7 flex items-center justify-center absolute -bottom-2 -right-2 border-2 border-background shadow-lg">
                        {position}
                    </div>
                </div>
                <div className="text-center mb-4">
                    <p className="font-black text-sm truncate max-w-[120px] text-white tracking-tight">{user.username}</p>
                    <p className="text-[10px] text-primary brightness-125 font-black uppercase tracking-widest">
                        {activeTab === 'streak'
                            ? `${(user.streak_days || 0).toLocaleString()} Days`
                            : `${(user.xp || 0).toLocaleString()} XP`}
                    </p>
                </div>
                <div className={`w-full ${height} ${colorClass} border-t-4 rounded-t-3xl flex items-center justify-center shadow-2xl transition-all group-hover/podium:brightness-125`}>
                    <Trophy className={`w-8 h-8 ${iconColor} opacity-50`} />
                </div>
            </div>
        );
    };

    return (
        <div className="flex items-end justify-center gap-6 h-80 mb-12 px-4 w-full max-w-2xl mx-auto pt-10">
            <PodiumStep user={second} position={2} />
            <PodiumStep user={first} position={1} />
            <PodiumStep user={third} position={3} />
        </div>
    );
};

const LeaderboardRow = ({ entry, currentUserId, activeTab }: { entry: LeaderboardEntry, currentUserId?: string, activeTab: string }) => {
    return (
        <div className={`flex items-center gap-5 p-4 rounded-[1.5rem] transition-all duration-300 hover:bg-white/10 group ${entry.id === currentUserId ? "bg-primary/20 border border-primary/30 shadow-lg shadow-primary/10" : "border border-transparent"}`}>
            <div className="w-10 text-center font-black text-white/30 group-hover:text-white/60 transition-colors">
                {entry.rank > 3 ? `#${entry.rank}` : ""}
                {entry.rank <= 3 && <Trophy className={`h-5 w-5 mx-auto ${entry.rank === 1 ? "text-amber-500" :
                    entry.rank === 2 ? "text-slate-400" :
                        "text-orange-400"
                    }`} />}
            </div>

            <Avatar className="w-12 h-12 border-2 border-white/10">
                <AvatarImage src={entry.avatar_url || undefined} />
                <AvatarFallback className="bg-white/5 text-white/50">{entry.username?.[0] || "?"}</AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                    <p className="font-black text-white tracking-tight truncate">{entry.username}</p>
                    {entry.is_anonymous === 1 && (
                        <Badge variant="outline" className="text-[10px] h-4 px-2 font-black border-white/20 text-white/40 uppercase tracking-widest">Anon</Badge>
                    )}
                    {entry.id === currentUserId && (
                        <Badge className="text-[10px] h-4 px-2 font-black bg-primary text-white uppercase tracking-widest">You</Badge>
                    )}
                </div>
                <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-white/40 gap-3 mt-1">
                    <span className="flex items-center text-primary/80">
                        Level {entry.level}
                    </span>
                    {entry.country && (
                        <span className="flex items-center gap-1">
                            <span className="text-white/20">•</span> {entry.country}
                        </span>
                    )}
                </div>
            </div>

            <div className="text-right">
                <p className="font-black text-white tracking-tighter text-lg">
                    {activeTab === 'streak'
                        ? (entry.streak_days || 0).toLocaleString()
                        : (entry.xp || 0).toLocaleString()}
                </p>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/30 group-hover:text-primary transition-colors">
                    {activeTab === 'streak' ? 'Days' : 'XP'}
                </p>
            </div>
        </div>
    );
};

export default function Leaderboard() {
    const { profile: user } = useUserProfile();
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState("global");
    const [data, setData] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(false);

    const userRankEntry = user ? data.find(e => e.id === user.id) : null;

    const handleShareRank = async () => {
        if (!userRankEntry) return;
        console.log("[analytics] leaderboard_share_clicked");
        const metric = activeTab === "streak" ? `${userRankEntry.streak_days || 0}-day streak` : `${(userRankEntry.xp || 0).toLocaleString()} XP`;
        const text = `I'm ranked #${userRankEntry.rank} on the OceanGuardian ${activeTab} leaderboard with ${metric}! 🏆🌊 Can you beat me?`;
        if (navigator.share) {
            try {
                await navigator.share({ title: "OceanGuardian Leaderboard", text, url: window.location.href });
            } catch (err) { console.error("Share failed", err); }
        } else {
            await navigator.clipboard.writeText(text);
            toast({ title: "Copied!", description: "Rank shared to clipboard." });
        }
    };

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
        <div className="container mx-auto px-4 py-8 pb-32">
            <div className="flex flex-col items-center mb-12 text-center">
                <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-4">
                    Ocean <span className="text-primary brightness-125 italic">Guardians</span>
                </h1>
                <p className="text-white/60 text-lg font-bold max-w-2xl italic tracking-wide">
                    See who's making the biggest impact in ocean conservation. Compete with friends and the global community!
                </p>
                {userRankEntry && (
                    <Button
                        onClick={handleShareRank}
                        className="mt-6 rounded-full px-8 h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-600/20 border-none transition-all hover:scale-105 active:scale-95"
                    >
                        <Share2 className="h-4 w-4 mr-2" />
                        Share My Rank
                    </Button>
                )}
            </div>

            <Tabs defaultValue="global" className="w-full max-w-4xl mx-auto" onValueChange={setActiveTab}>
                <TabsList className="bg-black/20 p-2 rounded-[2rem] h-18 w-full mb-12 border border-white/5">
                    <TabsTrigger value="global" className="rounded-[1.5rem] h-14 gap-3 text-white/40 font-black uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-primary/30 transition-all flex-1">
                        <Globe className="w-5 h-5" />
                        <span className="hidden sm:inline">Global</span>
                    </TabsTrigger>
                    <TabsTrigger value="regional" className="rounded-[1.5rem] h-14 gap-3 text-white/40 font-black uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-primary/30 transition-all flex-1">
                        <MapPin className="w-5 h-5" />
                        <span className="hidden sm:inline">Regional</span>
                    </TabsTrigger>
                    <TabsTrigger value="friends" className="rounded-[1.5rem] h-14 gap-3 text-white/40 font-black uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-primary/30 transition-all flex-1">
                        <Users className="w-5 h-5" />
                        <span className="hidden sm:inline">Friends</span>
                    </TabsTrigger>
                    <TabsTrigger value="streak" className="rounded-[1.5rem] h-14 gap-3 text-white/40 font-black uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-primary/30 transition-all flex-1">
                        <Flame className="w-5 h-5" />
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
                                    <Podium top3={top3} activeTab={activeTab} />

                                    <div className="bg-secondary border border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] rounded-[2.5rem] overflow-hidden">
                                        <CardHeader className="border-b border-white/5 pb-6">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <CardTitle className="text-xs font-black uppercase tracking-[0.3em] text-primary mb-1">Rankings</CardTitle>
                                                    <CardDescription className="text-[10px] font-black uppercase tracking-widest text-white/60">
                                                        Top 50 • {activeTab === 'streak' ? 'Sorted by Streak Days' : 'Sorted by XP'}
                                                    </CardDescription>
                                                </div>
                                                <Trophy className="h-5 w-5 text-white/10" />
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-2">
                                            <ScrollArea className="h-[600px] w-full px-4">
                                                <div className="space-y-2 py-6">
                                                    {rest.map((entry) => (
                                                        <LeaderboardRow key={entry.id} entry={entry} currentUserId={user?.id} activeTab={activeTab} />
                                                    ))}
                                                    {rest.length === 0 && top3.length === 0 && (
                                                        <p className="text-center text-white/20 font-black uppercase tracking-widest py-20">No data available yet.</p>
                                                    )}
                                                </div>
                                            </ScrollArea>
                                        </CardContent>
                                    </div>

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
