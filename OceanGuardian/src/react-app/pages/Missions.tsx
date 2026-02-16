import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { useUserProfile } from "@/react-app/hooks/useUserProfile";
import { CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/react-app/components/ui/card";
import { Button } from "@/react-app/components/ui/button";
import { Badge } from "@/react-app/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/react-app/components/ui/tabs";
import { Loader2, Plus, Calendar, MapPin, Users } from "lucide-react";
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
    <div className="container mx-auto py-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter">
            Cleanup <span className="text-primary brightness-125">Missions</span>
          </h1>
          <p className="text-white/60 text-lg font-bold mt-2 tracking-wide italic">Join the collective effort to restore our oceans.</p>
        </div>

        {canCreate && (
          <Button variant="neomorph-primary" size="lg" className="h-16 px-10 text-xl font-black shadow-2xl shadow-primary/20" onClick={() => navigate("/missions/create")}>
            <Plus className="mr-3 h-7 w-7" />
            Create Mission
          </Button>
        )}
      </div>

      <div className="mb-14">
        <Tabs defaultValue="upcoming" onValueChange={setFilter} className="w-full">
          <TabsList className="bg-black/20 p-2 rounded-[2rem] h-18 w-full md:w-auto border border-white/5">
            <TabsTrigger value="upcoming" className="rounded-[1.5rem] h-14 text-white/40 font-black uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-primary/30 px-12 transition-all">Upcoming</TabsTrigger>
            <TabsTrigger value="active" className="rounded-[1.5rem] h-14 text-white/40 font-black uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-primary/30 px-12 transition-all">Active Now</TabsTrigger>
            <TabsTrigger value="completed" className="rounded-[1.5rem] h-14 text-white/40 font-black uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-primary/30 px-12 transition-all">Completed</TabsTrigger>
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
              <div key={mission.id} className="flex flex-col h-full group/mission border border-white/10 bg-secondary/40 rounded-[2.5rem] overflow-hidden shadow-2xl transition-all hover:scale-[1.02]">
                {mission.image_url && (
                  <div className="relative h-60 w-full overflow-hidden">
                    <img src={mission.image_url} alt={mission.title} className="w-full h-full object-cover transition-transform duration-700 group-hover/mission:scale-110" />
                    <div className="absolute top-5 right-5">
                      <Badge className="capitalize px-5 py-2 rounded-full border border-white/10 bg-black/60 text-white font-black tracking-widest text-[10px] shadow-2xl">
                        {mission.status}
                      </Badge>
                    </div>
                  </div>
                )}
                <CardHeader className="pb-4 pt-8">
                  <CardTitle className="text-2xl font-black text-white tracking-tight line-clamp-1 group-hover/mission:text-primary transition-colors">{mission.title}</CardTitle>
                  <CardDescription className="flex items-center gap-2 font-black text-[10px] uppercase tracking-widest text-primary">
                    <MapPin className="h-3.5 w-3.5" /> {mission.location_name}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 px-8">
                  <p className="text-sm text-white/50 leading-relaxed font-medium line-clamp-3 mb-8 bg-black/20 p-5 rounded-3xl border border-white/5 italic">
                    {mission.description}
                  </p>

                  <div className="flex flex-wrap gap-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5">
                      <Calendar className="h-3.5 w-3.5 text-primary" />
                      {new Date(mission.start_time).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5">
                      <Users className="h-3.5 w-3.5 text-primary" />
                      {mission.max_participants ? `Max ${mission.max_participants}` : "Open"}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-6 pb-10 px-8">
                  <Button className="w-full h-14 text-xs font-black uppercase tracking-[0.3em] bg-white/5 text-white/60 hover:bg-primary hover:text-white hover:shadow-xl hover:shadow-primary/30 transition-all duration-500 rounded-3xl border border-white/10" asChild>
                    <Link to={`/missions/${mission.id}`}>
                      Deploy <Plus className="ml-3 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </div>
            ))}
          </div>
        )
      }
    </div>
  );
}
