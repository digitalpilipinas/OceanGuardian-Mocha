import { Waves, Map, Award, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/react-app/components/ui/card";
import { Button } from "@/react-app/components/ui/button";
import ActivityFeed from "@/react-app/components/ActivityFeed";
import { useUserProfile } from "@/react-app/hooks/useUserProfile";
import WelcomeHeader from "@/react-app/components/dashboard/WelcomeHeader";
import DashboardStats from "@/react-app/components/dashboard/DashboardStats";
import MapPreview from "@/react-app/components/dashboard/MapPreview";
import MissionsCarousel from "@/react-app/components/dashboard/MissionsCarousel";
import DailyQuizCTA from "@/react-app/components/dashboard/DailyQuizCTA";

export default function Home() {
  const { profile: user } = useUserProfile();

  if (user) {
    return (
      <div className="container mx-auto px-4 py-8 pb-20 md:pb-8">
        <WelcomeHeader />

        <DashboardStats />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">

            {/* Live Map Preview */}
            <div className="h-[400px]">
              <MapPreview />
            </div>

            {/* Active Missions */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  Active Missions
                </h2>
              </div>
              <MissionsCarousel />
            </div>

          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <DailyQuizCTA />

            <div className="h-[500px]">
              <ActivityFeed />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Guest View (Landing Page)
  return (
    <div className="container mx-auto px-4 py-8 pb-20 md:pb-8">
      {/* Hero Section */}
      <section className="text-center py-12 md:py-20 relative overflow-hidden">
        <motion.div
          animate={{
            rotate: [0, 5, -5, 0],
            scale: [1, 1.05, 0.95, 1]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute -top-20 -left-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none"
        />
        <motion.div
          animate={{
            rotate: [0, -5, 5, 0],
            scale: [1, 0.95, 1.05, 1]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-20 -right-20 w-64 h-64 bg-secondary/10 rounded-full blur-3xl pointer-events-none"
        />

        <div className="inline-flex items-center justify-center p-4 neo-flat rounded-3xl mb-8">
          <Waves className="h-14 w-14 text-primary animate-liquid" />
        </div>
        <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
          Welcome to OceanGuardian
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          The Pokémon GO of Ocean Conservation
        </p>
        <p className="text-lg text-muted-foreground mb-8 max-w-3xl mx-auto">
          Transform beach walks into heroic conservation quests. Log debris, track coral health,
          earn badges, and help protect our oceans—one sighting at a time.
        </p>
        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <Button size="lg" variant="neomorph-primary" className="text-lg px-10 h-14" asChild>
            <a href="/map">
              <Map className="mr-2 h-5 w-5" />
              Explore Map
            </a>
          </Button>
          <Button size="lg" variant="neomorph" className="text-lg px-10 h-14">
            Get Started
          </Button>
        </div>
      </section>

      {/* Quick Stats & Activity Feed */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card variant="neomorph">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Total Sightings</CardTitle>
                <div className="p-2 neo-pressed rounded-lg">
                  <Map className="h-4 w-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">2,847</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <TrendingUp className="inline h-3 w-3 text-secondary mr-1" />
                  +12% from last week
                </p>
              </CardContent>
            </Card>

            <Card variant="neomorph">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Active Missions</CardTitle>
                <div className="p-2 neo-pressed rounded-lg">
                  <Award className="h-4 w-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">12</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Join cleanup missions near you
                </p>
              </CardContent>
            </Card>

            <Card variant="neomorph">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Ocean Guardians</CardTitle>
                <div className="p-2 neo-pressed rounded-lg">
                  <Waves className="h-4 w-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">1,243</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Community members making an impact
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Missions Preview or other content could go here */}
        </div>

        <div className="lg:col-span-1 h-[500px]">
          <ActivityFeed />
        </div>
      </section>

      {/* Features */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-8 text-center">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-2 hover:border-primary transition-colors">
            <CardHeader>
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Map className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Discover</CardTitle>
              <CardDescription>
                Browse the interactive map to find sightings and cleanup missions near you
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-primary transition-colors">
            <CardHeader>
              <div className="h-12 w-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                <Waves className="h-6 w-6 text-secondary" />
              </div>
              <CardTitle>Report</CardTitle>
              <CardDescription>
                Log debris, wildlife, and coral health with GPS-tagged photos
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-primary transition-colors">
            <CardHeader>
              <div className="h-12 w-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                <Award className="h-6 w-6 text-accent" />
              </div>
              <CardTitle>Level Up</CardTitle>
              <CardDescription>
                Earn XP, unlock badges, and climb the leaderboard as you contribute
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-primary transition-colors">
            <CardHeader>
              <div className="h-12 w-12 bg-chart-3/10 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-chart-3" />
              </div>
              <CardTitle>Impact</CardTitle>
              <CardDescription>
                Track your conservation impact and share your achievements
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Call to Action */}
      <section className="text-center py-16 glass-liquid border-none rounded-3xl relative overflow-hidden">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-32 -left-32 w-64 h-64 bg-primary/20 rounded-full blur-3xl pointer-events-none"
        />
        <h2 className="text-4xl font-bold mb-4 relative z-10">Ready to Make a Difference?</h2>
        <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto relative z-10">
          Join thousands of ocean guardians protecting marine life and cleaning our beaches
        </p>
        <Button size="lg" variant="neomorph-primary" className="text-xl px-12 h-16 relative z-10" asChild>
          <a href="/login">Get Started</a>
        </Button>
      </section>
    </div>
  );
}
