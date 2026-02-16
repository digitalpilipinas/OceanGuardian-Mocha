import { useState, useEffect } from "react";
import { Link } from "react-router";
import { CardContent } from "@/react-app/components/ui/card";
import { Badge } from "@/react-app/components/ui/badge";
import { Button } from "@/react-app/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/react-app/components/ui/avatar";
import { Input } from "@/react-app/components/ui/input";
import { X, MapPin, Calendar, User, Waves, Trash2, Fish, Anchor, Thermometer, Droplets, ArrowDown, ThumbsUp, MessageSquare, Send, AlertTriangle, Loader2 } from "lucide-react";
import { useUserProfile } from "@/react-app/hooks/useUserProfile";
import type { Sighting } from "@/react-app/pages/MapView";

const typeConfig: Record<string, { icon: typeof Waves; label: string; color: string; bg: string }> = {
    garbage: { icon: Trash2, label: "Beach Garbage", color: "text-red-500", bg: "bg-red-100 dark:bg-red-900/30" },
    floating: { icon: Anchor, label: "Floating Trash", color: "text-orange-500", bg: "bg-orange-100 dark:bg-orange-900/30" },
    wildlife: { icon: Fish, label: "Wildlife", color: "text-green-500", bg: "bg-green-100 dark:bg-green-900/30" },
    coral: { icon: Waves, label: "Coral Health", color: "text-pink-500", bg: "bg-pink-100 dark:bg-pink-900/30" },
};

const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    approved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    flagged: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
};

interface SightingDetailProps {
    sighting: Sighting;
    onClose: () => void;
}

interface Comment {
    id: number;
    user_id: string;
    content: string;
    created_at: string;
    username?: string;
    avatar_url?: string;
    level?: number;
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
    const { profile: user } = useUserProfile();
    const config = typeConfig[sighting.type] || typeConfig.garbage;

    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState("");
    const [validationCount, setValidationCount] = useState(sighting.validation_count);
    const [hasValidated, setHasValidated] = useState(false);
    const [loadingComments, setLoadingComments] = useState(false);
    const [submittingComment, setSubmittingComment] = useState(false);

    useEffect(() => {
        if (sighting.id) {
            fetchComments();
            checkValidationStatus();
        }
    }, [sighting.id, user]);

    const fetchComments = async () => {
        setLoadingComments(true);
        try {
            const res = await fetch(`/api/sightings/${sighting.id}/comments`);
            if (res.ok) {
                setComments(await res.json());
            }
        } catch (error) {
            console.error("Failed to fetch comments", error);
        } finally {
            setLoadingComments(false);
        }
    };

    const checkValidationStatus = async () => {
        if (!user) return;
        try {
            const res = await fetch(`/api/sightings/${sighting.id}/validate`);
            if (res.ok) {
                const data = await res.json();
                setHasValidated(data.validated);
            }
        } catch (error) {
            console.error("Failed to check validation", error);
        }
    };

    const handleValidate = async () => {
        if (!user) return;
        // Optimistic update
        setHasValidated(!hasValidated);
        setValidationCount(prev => hasValidated ? prev - 1 : prev + 1);

        try {
            const res = await fetch(`/api/sightings/${sighting.id}/validate`, { method: "POST" });
            if (!res.ok) {
                // Revert on failure
                setHasValidated(!hasValidated); // revert state (since !hasValidated is the new state we just set optimistically, reverting means flipping it back? wait.
                // Actually logic is: if we added, now we remove. 
                // But usually simpler to just fetch real state or revert.
                // Reverting manually:
                setValidationCount(prev => hasValidated ? prev + 1 : prev - 1); // logic is inverted because we already flipped state above
            } else {
                const data = await res.json();
                setValidationCount(data.validation_count);
                // setHasValidated based on action? already done optimistically.
            }
        } catch (error) {
            setHasValidated(!hasValidated);
            setValidationCount(prev => hasValidated ? prev + 1 : prev - 1);
        }
    };

