import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Icon, LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/react-app/components/ui/card";
import { Button } from "@/react-app/components/ui/button";
import { Badge } from "@/react-app/components/ui/badge";
import { Waves, Trash2, Fish, Anchor, MapPin, Calendar, User, Plus } from "lucide-react";
import MapFilters from "@/react-app/components/MapFilters";

// Sighting types
export type SightingType = "garbage" | "floating" | "wildlife" | "coral";

export interface Sighting {
  id: string;
  type: SightingType;
  subcategory: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  description: string;
  imageUrl?: string;
  severity: number;
  timestamp: string;
  userName: string;
  userLevel: number;
}

// Fix for default marker icons in Leaflet with webpack/vite
const iconUrls = {
  garbage: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='%23e74c3c'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3C/svg%3E",
  floating: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='%23e67e22'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3C/svg%3E",
  wildlife: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='%232ecc71'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3C/svg%3E",
  coral: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='%23ff6b35'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3C/svg%3E",
};

function createCustomIcon(type: SightingType) {
  return new Icon({
    iconUrl: iconUrls[type],
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
}

// Component to handle map bounds when filters change
function MapBoundsHandler({ sightings }: { sightings: Sighting[] }) {
  const map = useMap();

  useEffect(() => {
    if (sightings.length > 0) {
      const bounds = sightings.map((s) => [s.location.lat, s.location.lng] as [number, number]);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
    }
  }, [sightings, map]);

  return null;
}

const typeConfig = {
  garbage: { icon: Trash2, label: "Garbage/Debris", color: "bg-red-500" },
  floating: { icon: Anchor, label: "Floating Trash", color: "bg-orange-500" },
  wildlife: { icon: Fish, label: "Wildlife", color: "bg-green-500" },
  coral: { icon: Waves, label: "Coral Bleaching", color: "bg-coral-500" },
};

export default function MapView() {
  // Mock data - will be replaced with real data later
  const allSightings: Sighting[] = [
    {
      id: "1",
      type: "garbage",
      subcategory: "Plastic bottle",
      location: { lat: 14.5547, lng: 121.024, address: "Manila Bay, Manila" },
      description: "Multiple plastic bottles on the beach",
      severity: 3,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      userName: "MarineHero",
      userLevel: 12,
    },
    {
      id: "2",
      type: "coral",
      subcategory: "Bleached coral",
      location: { lat: 14.556, lng: 121.026, address: "Manila Bay, Philippines" },
      description: "Severe coral bleaching observed",
      severity: 5,
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      userName: "ReefGuardian",
      userLevel: 24,
    },
    {
      id: "3",
      type: "wildlife",
      subcategory: "Sea turtle",
      location: { lat: 14.5535, lng: 121.022, address: "Manila, Philippines" },
      description: "Spotted a green sea turtle near shore",
      severity: 1,
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      userName: "OceanWatcher",
      userLevel: 8,
    },
    {
      id: "4",
      type: "floating",
      subcategory: "Ghost net",
      location: { lat: 14.552, lng: 121.028, address: "Manila Bay" },
      description: "Large fishing net floating near the surface",
      severity: 4,
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      userName: "CoastalCleanup",
      userLevel: 15,
    },
    {
      id: "5",
      type: "garbage",
      subcategory: "Plastic bags",
      location: { lat: 14.558, lng: 121.025, address: "Roxas Boulevard, Manila" },
      description: "Cluster of plastic bags on shoreline",
      severity: 3,
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      userName: "BeachPatrol",
      userLevel: 19,
    },
    {
      id: "6",
      type: "wildlife",
      subcategory: "Dolphin pod",
      location: { lat: 14.5495, lng: 121.021, address: "Manila Bay" },
      description: "Pod of 5-6 dolphins spotted",
      severity: 1,
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      userName: "MarineExplorer",
      userLevel: 21,
    },
  ];

  const [filteredSightings, setFilteredSightings] = useState<Sighting[]>(allSightings);
  const [selectedTypes, setSelectedTypes] = useState<SightingType[]>([
    "garbage",
    "floating",
    "wildlife",
    "coral",
  ]);

  const handleFilterChange = (types: SightingType[]) => {
    setSelectedTypes(types);
    setFilteredSightings(allSightings.filter((s) => types.includes(s.type)));
  };

  // Default center on Manila Bay
  const defaultCenter: LatLngExpression = [14.5547, 121.024];

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "Yesterday";
    return `${diffDays}d ago`;
  };

  return (
    <div className="relative h-[calc(100vh-4rem)] md:h-[calc(100vh-4rem)]">
      {/* Filters Panel */}
      <div className="absolute top-4 left-4 right-4 md:left-4 md:right-auto z-[1000]">
        <MapFilters
          selectedTypes={selectedTypes}
          onFilterChange={handleFilterChange}
          totalSightings={filteredSightings.length}
        />
      </div>

      {/* Map Container */}
      <MapContainer
        center={defaultCenter}
        zoom={13}
        className="h-full w-full"
        style={{ background: "#e0f2fe" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {filteredSightings.map((sighting) => {
          const config = typeConfig[sighting.type];
          const Icon = config.icon;

          return (
            <Marker
              key={sighting.id}
              position={[sighting.location.lat, sighting.location.lng]}
              icon={createCustomIcon(sighting.type)}
            >
              <Popup maxWidth={300} className="custom-popup">
                <Card className="border-0 shadow-none">
                  <CardHeader className="p-3 pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-lg ${config.color} bg-opacity-10`}>
                          <Icon className={`h-4 w-4 text-${config.color.replace("bg-", "")}`} />
                        </div>
                        <CardTitle className="text-sm font-semibold">{sighting.subcategory}</CardTitle>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {"⭐".repeat(Math.min(sighting.severity, 5))}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-3 pt-0 space-y-2">
                    <p className="text-sm text-muted-foreground">{sighting.description}</p>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>{sighting.location.address}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>
                          {sighting.userName} (Lvl {sighting.userLevel})
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatTimestamp(sighting.timestamp)}</span>
                      </div>
                    </div>

                    <Button size="sm" className="w-full mt-2">
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              </Popup>
            </Marker>
          );
        })}

        <MapBoundsHandler sightings={filteredSightings} />
      </MapContainer>

      {/* Stats Badge */}
      <div className="absolute bottom-20 md:bottom-4 right-4 z-[1000]">
        <Card className="shadow-lg">
          <CardContent className="p-3">
            <div className="text-sm font-medium">
              {filteredSightings.length} sighting{filteredSightings.length !== 1 ? "s" : ""}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Floating Action Button */}
      <div className="absolute bottom-24 md:bottom-20 right-4 z-[1000]">
        <Button asChild size="lg" className="h-14 w-14 rounded-full shadow-lg">
          <Link to="/report">
            <Plus className="h-6 w-6" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
