import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { Icon, DivIcon, LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router";
import { Card, CardContent } from "@/react-app/components/ui/card";
import { Button } from "@/react-app/components/ui/button";
import { Badge } from "@/react-app/components/ui/badge";
import { Plus, Loader2 } from "lucide-react";
import MapFilters from "@/react-app/components/MapFilters";
import SightingDetail from "@/react-app/components/SightingDetail";

// Sighting types
export type SightingType = "garbage" | "floating" | "wildlife" | "coral";

export interface Sighting {
  id: number;
  type: SightingType;
  subcategory: string;
  latitude: number;
  longitude: number;
  address: string | null;
  description: string;
  image_key: string | null;
  severity: number;
  created_at: string;
  user_name: string | null;
  user_level: number | null;
  status: string;
  water_temp?: number | null;
  bleach_percent?: number | null;
  depth?: number | null;
}

// SVG markers with distinct shapes per type
const markerSvgs: Record<SightingType, string> = {
  garbage: `<svg xmlns='http://www.w3.org/2000/svg' width='32' height='40' viewBox='0 0 32 40'>
    <path d='M16 0C7.16 0 0 7.16 0 16c0 12 16 24 16 24s16-12 16-24C32 7.16 24.84 0 16 0z' fill='%23ef4444'/>
    <circle cx='16' cy='15' r='8' fill='white' opacity='0.3'/>
    <text x='16' y='19' text-anchor='middle' font-size='12'>🗑️</text>
  </svg>`,
  floating: `<svg xmlns='http://www.w3.org/2000/svg' width='32' height='40' viewBox='0 0 32 40'>
    <path d='M16 0C7.16 0 0 7.16 0 16c0 12 16 24 16 24s16-12 16-24C32 7.16 24.84 0 16 0z' fill='%23f97316'/>
    <circle cx='16' cy='15' r='8' fill='white' opacity='0.3'/>
    <text x='16' y='19' text-anchor='middle' font-size='12'>🚢</text>
  </svg>`,
  wildlife: `<svg xmlns='http://www.w3.org/2000/svg' width='32' height='40' viewBox='0 0 32 40'>
    <path d='M16 0C7.16 0 0 7.16 0 16c0 12 16 24 16 24s16-12 16-24C32 7.16 24.84 0 16 0z' fill='%2322c55e'/>
    <circle cx='16' cy='15' r='8' fill='white' opacity='0.3'/>
    <text x='16' y='19' text-anchor='middle' font-size='12'>🐢</text>
  </svg>`,
  coral: `<svg xmlns='http://www.w3.org/2000/svg' width='32' height='40' viewBox='0 0 32 40'>
    <path d='M16 0C7.16 0 0 7.16 0 16c0 12 16 24 16 24s16-12 16-24C32 7.16 24.84 0 16 0z' fill='%23ec4899'/>
    <circle cx='16' cy='15' r='8' fill='white' opacity='0.3'/>
    <text x='16' y='19' text-anchor='middle' font-size='12'>🪸</text>
  </svg>`,
};

function createCustomIcon(type: SightingType) {
  return new DivIcon({
    html: markerSvgs[type],
    className: "custom-marker-icon",
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -40],
  });
}

