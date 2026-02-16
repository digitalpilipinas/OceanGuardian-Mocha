import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/react-app/components/ui/card";
import { Badge } from "@/react-app/components/ui/badge";
import { Progress } from "@/react-app/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/react-app/components/ui/tabs";
import { Button } from "@/react-app/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/react-app/components/ui/tooltip";
import { Award, TrendingUp, Target, Flame, MapPin, Camera, Loader2, Lock, Star, Shield, Sparkles } from "lucide-react";
import { useAuth } from "@getmocha/users-service/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/react-app/components/ui/avatar";
import { xpProgressInLevel } from "@/shared/types";
import type { UserProfile, UserBadge, ActivityLog, Badge as BadgeType } from "@/shared/types";
import StreakCalendar from "@/react-app/components/StreakCalendar";
import StreakCard from "@/react-app/components/StreakCard";
import DailyCheckIn from "@/react-app/components/DailyCheckIn";
import { useGamification } from "@/react-app/components/GamificationProvider";

interface LevelPerk {
  level: number;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

export default function Profile() {
  const { user, redirectToLogin } = useAuth();
  const { triggerBadgeUnlock, triggerLevelUp } = useGamification();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [allBadges, setAllBadges] = useState<BadgeType[]>([]);
  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [levelPerks, setLevelPerks] = useState<LevelPerk[]>([]);

  // Streak State
  const [streakData, setStreakData] = useState<any>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      try {
        const [profileRes, badgesRes, activityRes, allBadgesRes, perksRes, streakRes] = await Promise.all([
          fetch("/api/profiles/me"),
          fetch("/api/profiles/me/badges"),
          fetch("/api/profiles/me/activity"),
          fetch("/api/badges"),
          fetch("/api/profiles/me/level-perks"),
          fetch("/api/streak"),
        ]);

        if (profileRes.ok) setProfile(await profileRes.json());
        if (badgesRes.ok) setBadges(await badgesRes.json());
        if (activityRes.ok) setActivity(await activityRes.json());
        if (allBadgesRes.ok) setAllBadges(await allBadgesRes.json());
        if (perksRes.ok) {
          const perksData = await perksRes.json();
          setLevelPerks(perksData.perks || []);
        }
        if (streakRes.ok) {
          setStreakData(await streakRes.json());
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

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

  const earnedBadgeIds = new Set(badges.map((b) => b.badge_id));

  const handleCheckIn = async () => {
    try {
      const res = await fetch("/api/streak/check-in", { method: "POST" });
      const data = await res.json();

      if (res.ok && data.success) {
        // Update local state
        setStreakData((prev: any) => ({
          ...prev,
          streakDays: data.streakDays,
          streakFreezes: data.streakFreezes,
          status: "checked_in",
          history: [
            { activity_date: new Date().toISOString().split("T")[0], type: "check_in" },
            ...(prev?.history || [])
          ]
        }));

        // Force refresh profile/badges if needed, or just partial update
        // We can just add the badges to local state if returned
        if (data.newBadges && data.newBadges.length > 0) {
          // Trigger modals
          data.newBadges.forEach((b: any) => triggerBadgeUnlock(b));
          // Append to badges list
          // Re-fetching might be easier to keep consistency but let's try to append
          // Assuming data.newBadges are Badge definitions. We need UserBadge format. 
          // Actually the backend returns Badge definitions. 
          // We can refresh badges.
          const badgesRes = await fetch("/api/profiles/me/badges");
          if (badgesRes.ok) setBadges(await badgesRes.json());
        }

        // Check for level up? The backend awarded XP.
        // We should re-fetch profile to get new XP/Level
        const profileRes = await fetch("/api/profiles/me");
        if (profileRes.ok) {
          const newProfile = await profileRes.json();
          if (newProfile.level > (profile?.level || 1)) {
            triggerLevelUp((profile?.level || 1), newProfile.level);
          }
          setProfile(newProfile);
        }
      }
    } catch (e) {
      console.error("Check-in failed", e);
    }
  };

  const rarityColors: Record<string, string> = {
    common: "bg-gray-500",
    uncommon: "bg-green-500",
    rare: "bg-blue-500",
    epic: "bg-purple-500",
    legendary: "bg-amber-500",
  };

  const rarityBorders: Record<string, string> = {
    common: "border-gray-300 dark:border-gray-600",
    uncommon: "border-green-300 dark:border-green-600",
    rare: "border-blue-300 dark:border-blue-600",
    epic: "border-purple-300 dark:border-purple-600",
    legendary: "border-amber-300 dark:border-amber-600",
  };

  const rarityGlows: Record<string, string> = {
    common: "",
    uncommon: "shadow-green-200/50 dark:shadow-green-800/30",
    rare: "shadow-blue-200/50 dark:shadow-blue-800/30",
    epic: "shadow-purple-200/50 dark:shadow-purple-800/30",
    legendary: "shadow-amber-200/50 dark:shadow-amber-800/30",
  };

  // Group badges by rarity for achievement tiers
  const tierOrder = ["common", "uncommon", "rare", "epic", "legendary"];
  const tierLabels: Record<string, string> = {
    common: "🥉 Common",
    uncommon: "🥈 Uncommon",
    rare: "💎 Rare",
    epic: "👑 Epic",
    legendary: "⭐ Legendary",
  };

  const badgesByTier = tierOrder.map((rarity) => {
    const tierBadges = allBadges.filter((b) => b.rarity === rarity);
    const earned = tierBadges.filter((b) => earnedBadgeIds.has(b.id));
    return { rarity, label: tierLabels[rarity], total: tierBadges.length, earned: earned.length };
  }).filter((t) => t.total > 0);

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

  const activityIcons: Record<string, string> = {
    sighting: "📍",
    badge: "🏅",
    level_up: "⬆️",
    mission: "🎯",
    streak: "🔥",
  };

  return (
    <div className="container mx-auto px-4 py-8 pb-20 md:pb-8">
      {/* Profile Header */}
      <Card className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white border-0 overflow-hidden relative">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-12 translate-x-12" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-8 -translate-x-8" />
        <CardContent className="p-8 relative">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <Avatar className="w-24 h-24 border-4 border-white/20 shadow-lg">
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
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="stats">Stats</TabsTrigger>
          <TabsTrigger value="streak">Streak</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
          <TabsTrigger value="perks">Perks</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        {/* Streak Tab */}
        <TabsContent value="streak" className="space-y-6">
          <DailyCheckIn
            checkedIn={streakData?.status === "checked_in"}
            onCheckIn={handleCheckIn}
            streakDays={streakData?.streakDays || 0}
          />

          <StreakCard
            streakDays={streakData?.streakDays || 0}
            streakFreezes={streakData?.streakFreezes || 0}
          />

          <StreakCalendar history={streakData?.history || []} />
        </TabsContent>

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
                <div className="text-2xl font-bold">{badges.length} / {allBadges.length}</div>
                <p className="text-xs text-muted-foreground">Achievements earned</p>
              </CardContent>
            </Card>
          </div>

          {/* Achievement Tiers */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500" />
                Achievement Tiers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {badgesByTier.map((tier) => (
                  <div key={tier.rarity} className="flex items-center gap-3">
                    <span className="text-sm font-medium w-28">{tier.label}</span>
                    <div className="flex-1">
                      <Progress
                        value={tier.total > 0 ? (tier.earned / tier.total) * 100 : 0}
                        className="h-2"
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-12 text-right">
                      {tier.earned}/{tier.total}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Badges Tab — All Badges Grid */}
        <TabsContent value="badges">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>All Badges</span>
                <Badge variant="secondary">{badges.length} / {allBadges.length} Earned</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {allBadges.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No badges available yet. 🌊
                </p>
              ) : (
                <TooltipProvider>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {allBadges.map((badge) => {
                      const isEarned = earnedBadgeIds.has(badge.id);
                      const earnedBadge = badges.find((b) => b.badge_id === badge.id);
                      const rarity = badge.rarity as string;

                      return (
                        <Tooltip key={badge.id}>
                          <TooltipTrigger asChild>
                            <div
                              className={`
                                relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 cursor-default
                                ${isEarned
                                  ? `${rarityBorders[rarity]} bg-card shadow-md ${rarityGlows[rarity]}`
                                  : "border-dashed border-muted-foreground/20 bg-muted/30 opacity-50"
                                }
                              `}
                            >
                              <div className={`text-3xl ${isEarned ? "" : "grayscale"}`}>
                                {badge.is_hidden && !isEarned ? "❓" : badge.icon}
                              </div>
                              <p className="text-xs font-medium text-center leading-tight">
                                {badge.is_hidden && !isEarned ? "Hidden" : badge.name}
                              </p>
                              <Badge
                                className={`text-[10px] px-1.5 py-0 ${isEarned ? rarityColors[rarity] + " text-white" : "bg-muted text-muted-foreground"}`}
                              >
                                {rarity}
                              </Badge>
                              {!isEarned && (
                                <div className="absolute top-1.5 right-1.5">
                                  <Lock className="h-3 w-3 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-[200px]">
                            <p className="font-semibold">{badge.is_hidden && !isEarned ? "Hidden Badge" : badge.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {badge.is_hidden && !isEarned ? "Complete the secret requirement to unlock!" : badge.description}
                            </p>
                            {isEarned && earnedBadge && (
                              <p className="text-xs text-green-500 mt-1">
                                ✅ Earned {formatTimestamp(earnedBadge.earned_at)}
                              </p>
                            )}
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </div>
                </TooltipProvider>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Perks Tab */}
        <TabsContent value="perks">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-amber-500" />
                Level Perks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {levelPerks.map((perk) => (
                  <div
                    key={perk.level}
                    className={`
                      flex items-center gap-4 p-4 rounded-xl border transition-all duration-200
                      ${perk.unlocked
                        ? "bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-500/10 dark:to-orange-500/10 border-amber-200 dark:border-amber-500/20"
                        : "bg-muted/30 border-muted opacity-60"
                      }
                    `}
                  >
                    <span className="text-2xl">{perk.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm">{perk.title}</p>
                        <Badge variant="outline" className="text-[10px]">
                          Level {perk.level}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{perk.description}</p>
                    </div>
                    {perk.unlocked ? (
                      <Shield className="h-5 w-5 text-amber-500" />
                    ) : (
                      <Lock className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                ))}
              </div>
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
                <div className="space-y-3">
                  {activity.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <span className="text-xl">{activityIcons[item.type] || "📌"}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="capitalize text-[10px]">
                              {item.type.replace("_", " ")}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatTimestamp(item.created_at)}
                            </span>
                          </div>
                          <p className="mt-1 text-sm">{item.description}</p>
                        </div>
                      </div>
                      {item.xp_earned > 0 && (
                        <Badge variant="secondary" className="ml-4 shrink-0">
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
