import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import { Link } from "react-router";
import { Button } from "@/react-app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/react-app/components/ui/card";
import { MapPin, ArrowRight } from "lucide-react";
import "leaflet/dist/leaflet.css";
import { DivIcon } from "leaflet";

// Reuse icon logic simplified
const createIcon = (type: string) => new DivIcon({
    html: `<div style="font-size: 20px;">
    ${type === 'coral' ? '🪸' : type === 'wildlife' ? '🐢' : type === 'floating' ? '🚢' : '🗑️'}
  </div>`,
    className: "bg-transparent border-none",
    iconSize: [20, 20],
    iconAnchor: [10, 10],
});

interface Sighting {
    id: number;
    latitude: number;
    longitude: number;
    type: string;
}

export default function MapPreview() {
    const [sightings, setSightings] = useState<Sighting[]>([]);

    useEffect(() => {
        fetch("/api/sightings?limit=20")
            .then(res => res.ok ? res.json() : [])
            .then(setSightings)
            .catch(() => { });
    }, []);

    return (
        <Card className="h-full flex flex-col overflow-hidden">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Live Map
                </CardTitle>
                <CardDescription>Recent activity nearby</CardDescription>
            </CardHeader>
            <CardContent className="p-0 flex-1 relative min-h-[300px]">
                {/* Helper text overlay */}
                <div className="absolute bottom-4 left-4 right-4 z-[400] bg-white/90 dark:bg-black/80 backdrop-blur p-3 rounded-lg border shadow-sm flex justify-between items-center">
                    <div className="text-xs font-medium">
                        {sightings.length} recent sightings
                    </div>
                    <Button size="sm" variant="ghost" className="h-8 gap-1" asChild>
                        <Link to="/map">
                            Full Map <ArrowRight className="h-3 w-3" />
                        </Link>
                    </Button>
                </div>

                <MapContainer
                    center={[14.5995, 120.9842]}
                    zoom={10}
                    zoomControl={false}
                    scrollWheelZoom={false}
                    dragging={true}
                    className="w-full h-full"
                    style={{ background: "#e0f2fe" }}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {sightings.map(s => (
                        <Marker
                            key={s.id}
                            position={[s.latitude, s.longitude]}
                            icon={createIcon(s.type)}
                        />
                    ))}
                </MapContainer>
            </CardContent>
        </Card>
    );
}
