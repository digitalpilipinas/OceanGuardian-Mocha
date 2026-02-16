import { Card, CardContent } from "@/react-app/components/ui/card";
import { Badge } from "@/react-app/components/ui/badge";
import { Button } from "@/react-app/components/ui/button";
import { X, MapPin, Calendar, User, Waves, Trash2, Fish, Anchor, Thermometer, Droplets, ArrowDown } from "lucide-react";
import type { Sighting } from "@/react-app/pages/MapView";

const typeConfig: Record<string, { icon: typeof Waves; label: string; color: string; bg: string; emoji: string }> = {
    garbage: { icon: Trash2, label: "Beach Garbage", color: "text-red-500", bg: "bg-red-100 dark:bg-red-900/30", emoji: "🗑️" },
    floating: { icon: Anchor, label: "Floating Trash", color: "text-orange-500", bg: "bg-orange-100 dark:bg-orange-900/30", emoji: "🚢" },
    wildlife: { icon: Fish, label: "Wildlife", color: "text-green-500", bg: "bg-green-100 dark:bg-green-900/30", emoji: "🐢" },
    coral: { icon: Waves, label: "Coral Health", color: "text-pink-500", bg: "bg-pink-100 dark:bg-pink-900/30", emoji: "🪸" },
};

const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    approved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    flagged: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
};

const severityEmoji = ["", "🟢", "🟡", "🟠", "🔴", "🚨"];

interface SightingDetailProps {
    sighting: Sighting;
    onClose: () => void;
}

function formatTimestamp(timestamp: string) {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function formatRelativeTime(timestamp: string) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    return `${diffDays}d ago`;
}

export default function SightingDetail({ sighting, onClose }: SightingDetailProps) {
    const config = typeConfig[sighting.type] || typeConfig.garbage;

    return (
        <div className="fixed inset-x-0 bottom-0 z-[1100] animate-in slide-in-from-bottom duration-300">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/30 backdrop-blur-sm -z-10"
                onClick={onClose}
            />

            <Card className="rounded-t-2xl rounded-b-none shadow-2xl max-h-[70vh] overflow-y-auto mx-auto max-w-lg">
                {/* Drag handle */}
                <div className="flex justify-center pt-2">
                    <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
                </div>

                <CardContent className="p-4 space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className={`p-2.5 rounded-xl ${config.bg}`}>
                                <span className="text-xl">{config.emoji}</span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">{sighting.subcategory}</h3>
                                <p className={`text-sm font-medium ${config.color}`}>{config.label}</p>
                            </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0 shrink-0">
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Status & Severity Row */}
                    <div className="flex items-center gap-2">
                        <Badge className={statusColors[sighting.status] || statusColors.pending}>
                            {sighting.status || "pending"}
                        </Badge>
                        <Badge variant="outline" className="text-sm">
                            {severityEmoji[sighting.severity] || "🟢"} Severity {sighting.severity}/5
                        </Badge>
                    </div>

                    {/* Photo */}
                    {sighting.image_key && (
                        <div className="rounded-xl overflow-hidden border">
                            <img
                                src={`/api/sightings/${sighting.id}/photo`}
                                alt="Sighting photo"
                                className="w-full h-48 object-cover"
                                loading="lazy"
                            />
                        </div>
                    )}

                    {/* Description */}
                    <div>
                        <p className="text-sm leading-relaxed">{sighting.description}</p>
                    </div>

                    {/* Coral Data */}
                    {sighting.type === "coral" && (sighting.water_temp || sighting.bleach_percent || sighting.depth) && (
                        <div className="grid grid-cols-3 gap-2">
                            {sighting.water_temp && (
                                <div className="bg-muted/50 rounded-lg p-2.5 text-center">
                                    <Thermometer className="h-4 w-4 mx-auto text-orange-500 mb-1" />
                                    <p className="text-sm font-bold">{sighting.water_temp}°C</p>
                                    <p className="text-[10px] text-muted-foreground">Water Temp</p>
                                </div>
                            )}
                            {sighting.bleach_percent != null && (
                                <div className="bg-muted/50 rounded-lg p-2.5 text-center">
                                    <Droplets className="h-4 w-4 mx-auto text-blue-500 mb-1" />
                                    <p className="text-sm font-bold">{sighting.bleach_percent}%</p>
                                    <p className="text-[10px] text-muted-foreground">Bleaching</p>
                                </div>
                            )}
                            {sighting.depth && (
                                <div className="bg-muted/50 rounded-lg p-2.5 text-center">
                                    <ArrowDown className="h-4 w-4 mx-auto text-cyan-500 mb-1" />
                                    <p className="text-sm font-bold">{sighting.depth}m</p>
                                    <p className="text-[10px] text-muted-foreground">Depth</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Meta */}
                    <div className="flex items-center justify-between text-sm text-muted-foreground border-t pt-3">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5">
                                <User className="h-3.5 w-3.5" />
                                <span>
                                    {sighting.user_name || "Anonymous"}
                                    {sighting.user_level ? ` · Lvl ${sighting.user_level}` : ""}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5" title={formatTimestamp(sighting.created_at)}>
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{formatRelativeTime(sighting.created_at)}</span>
                        </div>
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span>{sighting.address || `${sighting.latitude.toFixed(4)}, ${sighting.longitude.toFixed(4)}`}</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
