import { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Loader2 } from "lucide-react";

interface HeatmapPoint {
    latitude: number;
    longitude: number;
    bleach_percent: number;
    severity: string;
}

export default function CoralHeatmap() {
    const [points, setPoints] = useState<HeatmapPoint[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/coral/heatmap")
            .then((res) => res.json())
            .then((data) => {
                setPoints(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Failed to load heatmap data", err);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    // Calculate center based on points or default to something (e.g., Philippines)
    const center: [number, number] = points.length > 0
        ? [points[0].latitude, points[0].longitude]
        : [12.8797, 121.7740]; // Philippines Center

    const getColor = (bleach: number) => {
        if (bleach < 10) return "#10b981"; // Green
        if (bleach < 30) return "#eab308"; // Yellow
        if (bleach < 60) return "#f97316"; // Orange
        if (bleach < 90) return "#ef4444"; // Red
        return "#7f1d1d"; // Dark Red
    };

    return (
        <div className="h-[500px] w-full rounded-xl overflow-hidden border shadow-sm relative z-0">
            <MapContainer
                center={center}
                zoom={6}
                style={{ height: "100%", width: "100%" }}
                scrollWheelZoom={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {points.map((p, idx) => (
                    <CircleMarker
                        key={idx}
                        center={[p.latitude, p.longitude]}
                        pathOptions={{
                            color: getColor(p.bleach_percent),
                            fillColor: getColor(p.bleach_percent),
                            fillOpacity: 0.6,
                            weight: 1
                        }}
                        radius={10 + (p.bleach_percent / 10)} // Size based on severity
                    >
                        <Popup>
                            <div className="text-sm">
                                <strong>{p.severity} Bleaching</strong><br />
                                Severity: {p.bleach_percent}%<br />
                                Lat: {p.latitude.toFixed(4)}, Lng: {p.longitude.toFixed(4)}
                            </div>
                        </Popup>
                    </CircleMarker>
                ))}
            </MapContainer>

            {/* Legend */}
            <div className="absolute bottom-4 right-4 bg-white dark:bg-slate-900 p-3 rounded-lg shadow-md text-xs space-y-1 z-[1000]">
                <div className="font-semibold mb-1">Bleaching Severity</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500"></div> &lt; 10% (Healthy)</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-500"></div> 10-30% (Low)</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-orange-500"></div> 30-60% (Moderate)</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500"></div> 60-90% (High)</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-900"></div> &gt; 90% (Severe)</div>
            </div>
        </div>
    );
}
