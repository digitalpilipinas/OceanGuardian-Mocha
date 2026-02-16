import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/react-app/components/ui/card";
import { Button } from "@/react-app/components/ui/button";
import { Badge } from "@/react-app/components/ui/badge";
import { ArrowRight, MapPin, Calendar } from "lucide-react";

interface Mission {
    id: number;
    title: string;
    description: string;
    location_name: string;
    start_time: string;
    image_url: string | null;
    status: string;
}

export default function MissionsCarousel() {
    const [missions, setMissions] = useState<Mission[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/missions?status=active&limit=5")
            .then(res => res.ok ? res.json() : [])
            .then(data => {
                // If no active, try upcoming
                if (data.length === 0) {
                    return fetch("/api/missions?status=upcoming&limit=5")
                        .then(res => res.ok ? res.json() : []);
                }
                return data;
            })
            .then(setMissions)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="h-64 bg-muted animate-pulse rounded-xl" />;

    if (missions.length === 0) {
        return (
            <Card className="bg-muted/50 border-dashed">
                <CardContent className="flex flex-col items-center justify-center h-48 text-center p-6">
                    <p className="text-muted-foreground mb-4">No active missions right now.</p>
                    <Button variant="outline" asChild>
                        <Link to="/missions/create">Create a Mission</Link>
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="relative">
            <div className="flex overflow-x-auto pb-4 gap-4 snap-x snap-mandatory scrollbar-hide">
                {missions.map((mission) => (
                    <Card key={mission.id} className="min-w-[300px] max-w-[300px] flex-shrink-0 snap-center flex flex-col h-full hover:shadow-lg hover:shadow-blue-500/10 transition-all bg-slate-900/40 border-white/10 backdrop-blur-sm group">
                        {mission.image_url ? (
                            <div className="h-40 w-full overflow-hidden rounded-t-xl relative">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                                <img src={mission.image_url} alt={mission.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                <Badge variant={mission.status === 'active' ? 'default' : 'secondary'} className="absolute top-3 right-3 z-20 shadow-sm border-none">
                                    {mission.status}
                                </Badge>
                            </div>
                        ) : (
                            <div className="h-40 w-full bg-slate-800/50 flex items-center justify-center rounded-t-xl relative">
                                <MapPin className="h-10 w-10 text-slate-600" />
                                <Badge variant={mission.status === 'active' ? 'default' : 'secondary'} className="absolute top-3 right-3 z-10 border-none">
                                    {mission.status}
                                </Badge>
                            </div>
                        )}
                        <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-base line-clamp-1 text-blue-50">{mission.title}</CardTitle>
                            <CardDescription className="flex items-center gap-1 text-xs text-blue-200/60">
                                <MapPin className="h-3 w-3" /> {mission.location_name}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 pt-0 flex-1">
                            <p className="text-sm text-slate-400 line-clamp-2 mb-3">
                                {mission.description}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-950/30 p-2 rounded-lg w-fit">
                                <Calendar className="h-3 w-3" />
                                {new Date(mission.start_time).toLocaleDateString()}
                            </div>
                        </CardContent>
                        <CardFooter className="p-4 pt-0">
                            <Button size="sm" className="w-full bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white border border-blue-500/30" asChild>
                                <Link to={`/missions/${mission.id}`}>
                                    View Details
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>
                ))}

                {/* View All Card */}
                <Link to="/missions" className="min-w-[150px] flex-shrink-0 snap-center">
                    <Card className="h-full flex items-center justify-center bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer">
                        <div className="flex flex-col items-center gap-2 text-muted-foreground p-6">
                            <div className="h-12 w-12 rounded-full bg-background flex items-center justify-center shadow-sm">
                                <ArrowRight className="h-6 w-6" />
                            </div>
                            <span className="font-medium text-sm">View All</span>
                        </div>
                    </Card>
                </Link>
            </div>
        </div>
    );
}
