import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { useUserProfile } from "@/react-app/hooks/useUserProfile";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/react-app/components/ui/card";
import { Button } from "@/react-app/components/ui/button";
import { Badge } from "@/react-app/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/react-app/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/react-app/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/react-app/components/ui/dialog";
import { Input } from "@/react-app/components/ui/input";
import { Label } from "@/react-app/components/ui/label";
import { Textarea } from "@/react-app/components/ui/textarea";
import { Loader2, Calendar, MapPin, Users, ArrowLeft, CheckCircle, Clock, Trophy, Share2 } from "lucide-react";
import { useToast } from "@/react-app/components/ui/use-toast";
import type { Mission, MissionParticipant, MissionImpactReport } from "@/shared/types";
import MissionChat from "@/react-app/components/MissionChat";

interface MissionDetailData {
    mission: Mission & { organizer_name?: string; organizer_avatar?: string };
    participants: MissionParticipant[];
    impact_report: MissionImpactReport | null;
}

export default function MissionDetail() {
    const { id } = useParams();
    const { profile: user } = useUserProfile();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [data, setData] = useState<MissionDetailData | null>(null);
    const [loading, setLoading] = useState(true);
    const [joining, setJoining] = useState(false);
    const [checkingIn, setCheckingIn] = useState(false);

    const [userRole, setUserRole] = useState<string>("player");
    const [showCompleteDialog, setShowCompleteDialog] = useState(false);
    const [completing, setCompleting] = useState(false);
    const [impactData, setImpactData] = useState({
        total_trash_weight: "",
        trash_bags_count: "",
        participants_count: "",
        duration_minutes: "",
        notes: "",
    });

    const fetchMission = async () => {
        try {
            const res = await fetch(`/api/missions/${id}`);
            if (res.ok) {
                setData(await res.json());
            } else {
                toast({ title: "Error", description: "Mission not found", variant: "destructive" });
                navigate("/missions");
            }
        } catch (err) {
            console.error("Failed to fetch mission", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchMission();
        if (user) {
            fetch("/api/profiles/me").then(r => r.json()).then(p => setUserRole(p.role)).catch(() => { });
        }
    }, [id, navigate, user]);

    const handleJoin = async () => {
        if (!user) return;
        setJoining(true);
        try {
            const res = await fetch(`/api/missions/${id}/join`, { method: "POST" });
            if (res.ok) {
                toast({ title: "Joined!", description: "You have RSVP'd to this mission." });
                fetchMission();
            } else {
                const err = await res.json();
                toast({ title: "Error", description: err.error, variant: "destructive" });
            }
        } catch {
            toast({ title: "Error", description: "Failed to join mission", variant: "destructive" });
        } finally {
            setJoining(false);
        }
    };

    const handleCheckIn = async () => {
        if (!user) return;
        setCheckingIn(true);

        if (!navigator.geolocation) {
            toast({ title: "Error", description: "Geolocation not supported", variant: "destructive" });
            setCheckingIn(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                try {
                    const res = await fetch(`/api/missions/${id}/check-in`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            latitude: pos.coords.latitude,
                            longitude: pos.coords.longitude
                        }),
                    });

                    if (res.ok) {
                        toast({ title: "Checked In!", description: "You are now checked in." });
                        fetchMission();
                    } else {
                        const err = await res.json();
                        toast({ title: "Check-in Failed", description: err.error, variant: "destructive" });
                    }
                } catch {
                    toast({ title: "Error", description: "Network error", variant: "destructive" });
                } finally {
                    setCheckingIn(false);
                }
            },
            () => {
                toast({ title: "GPS Error", description: "Could not get location. Ensure permissions are granted.", variant: "destructive" });
                setCheckingIn(false);
            }
        );
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!data) return null;

    const { mission, participants, impact_report } = data;
    const userParticipant = user ? participants.find(p => p.user_id === user.id) : null;
    const isJoined = !!userParticipant;
    const isCheckedIn = userParticipant?.status === "checked_in";

    const startTime = new Date(mission.start_time);
    const endTime = new Date(mission.end_time);
    const now = new Date();
    const isStarted = now >= startTime;
    // const isOngoing = now >= startTime && now <= endTime;
    const isEnded = now > endTime;
    const checkInOpen = now >= new Date(startTime.getTime() - 30 * 60000) && now <= endTime;

    const isOrganizer = user && mission.organizer_id === user.id;
    const canComplete = (isOrganizer || userRole === 'admin') && mission.status !== 'completed' && isStarted;

    const handleCompleteMission = async () => {
        setCompleting(true);
        try {
            const payload = {
                total_trash_weight: parseFloat(impactData.total_trash_weight),
                trash_bags_count: parseInt(impactData.trash_bags_count),
                participants_count: parseInt(impactData.participants_count) || participants.length, // Default to registered count if empty
                duration_minutes: parseInt(impactData.duration_minutes),
                notes: impactData.notes,
            };

            const res = await fetch(`/api/missions/${id}/complete`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                toast({ title: "Mission Completed!", description: "Impact report generated and XP distributed." });
                setShowCompleteDialog(false);
                fetchMission();
            } else {
                const err = await res.json();
                toast({ title: "Error", description: err.error, variant: "destructive" });
            }
        } catch (err) {
            console.error(err);
            toast({ title: "Error", description: "Failed to complete mission", variant: "destructive" });
        } finally {
            setCompleting(false);
        }
    };

    // Sort participants for leaderboard
    const leaderboard = [...participants].sort((a, b) => {
        if (mission.status === 'completed') {
            return (b.xp_awarded || 0) - (a.xp_awarded || 0);
        }
        // If not completed, maybe sort by check-in time?
        if (a.status === 'checked_in' && b.status !== 'checked_in') return -1;
        if (a.status !== 'checked_in' && b.status === 'checked_in') return 1;
        return 0; // alphabetical or join order?
    });

    return (
        <div className="container mx-auto px-4 py-8 pb-20 md:pb-8 max-w-4xl">
            <Button variant="ghost" onClick={() => navigate("/missions")} className="mb-4 pl-0">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Missions
            </Button>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Column: Mission Content (Tabs) */}
                <div className="md:col-span-2">
                    <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="grid w-full grid-cols-3 mb-4">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
                            <TabsTrigger value="chat">Chat</TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="space-y-6">
                            <Card>
                                {mission.image_url && (
                                    <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
                                        <img src={mission.image_url} alt={mission.title} className="w-full h-full object-cover" />
                                    </div>
                                )}
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-2xl">{mission.title}</CardTitle>
                                            <CardDescription className="flex items-center gap-1 mt-1">
                                                <MapPin className="h-4 w-4" /> {mission.location_name}
                                            </CardDescription>
                                        </div>
                                        <Badge variant={mission.status === "active" ? "default" : "secondary"} className="capitalize">
                                            {mission.status}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-4 w-4" />
                                            {startTime.toLocaleDateString()} {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-4 w-4" />
                                            {Math.round((endTime.getTime() - startTime.getTime()) / 60000)} mins
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Users className="h-4 w-4" />
                                            {participants.length} / {mission.max_participants || '∞'}
                                        </div>
                                    </div>

                                    <div className="prose dark:prose-invert">
                                        <p>{mission.description}</p>
                                    </div>

                                    {/* Organizer */}
                                    <div className="flex items-center gap-3 pt-4 border-t">
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={mission.organizer_avatar} />
                                            <AvatarFallback>{mission.organizer_name?.[0] || "?"}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="text-sm font-medium">Organized by</p>
                                            <p className="text-sm text-muted-foreground">{mission.organizer_name || "Unknown"}</p>
                                        </div>

                                        {/* Completion Button for Organizer */}
                                        {canComplete && (
                                            <div className="ml-auto">
                                                <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
                                                    <DialogTrigger asChild>
                                                        <Button variant="default" className="bg-green-600 hover:bg-green-700 text-white">
                                                            <Trophy className="mr-2 h-4 w-4" />
                                                            Complete Mission
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle>Complete Mission & Report Impact</DialogTitle>
                                                            <DialogDescription>
                                                                Submit the final results to distribute XP to participants.
                                                            </DialogDescription>
                                                        </DialogHeader>
                                                        <div className="space-y-4 py-4">
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div className="space-y-2">
                                                                    <Label>Total Trash (kg)</Label>
                                                                    <Input
                                                                        type="number"
                                                                        step="0.1"
                                                                        value={impactData.total_trash_weight}
                                                                        onChange={(e) => setImpactData({ ...impactData, total_trash_weight: e.target.value })}
                                                                    />
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <Label>Trash Bags</Label>
                                                                    <Input
                                                                        type="number"
                                                                        value={impactData.trash_bags_count}
                                                                        onChange={(e) => setImpactData({ ...impactData, trash_bags_count: e.target.value })}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div className="space-y-2">
                                                                    <Label>Participants</Label>
                                                                    <Input
                                                                        type="number"
                                                                        value={impactData.participants_count}
                                                                        placeholder={participants.length.toString()}
                                                                        onChange={(e) => setImpactData({ ...impactData, participants_count: e.target.value })}
                                                                    />
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <Label>Duration (mins)</Label>
                                                                    <Input
                                                                        type="number"
                                                                        value={impactData.duration_minutes}
                                                                        onChange={(e) => setImpactData({ ...impactData, duration_minutes: e.target.value })}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label>Notes / Highlights</Label>
                                                                <Textarea
                                                                    value={impactData.notes}
                                                                    onChange={(e) => setImpactData({ ...impactData, notes: e.target.value })}
                                                                    placeholder="What did we achieve? Any weird finds?"
                                                                />
                                                            </div>
                                                        </div>
                                                        <DialogFooter>
                                                            <Button variant="outline" onClick={() => setShowCompleteDialog(false)}>Cancel</Button>
                                                            <Button onClick={handleCompleteMission} disabled={completing}>
                                                                {completing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                                Submit Impact Report
                                                            </Button>
                                                        </DialogFooter>
                                                    </DialogContent>
                                                </Dialog>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Impact Report (if completed) */}
                            {impact_report && (
                                <Card className="bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
                                            Impact Report 🌍
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                                        <div>
                                            <p className="text-2xl font-bold">{impact_report.total_trash_weight} kg</p>
                                            <p className="text-xs text-muted-foreground">Trash Removed</p>
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold">{impact_report.trash_bags_count}</p>
                                            <p className="text-xs text-muted-foreground">Bags Filled</p>
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold">{impact_report.participants_count}</p>
                                            <p className="text-xs text-muted-foreground">Participants</p>
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold">{Math.floor(impact_report.duration_minutes)}m</p>
                                            <p className="text-xs text-muted-foreground">Duration</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>

                        <TabsContent value="leaderboard">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Trophy className="h-5 w-5 text-amber-500" />
                                        Mission Leaderboard
                                    </CardTitle>
                                    <CardDescription>
                                        {mission.status === 'completed'
                                            ? "Top contributors based on XP earned."
                                            : "Participants checked in for this mission."}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {leaderboard.length === 0 ? (
                                            <p className="text-center text-muted-foreground py-8">No participants yet.</p>
                                        ) : (
                                            leaderboard.map((p, index) => (
                                                <div key={p.user_id} className="flex items-center justify-between p-3 rounded-lg border bg-card/50">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`
                                                            flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm
                                                            ${index === 0 ? "bg-yellow-100 text-yellow-700" :
                                                                index === 1 ? "bg-gray-100 text-gray-700" :
                                                                    index === 2 ? "bg-amber-100 text-amber-700" : "bg-muted text-muted-foreground"}
                                                        `}>
                                                            {index + 1}
                                                        </div>
                                                        <Avatar className="h-10 w-10">
                                                            <AvatarImage src={p.avatar_url || undefined} />
                                                            <AvatarFallback>{p.username?.[0] || "?"}</AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="font-medium">{p.username || "User"}</p>
                                                            {p.status === "checked_in" && (
                                                                <p className="text-xs text-green-600">Checked In</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {mission.status === 'completed' && p.xp_awarded > 0 && (
                                                        <Badge variant="secondary" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                                            +{p.xp_awarded} XP
                                                        </Badge>
                                                    )}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="chat">
                            {isJoined ? (
                                <div className="h-[500px] border rounded-lg overflow-hidden">
                                    <MissionChat missionId={Number(id)} />
                                </div>
                            ) : (
                                <Card>
                                    <CardContent className="py-8 text-center">
                                        <p className="text-muted-foreground">Join the mission to access the chat.</p>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Right Column: Actions */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Your Status</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {!isJoined ? (
                                <Button
                                    className="w-full"
                                    onClick={handleJoin}
                                    disabled={joining || isEnded || (mission.max_participants ? participants.length >= mission.max_participants : false)}
                                >
                                    {joining ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                    RSVP / Join Mission
                                </Button>
                            ) : (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-green-600 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                                        <CheckCircle className="h-5 w-5" />
                                        <span className="font-medium">You're attending!</span>
                                    </div>

                                    {isCheckedIn ? (
                                        <Button variant="outline" className="w-full cursor-default" disabled>
                                            Checked In ✅
                                        </Button>
                                    ) : (
                                        <Button
                                            className="w-full"
                                            onClick={handleCheckIn}
                                            disabled={checkingIn || !checkInOpen}
                                        >
                                            {checkingIn ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <MapPin className="h-4 w-4 mr-2" />}
                                            Check-in (GPS)
                                        </Button>
                                    )}

                                    {!isCheckedIn && !checkInOpen && !isEnded && (
                                        <p className="text-xs text-muted-foreground text-center">
                                            Check-in opens 30 mins before start.
                                        </p>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Invite Friends Share Card */}
                    <Card>
                        <CardContent className="p-4">
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={async () => {
                                    console.log("[analytics] mission_share_clicked");
                                    const text = `Join the "${mission.title}" cleanup mission on OceanGuardian! 🌊 ${participants.length} guardian${participants.length !== 1 ? "s" : ""} already signed up.`;
                                    if (navigator.share) {
                                        try {
                                            await navigator.share({ title: mission.title, text, url: window.location.href });
                                        } catch (err) { console.error("Share failed", err); }
                                    } else {
                                        await navigator.clipboard.writeText(`${text}\n${window.location.href}`);
                                        toast({ title: "Copied!", description: "Mission link copied to clipboard." });
                                    }
                                }}
                            >
                                <Share2 className="mr-2 h-4 w-4" />
                                Invite Friends
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
