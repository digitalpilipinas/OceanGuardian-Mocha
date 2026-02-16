import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { useAuth } from "@getmocha/users-service/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/react-app/components/ui/card";
import { Button } from "@/react-app/components/ui/button";
import { Badge } from "@/react-app/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/react-app/components/ui/tabs";
import { Loader2, Plus, Calendar, MapPin, Users, ArrowRight } from "lucide-react";
import type { Mission, UserProfile } from "@/shared/types";

export default function Missions() {
  const { user } = useAuth();
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Cleanup Missions</h1>
          <p className="text-muted-foreground">Join the community to clean up our oceans!</p>
        </div>

        {canCreate && (
          <Button onClick={() => navigate("/missions/create")}>
            <Plus className="mr-2 h-4 w-4" />
            Create Mission
          </Button>
        )}
      </div>

      <div className="mb-6">
        <Tabs defaultValue="upcoming" onValueChange={setFilter}>
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="active">Active Now</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            {/* <TabsTrigger value="all">All</TabsTrigger> */}
          </TabsList>
        </Tabs>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : missions.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg bg-muted/30">
          <p className="text-lg font-medium">No missions found</p>
          <p className="text-muted-foreground">Be the first to organize one!</p>
          {canCreate && (
            <Button variant="outline" className="mt-4" onClick={() => navigate("/missions/create")}>
              Create Mission
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {missions.map((mission) => (
            <Card key={mission.id} className="flex flex-col h-full overflow-hidden hover:shadow-lg transition-shadow">
              {mission.image_url && (
                <div className="relative h-48 w-full">
                  <img src={mission.image_url} alt={mission.title} className="w-full h-full object-cover" />
                  <div className="absolute top-2 right-2">
                    <Badge variant={mission.status === "active" ? "default" : "secondary"} className="capitalize">
                      {mission.status}
                    </Badge>
                  </div>
                </div>
              )}
              <CardHeader>
                <CardTitle className="line-clamp-1">{mission.title}</CardTitle>
                <CardDescription className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {mission.location_name}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                  {mission.description}
                </p>

                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(mission.start_time).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {mission.max_participants ? `Max ${mission.max_participants}` : "Open"}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button className="w-full" asChild>
                  <Link to={`/missions/${mission.id}`}>
                    View Details <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
