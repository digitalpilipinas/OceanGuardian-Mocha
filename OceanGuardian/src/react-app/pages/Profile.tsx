import { Card, CardContent, CardHeader, CardTitle } from "@/react-app/components/ui/card";
import { Badge } from "@/react-app/components/ui/badge";
import { Progress } from "@/react-app/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/react-app/components/ui/tabs";
import { Button } from "@/react-app/components/ui/button";
import { Award, TrendingUp, Target, Flame, MapPin, Camera } from "lucide-react";
import { useAuth } from "@getmocha/users-service/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/react-app/components/ui/avatar";

export default function Profile() {
  const { user, redirectToLogin } = useAuth();

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

  // Mock user data - will be replaced with real data later
  const userData = {
    name: user.google_user_data.name || user.email,
    profilePicture: user.google_user_data.picture,
    level: 12,
    xp: 3450,
    xpToNextLevel: 4000,
    streak: 7,
    totalSightings: 42,
    badges: [
      { id: 1, name: "First Sighting", icon: "🌊", rarity: "common" },
      { id: 2, name: "Week Warrior", icon: "🔥", rarity: "rare" },
      { id: 3, name: "Coral Guardian", icon: "🪸", rarity: "epic" },
      { id: 4, name: "Wildlife Watcher", icon: "🐠", rarity: "common" },
      { id: 5, name: "Beach Cleaner", icon: "🧹", rarity: "rare" },
    ],
    recentActivity: [
      { id: 1, type: "Sighting", description: "Reported plastic bottles at Manila Bay", xp: 50, time: "2h ago" },
      { id: 2, type: "Badge", description: "Unlocked Week Warrior badge", xp: 100, time: "1d ago" },
      { id: 3, type: "Mission", description: "Completed beach cleanup mission", xp: 200, time: "2d ago" },
    ],
  };

  const xpProgress = (userData.xp / userData.xpToNextLevel) * 100;

  const rarityColors = {
    common: "bg-gray-500",
    rare: "bg-blue-500",
    epic: "bg-purple-500",
  };

  return (
    <div className="container mx-auto px-4 py-8 pb-20 md:pb-8">
      {/* Profile Header */}
      <Card className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white border-0">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <Avatar className="w-24 h-24 border-4 border-white/20">
              <AvatarImage src={userData.profilePicture || undefined} alt={userData.name} />
              <AvatarFallback className="text-4xl font-bold bg-white/20 text-white">
                {userData.name[0]}
              </AvatarFallback>
            </Avatar>
            <div className="text-center md:text-left flex-1">
              <h1 className="text-3xl font-bold mb-2">{userData.name}</h1>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  Level {userData.level}
                </Badge>
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  <Flame className="mr-1 h-3 w-3" />
                  {userData.streak} day streak
                </Badge>
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  <MapPin className="mr-1 h-3 w-3" />
                  {userData.totalSightings} sightings
                </Badge>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Level Progress</span>
                  <span>
                    {userData.xp} / {userData.xpToNextLevel} XP
                  </span>
                </div>
                <Progress value={xpProgress} className="h-2 bg-white/20" />
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
                <div className="text-2xl font-bold">{userData.xp}</div>
                <p className="text-xs text-muted-foreground">+250 this week</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sightings</CardTitle>
                <Camera className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userData.totalSightings}</div>
                <p className="text-xs text-muted-foreground">+3 this week</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Missions</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">8 completed</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Badges</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userData.badges.length}</div>
                <p className="text-xs text-muted-foreground">2 epic, 2 rare</p>
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
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {userData.badges.map((badge) => (
                  <div
                    key={badge.id}
                    className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent transition-colors"
                  >
                    <div className="text-4xl">{badge.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{badge.name}</h3>
                      <Badge
                        variant="secondary"
                        className={`mt-1 ${
                          rarityColors[badge.rarity as keyof typeof rarityColors]
                        } text-white`}
                      >
                        {badge.rarity}
                      </Badge>
                    </div>
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
              <div className="space-y-4">
                {userData.recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{activity.type}</Badge>
                        <span className="text-xs text-muted-foreground">{activity.time}</span>
                      </div>
                      <p className="mt-1 text-sm">{activity.description}</p>
                    </div>
                    <Badge variant="secondary" className="ml-4">
                      +{activity.xp} XP
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
