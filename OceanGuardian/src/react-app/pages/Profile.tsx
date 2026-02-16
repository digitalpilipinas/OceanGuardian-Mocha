import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/react-app/components/ui/card";
import { Badge } from "@/react-app/components/ui/badge";
import { Progress } from "@/react-app/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/react-app/components/ui/tabs";
import { Button } from "@/react-app/components/ui/button";
import { Award, TrendingUp, Target, Flame, MapPin, Camera, Loader2 } from "lucide-react";
import { useAuth } from "@getmocha/users-service/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/react-app/components/ui/avatar";
import { xpProgressInLevel } from "@/shared/types";
import type { UserProfile, UserBadge, ActivityLog } from "@/shared/types";

export default function Profile() {
  const { user, redirectToLogin } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      try {
        const [profileRes, badgesRes, activityRes] = await Promise.all([
          fetch("/api/profiles/me"),
          fetch("/api/profiles/me/badges"),
          fetch("/api/profiles/me/activity"),
        ]);

        if (profileRes.ok) {
          setProfile(await profileRes.json());
        }
        if (badgesRes.ok) {
          setBadges(await badgesRes.json());
        }
        if (activityRes.ok) {
          setActivity(await activityRes.json());
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  // If not logged in, show login prompt
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Sign in to view your profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-muted-foreground">
              Track your sightings, earn badges, and contribute to ocean conservation
            </p>
            <Button onClick={() => redirectToLogin()} className="w-full" size="lg">
              Sign in with Google
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const displayName = profile?.username || user.google_user_data.name || user.email;
  const avatarUrl = profile?.avatar_url || user.google_user_data.picture;
  const level = profile?.level || 1;
  const xp = profile?.xp || 0;
  const { current: xpInLevel, required: xpRequired } = xpProgressInLevel(xp, level);
  const xpProgress = (xpInLevel / xpRequired) * 100;

  const rarityColors: Record<string, string> = {
    common: "bg-gray-500",
    uncommon: "bg-green-500",
    rare: "bg-blue-500",
    epic: "bg-purple-500",
    legendary: "bg-amber-500",
  };

  const formatTimestamp = (ts: string) => {
    const date = new Date(ts);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 30) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="container mx-auto px-4 py-8 pb-20 md:pb-8">
      {/* Profile Header */}
      <Card className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white border-0">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <Avatar className="w-24 h-24 border-4 border-white/20">
              <AvatarImage src={avatarUrl || undefined} alt={displayName} />
              <AvatarFallback className="text-4xl font-bold bg-white/20 text-white">
                {displayName[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="text-center md:text-left flex-1">
              <h1 className="text-3xl font-bold mb-2">{displayName}</h1>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  Level {level}
                </Badge>
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  <Flame className="mr-1 h-3 w-3" />
                  {profile?.streak_days || 0} day streak
                </Badge>
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  <MapPin className="mr-1 h-3 w-3" />
                  {profile?.total_sightings || 0} sightings
                </Badge>
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30 capitalize">
                  {profile?.role || "player"}
                </Badge>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Level Progress</span>
                  <span>
                    {xpInLevel} / {xpRequired} XP
                  </span>
                </div>
                <Progress value={xpProgress} className="h-2 bg-white/20" />
                <p className="text-xs mt-1 opacity-80">Total: {xp} XP</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats and Content Tabs */}
      <Tabs defaultValue="stats" className="mt-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="stats">Stats</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        {/* Stats Tab */}
        <TabsContent value="stats" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total XP</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{xp.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Level {level}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sightings</CardTitle>
                <Camera className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{profile?.total_sightings || 0}</div>
                <p className="text-xs text-muted-foreground">Marine observations</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Missions</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{profile?.total_missions || 0}</div>
                <p className="text-xs text-muted-foreground">Cleanups joined</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Badges</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{badges.length}</div>
                <p className="text-xs text-muted-foreground">Achievements earned</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Badges Tab */}
        <TabsContent value="badges">
          <Card>
            <CardHeader>
              <CardTitle>Badges Earned</CardTitle>
            </CardHeader>
            <CardContent>
              {badges.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No badges earned yet. Start reporting sightings to unlock your first badge! 🌊
                </p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {badges.map((badge) => (
                    <div
                      key={badge.id}
                      className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent transition-colors"
                    >
                      <div className="text-4xl">{badge.icon}</div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{badge.name}</h3>
                        <p className="text-xs text-muted-foreground">{badge.description}</p>
                        <Badge
                          variant="secondary"
                          className={`mt-1 ${rarityColors[badge.rarity || "common"]} text-white`}
                        >
                          {badge.rarity}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {activity.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No activity yet. Submit your first sighting to get started! 🚀
                </p>
              ) : (
                <div className="space-y-4">
                  {activity.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 rounded-lg border bg-card"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="capitalize">
                            {item.type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatTimestamp(item.created_at)}
                          </span>
                        </div>
                        <p className="mt-1 text-sm">{item.description}</p>
                      </div>
                      {item.xp_earned > 0 && (
                        <Badge variant="secondary" className="ml-4">
                          +{item.xp_earned} XP
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
