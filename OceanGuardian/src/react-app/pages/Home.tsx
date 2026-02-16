import { Waves, Map, Award, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/react-app/components/ui/card";
import { Button } from "@/react-app/components/ui/button";
import ActivityFeed from "@/react-app/components/ActivityFeed";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8 pb-20 md:pb-8">
      {/* Hero Section */}
      <section className="text-center py-12 md:py-20">
        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-6">
          <Waves className="h-12 w-12 text-primary" />
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
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="text-lg px-8" asChild>
            <a href="/map">
              <Map className="mr-2 h-5 w-5" />
              Explore Map
            </a>
          </Button>
          <Button size="lg" variant="outline" className="text-lg px-8">
            Get Started
          </Button>
        </div>
      </section>

      {/* Quick Stats & Activity Feed */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sightings</CardTitle>
                <Map className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2,847</div>
                <p className="text-xs text-muted-foreground">
                  <TrendingUp className="inline h-3 w-3 text-secondary mr-1" />
                  +12% from last week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Missions</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">
                  Join cleanup missions near you
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ocean Guardians</CardTitle>
                <Waves className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,243</div>
                <p className="text-xs text-muted-foreground">
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
      <section className="text-center py-12 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 rounded-2xl">
        <h2 className="text-3xl font-bold mb-4">Ready to Make a Difference?</h2>
        <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
          Join thousands of ocean guardians protecting marine life and cleaning our beaches
        </p>
        <Button size="lg" className="text-lg px-8">
          Sign Up with Google
        </Button>
      </section>
    </div>
  );
}