// Cluster icon creator
function createClusterIcon(cluster: any) {
  const count = cluster.getChildCount();
  let size = "small";
  let bgColor = "bg-primary";
  if (count >= 100) { size = "large"; bgColor = "bg-red-500"; }
  else if (count >= 10) { size = "medium"; bgColor = "bg-orange-500"; }

  return new DivIcon({
    html: `<div class="cluster-marker ${bgColor} ${size}">
      <span>${count}</span>
    </div>`,
    className: "custom-cluster-icon",
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
}

// Component to handle map bounds when sightings change
function MapBoundsHandler({ sightings }: { sightings: Sighting[] }) {
  const map = useMap();

  useEffect(() => {
    if (sightings.length > 0) {
      const bounds = sightings.map((s) => [s.latitude, s.longitude] as [number, number]);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
    }
  }, [sightings, map]);

  return null;
}

// Date filter helper
function isWithinDateRange(dateStr: string, range: string): boolean {
  if (range === "all") return true;
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  switch (range) {
    case "today": return diffDays < 1;
    case "week": return diffDays < 7;
    case "month": return diffDays < 30;
    default: return true;
  }
}

export default function MapView() {
  const [allSightings, setAllSightings] = useState<Sighting[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<SightingType[]>(["garbage", "floating", "wildlife", "coral"]);
  const [dateRange, setDateRange] = useState("all");
  const [minSeverity, setMinSeverity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedSighting, setSelectedSighting] = useState<Sighting | null>(null);

  // Fetch sightings from API
  useEffect(() => {
    const fetchSightings = async () => {
      try {
        const res = await fetch("/api/sightings");
        if (res.ok) {
          const data = await res.json();
          setAllSightings(data);
        }
      } catch (err) {
        console.error("Failed to load sightings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSightings();
    const interval = setInterval(fetchSightings, 30000);
    return () => clearInterval(interval);
  }, []);

  // Apply all filters
  const filteredSightings = useMemo(() => {
    return allSightings.filter((s) =>
      selectedTypes.includes(s.type) &&
      s.severity >= minSeverity &&
      isWithinDateRange(s.created_at, dateRange)
    );
  }, [allSightings, selectedTypes, minSeverity, dateRange]);

  // Default center on Manila Bay
  const defaultCenter: LatLngExpression = [14.5547, 121.024];

  return (
    <div className="relative h-[calc(100vh-4rem)] md:h-[calc(100vh-4rem)]">
      {/* Custom CSS for cluster markers */}
      <style>{`
        .custom-marker-icon { background: none; border: none; }
        .custom-cluster-icon { background: none; border: none; }
        .cluster-marker {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          color: white;
          font-weight: bold;
          font-size: 14px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          border: 3px solid rgba(255,255,255,0.8);
        }
        .cluster-marker.medium { width: 48px; height: 48px; font-size: 15px; }
        .cluster-marker.large { width: 56px; height: 56px; font-size: 16px; }
        .bg-primary { background: hsl(var(--primary)); }
        .bg-orange-500 { background: #f97316; }
        .bg-red-500 { background: #ef4444; }
      `}</style>

      {/* Filters Panel */}
      <div className="absolute top-4 left-4 right-4 md:left-4 md:right-auto md:w-80 z-[1000]">
        <MapFilters
          selectedTypes={selectedTypes}
          onFilterChange={setSelectedTypes}
          totalSightings={filteredSightings.length}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          minSeverity={minSeverity}
          onMinSeverityChange={setMinSeverity}
        />
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1000]">
          <Card className="shadow-lg">
            <CardContent className="p-4 flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="text-sm">Loading sightings...</span>
            </CardContent>
          </Card>
        </div>
      )}

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

        <MarkerClusterGroup
          chunkedLoading
          maxClusterRadius={60}
          iconCreateFunction={createClusterIcon}
          spiderfyOnMaxZoom
          showCoverageOnHover={false}
        >
          {filteredSightings.map((sighting) => (
            <Marker
              key={sighting.id}
              position={[sighting.latitude, sighting.longitude]}
              icon={createCustomIcon(sighting.type)}
              eventHandlers={{
                click: () => setSelectedSighting(sighting),
              }}
            />
          ))}
        </MarkerClusterGroup>

        {filteredSightings.length > 0 && <MapBoundsHandler sightings={filteredSightings} />}
      </MapContainer>

      {/* Stats Badge */}
      <div className="absolute bottom-20 md:bottom-4 right-4 z-[1000]">
        <Card className="shadow-lg backdrop-blur-sm bg-card/90">
          <CardContent className="p-3">
            <div className="text-sm font-medium">
              {filteredSightings.length} sighting{filteredSightings.length !== 1 ? "s" : ""}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Floating Action Button */}
      <div className="absolute bottom-24 md:bottom-16 right-4 z-[1000]">
        <Button asChild size="lg" className="h-14 w-14 rounded-full shadow-lg">
          <Link to="/report">
            <Plus className="h-6 w-6" />
          </Link>
        </Button>
      </div>

      {/* Sighting Detail Panel */}
      {selectedSighting && (
        <SightingDetail
          sighting={selectedSighting}
          onClose={() => setSelectedSighting(null)}
        />
      )}
    </div>
  );
}