    const handleSubmitComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !user) return;

        setSubmittingComment(true);
        try {
            const res = await fetch(`/api/sightings/${sighting.id}/comments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: newComment })
            });

            if (res.ok) {
                const comment = await res.json();
                setComments([...comments, comment]);
                setNewComment("");
            }
        } catch (error) {
            console.error("Failed to post comment", error);
        } finally {
            setSubmittingComment(false);
        }
    };

    return (
        <div className="fixed inset-x-0 bottom-0 z-[1100] animate-in slide-in-from-bottom duration-300">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/40 -z-10"
                onClick={onClose}
            />

            <div className="rounded-t-[3rem] rounded-b-none shadow-[0_-20px_50px_rgba(0,0,0,0.5)] max-h-[85vh] overflow-y-auto mx-auto max-w-lg border border-white/10 bg-secondary/95">
                {/* Drag handle */}
                <div className="flex justify-center pt-4">
                    <div className="w-16 h-1.5 rounded-full bg-white/10" />
                </div>

                <CardContent className="p-8 space-y-8">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-6">
                        <div className="flex items-center gap-5">
                            <div className={`p-4 rounded-[1.5rem] bg-white/5 border border-white/10 shadow-inner ${config.bg.replace('dark:', '')}`}>
                                <config.icon className={`h-6 w-6 ${config.color}`} />
                            </div>
                            <div>
                                <h3 className="font-black text-2xl text-white tracking-tight">{sighting.subcategory}</h3>
                                <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${config.color} brightness-125`}>{config.label}</p>
                            </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={onClose} className="h-10 w-10 p-0 shrink-0 rounded-full hover:bg-white/10 text-white/40 hover:text-white">
                            <X className="h-6 w-6" />
                        </Button>
                    </div>

                    {/* Status & Severity Row */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Badge className={`${statusColors[sighting.status] || statusColors.pending} border-none font-black text-[10px] uppercase tracking-widest px-4 py-1.5 rounded-full !bg-white/5 !text-white/80`}>
                                {sighting.status || "pending"}
                            </Badge>
                            <Badge variant="outline" className="text-[10px] gap-2 font-black uppercase tracking-widest border-white/10 text-white/40 px-4 py-1.5 rounded-full">
                                <AlertTriangle className={`h-3.5 w-3.5 ${sighting.severity >= 4 ? "text-red-500 animate-pulse" :
                                    sighting.severity >= 3 ? "text-orange-500" :
                                        "text-white/20"
                                    }`} />
                                <span className="opacity-60">Level</span> <span className="text-white">{sighting.severity}/5</span>
                            </Badge>
                        </div>

                        <Button
                            variant={hasValidated ? "default" : "outline"}
                            size="sm"
                            className={`gap-3 h-10 px-6 rounded-full font-black text-[10px] uppercase tracking-widest transition-all ${hasValidated ? "bg-primary text-white shadow-lg shadow-primary/30 border-none" : "border-white/10 text-white/60 hover:bg-white/5"}`}
                            onClick={handleValidate}
                            disabled={!user}
                        >
                            <ThumbsUp className={`h-4 w-4 ${hasValidated ? "fill-current" : ""}`} />
                            <span>{validationCount}</span>
                        </Button>
                    </div>

                    {/* Photo */}
                    {sighting.image_key && (
                        <div className="rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl relative group">
                            <img
                                src={`/api/sightings/${sighting.id}/photo`}
                                alt="Sighting photo"
                                className="w-full h-64 object-cover transition-transform duration-700 group-hover:scale-110"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                                <p className="text-white/60 text-[10px] font-black uppercase tracking-widest italic">Verification Photo 01</p>
                            </div>
                        </div>
                    )}

                    {/* Description */}
                    <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5 italic">
                        <p className="text-sm leading-relaxed text-white/80 font-medium">"{sighting.description}"</p>
                    </div>

                    {/* Coral Data */}
                    {sighting.type === "coral" && (sighting.water_temp || sighting.bleach_percent || sighting.depth) && (
                        <div className="grid grid-cols-3 gap-4">
                            {sighting.water_temp && (
                                <div className="bg-white/5 rounded-3xl p-4 text-center border border-white/5 shadow-inner">
                                    <Thermometer className="h-5 w-5 mx-auto text-orange-500 mb-2" />
                                    <p className="text-lg font-black text-white">{sighting.water_temp}°C</p>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Water Temp</p>
                                </div>
                            )}
                            {sighting.bleach_percent != null && (
                                <div className="bg-white/5 rounded-3xl p-4 text-center border border-white/5 shadow-inner">
                                    <Droplets className="h-5 w-5 mx-auto text-blue-500 mb-2" />
                                    <p className="text-lg font-black text-white">{sighting.bleach_percent}%</p>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Bleaching</p>
                                </div>
                            )}
                            {sighting.depth && (
                                <div className="bg-white/5 rounded-3xl p-4 text-center border border-white/5 shadow-inner">
                                    <ArrowDown className="h-5 w-5 mx-auto text-cyan-500 mb-2" />
                                    <p className="text-lg font-black text-white">{sighting.depth}m</p>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Depth</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Meta */}
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-white/40 border-t border-white/5 pt-6">
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2 text-primary/80">
                                <User className="h-4 w-4" />
                                <span>
                                    {sighting.user_name || "Anonymous"}
                                    {sighting.user_level ? ` · Lvl ${sighting.user_level}` : ""}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 hover:text-white transition-colors cursor-help" title={formatTimestamp(sighting.created_at)}>
                            <Calendar className="h-4 w-4" />
                            <span>{formatRelativeTime(sighting.created_at)}</span>
                        </div>
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/20 italic">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span>{sighting.address || `${sighting.latitude.toFixed(4)}, ${sighting.longitude.toFixed(4)}`}</span>
                    </div>

                    {/* Comments Section */}
                    <div className="border-t border-white/5 pt-8 space-y-6">
                        <h4 className="font-black text-xs uppercase tracking-[0.3em] text-primary flex items-center gap-3">
                            <MessageSquare className="h-4 w-4" />
                            Guardian Discussion ({comments.length})
                        </h4>

                        <div className="space-y-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                            {loadingComments ? (
                                <div className="flex flex-col items-center py-10 gap-3">
                                    <Loader2 className="h-6 w-6 animate-spin text-primary/40" />
                                    <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Syncing logs...</p>
                                </div>
                            ) : comments.length === 0 ? (
                                <p className="text-[10px] font-black uppercase tracking-widest text-white/20 text-center py-10 italic">No reports in this frequency yet.</p>
                            ) : (
                                comments.map(comment => (
                                    <div key={comment.id} className="flex gap-4 group/comment">
                                        <Link to={`/profile/${comment.user_id}`}>
                                            <Avatar className="h-10 w-10 border-2 border-white/5 shadow-lg group-hover/comment:border-primary/50 transition-colors">
                                                <AvatarImage src={comment.avatar_url || undefined} />
                                                <AvatarFallback className="text-xs font-black bg-white/5 text-white/60">{comment.username?.[0]?.toUpperCase() || "?"}</AvatarFallback>
                                            </Avatar>
                                        </Link>
                                        <div className="flex-1 space-y-1.5 bg-white/5 p-4 rounded-2xl rounded-tl-none border border-white/5">
                                            <div className="flex items-center justify-between">
                                                <Link to={`/profile/${comment.user_id}`} className="font-black text-[10px] uppercase tracking-widest text-primary/80 hover:text-primary transition-colors">
                                                    {comment.username || "Anonymous"}
                                                </Link>
                                                <span className="text-[8px] font-black text-white/20 uppercase tracking-tighter">{formatRelativeTime(comment.created_at)}</span>
                                            </div>
                                            <p className="text-xs font-medium text-white/70 leading-relaxed font-bold">{comment.content}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {user ? (
                            <form onSubmit={handleSubmitComment} className="flex gap-3 pt-2">
                                <Input
                                    placeholder="Transmit data..."
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    className="h-12 bg-white/5 border-white/10 rounded-2xl text-xs font-bold text-white placeholder:text-white/20 focus:bg-white/10 transition-all px-6"
                                    disabled={submittingComment}
                                />
                                <Button size="sm" type="submit" disabled={!newComment.trim() || submittingComment} className="h-12 w-12 p-0 shrink-0 rounded-2xl bg-primary text-white shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                                    <Send className="h-5 w-5" />
                                </Button>
                            </form>
                        ) : (
                            <div className="bg-white/5 rounded-2xl p-4 text-center text-[10px] font-black uppercase tracking-widest text-white/40 border border-white/5 italic">
                                <Link to="/login" className="text-primary hover:text-primary/80 transition-colors">Log in</Link> to join the frequency
                            </div>
                        )}
                    </div>
                </CardContent>
            </div>
        </div >
    );
}
