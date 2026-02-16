import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { useUserProfile } from "@/react-app/hooks/useUserProfile";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/react-app/components/ui/card";
import { Button } from "@/react-app/components/ui/button";
import { Badge } from "@/react-app/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/react-app/components/ui/tabs";
import { Loader2, Plus, Calendar, MapPin, Users, ArrowRight } from "lucide-react";
import type { Mission, UserProfile } from "@/shared/types";

export default function Missions() {
  const { profile: user } = useUserProfile();
  const navigate = useNavigate();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("upcoming");
  const [canCreate, setCanCreate] = useState(false);

  useEffect(() => {
    // Check if user can create missions
    if (user) {
      fetch("/api/profiles/me")
        .then((res) => (res.ok ? res.json() : null))
        .then((profile: UserProfile) => {
          if (profile && ["admin", "ambassador"].includes(profile.role)) {
            setCanCreate(true);
          }
        })
        .catch(() => { });
    }
  }, [user]);

  useEffect(() => {
    const fetchMissions = async () => {
      setLoading(true);
      try {
        const query = filter === "all" ? "" : `?status=${filter}`;
        const res = await fetch(`/api/missions${query}`);
        if (res.ok) {
          setMissions(await res.json());
        }
      } catch (err) {
        console.error("Failed to fetch missions", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMissions();
  }, [filter]);

  return (
    <div className="container mx-auto px-4 py-8 pb-20 md:pb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Cleanup Missions
          </h1>
          <p className="text-muted-foreground text-lg">Join the community to clean up our oceans!</p>
        </div>

        {canCreate && (
          <Button variant="neomorph-primary" size="lg" className="h-12 px-6" onClick={() => navigate("/missions/create")}>
            <Plus className="mr-2 h-5 w-5" />
            Create Mission
          </Button>
        )}
      </div>

      <div className="mb-10">
        <Tabs defaultValue="upcoming" onValueChange={setFilter} className="w-full">
          <TabsList className="bg-transparent p-1 neo-pressed rounded-2xl h-14">
            <TabsTrigger value="upcoming" className="rounded-xl h-12 text-slate-400 data-[state=active]:neo-flat data-[state=active]:bg-card data-[state=active]:text-primary px-8 transition-colors">Upcoming</TabsTrigger>
            <TabsTrigger value="active" className="rounded-xl h-12 text-slate-400 data-[state=active]:neo-flat data-[state=active]:bg-card data-[state=active]:text-primary px-8 transition-colors">Active Now</TabsTrigger>
            <TabsTrigger value="completed" className="rounded-xl h-12 text-slate-400 data-[state=active]:neo-flat data-[state=active]:bg-card data-[state=active]:text-primary px-8 transition-colors">Completed</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {
        loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : missions.length === 0 ? (
          <div className="text-center py-20 neo-flat rounded-3xl bg-card/50">
            <p className="text-2xl font-bold text-muted-foreground">No missions found</p>
            <p className="text-muted-foreground mt-2">Be the first to organize one!</p>
            {canCreate && (
              <Button variant="neomorph" className="mt-8 px-10 h-14" onClick={() => navigate("/missions/create")}>
                Create Mission
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {missions.map((mission) => (
              <Card key={mission.id} variant="neomorph" className="flex flex-col h-full group/mission">
                {mission.image_url && (
                  <div className="relative h-56 w-full overflow-hidden">
                    <img src={mission.image_url} alt={mission.title} className="w-full h-full object-cover transition-transform duration-500 group-hover/mission:scale-110" />
                    <div className="absolute top-4 right-4">
                      <Badge className="capitalize px-4 py-1.5 rounded-full glass-liquid border-none text-white font-bold shadow-xl">
                        {mission.status}
                      </Badge>
                    </div>
                  </div>
                )}
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl font-bold line-clamp-1">{mission.title}</CardTitle>
                  <CardDescription className="flex items-center gap-1.5 font-medium text-primary">
                    <MapPin className="h-3.5 w-3.5" /> {mission.location_name}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-6 bg-muted/20 p-3 rounded-xl border border-border/10">
                    {mission.description}
                  </p>

                  <div className="flex flex-wrap gap-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 neo-pressed rounded-full">
                      <Calendar className="h-3.5 w-3.5 text-primary" />
                      {new Date(mission.start_time).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 neo-pressed rounded-full">
                      <Users className="h-3.5 w-3.5 text-primary" />
                      {mission.max_participants ? `Max ${mission.max_participants}` : "Open"}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-4">
                  <Button variant="neomorph" className="w-full h-12 text-sm font-bold uppercase tracking-widest group-hover/mission:bg-primary group-hover/mission:text-primary-foreground transition-all duration-300" asChild>
                    <Link to={`/missions/${mission.id}`}>
                      View Details <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )
      }
    </div>
  );
}
