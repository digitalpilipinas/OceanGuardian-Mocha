import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import { Link } from "react-router";
import { MapPin, ArrowRight } from "lucide-react";
import "leaflet/dist/leaflet.css";
import { DivIcon } from "leaflet";

// Reuse icon logic simplified
const createIcon = (type: string) => new DivIcon({
    html: `<div style="width: 14px; height: 14px; border-radius: 50%; background: ${type === 'coral' ? '#FF643C' :
        type === 'wildlife' ? '#3b82f6' :
            type === 'floating' ? '#FF643C' :
                '#FF643C'
        }; border: 2px solid white; box-shadow: 0 0 15px ${type === 'coral' || type === 'floating' ? 'rgba(255,100,60,0.5)' : 'rgba(59,130,246,0.5)'};"></div>`,
    className: "bg-transparent border-none",
    iconSize: [14, 14],
    iconAnchor: [7, 7],
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
        <div className="h-full flex flex-col bg-secondary/60 border border-white/5 rounded-[3rem] shadow-2xl overflow-hidden relative group">
            <div className="p-8 pb-4">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/20 rounded-xl">
                            <MapPin className="h-5 w-5 text-primary" />
                        </div>
                        <h3 className="text-xl font-black text-white tracking-tighter uppercase italic">Live Net</h3>
                    </div>
                </div>
                <p className="text-[10px] text-white/20 font-black uppercase tracking-widest">Recent anomalies detected</p>
            </div>

            <div className="flex-1 relative min-h-[300px] m-4 rounded-[2rem] overflow-hidden border border-white/5">
                {/* Helper text overlay */}
                <div className="absolute bottom-6 left-6 right-6 z-[400] bg-secondary/80 backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-2xl flex justify-between items-center group-hover:bg-secondary/90 transition-colors">
                    <div className="text-[10px] font-black uppercase tracking-widest text-white/40 italic">
                        {sightings.length} Nodes Online
                    </div>
                    <Link
                        to="/map"
                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary hover:text-white transition-colors group/link"
                    >
                        Engage <ArrowRight className="h-3 w-3 group-hover/link:translate-x-1 transition-transform" />
                    </Link>
                </div>

                <MapContainer
                    center={[14.5995, 120.9842]}
                    zoom={10}
                    zoomControl={false}
                    scrollWheelZoom={false}
                    dragging={true}
                    className="w-full h-full"
                    style={{ background: "#020817" }}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        className="invert-[0.9] hue-rotate-[180deg] brightness-[0.6] contrast-[1.2]"
                    />
                    {sightings.map(s => (
                        <Marker
                            key={s.id}
                            position={[s.latitude, s.longitude]}
                            icon={createIcon(s.type)}
                        />
                    ))}
                </MapContainer>
            </div>
        </div>
    );
}
