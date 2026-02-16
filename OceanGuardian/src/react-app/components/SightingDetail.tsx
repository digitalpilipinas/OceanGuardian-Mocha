import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Card, CardContent } from "@/react-app/components/ui/card";
import { Badge } from "@/react-app/components/ui/badge";
import { Button } from "@/react-app/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/react-app/components/ui/avatar";
import { Input } from "@/react-app/components/ui/input";
import { X, MapPin, Calendar, User, Waves, Trash2, Fish, Anchor, Thermometer, Droplets, ArrowDown, ThumbsUp, MessageSquare, Send } from "lucide-react";
import { useAuth } from "@getmocha/users-service/react";
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
    const { user } = useAuth();
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
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Badge className={statusColors[sighting.status] || statusColors.pending}>
                                {sighting.status || "pending"}
                            </Badge>
                            <Badge variant="outline" className="text-sm">
                                {severityEmoji[sighting.severity] || "🟢"} Severity {sighting.severity}/5
                            </Badge>
                        </div>

                        <Button
                            variant={hasValidated ? "default" : "outline"}
                            size="sm"
                            className={`gap-1.5 h-8 ${hasValidated ? "bg-blue-600 hover:bg-blue-700" : ""}`}
                            onClick={handleValidate}
                            disabled={!user}
                        >
                            <ThumbsUp className={`h-3.5 w-3.5 ${hasValidated ? "fill-current" : ""}`} />
                            <span>{validationCount}</span>
                            <span className="sr-only">Validations</span>
                        </Button>
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

                    {/* Comments Section */}
                    <div className="border-t pt-4 space-y-4">
                        <h4 className="font-semibold text-sm flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" />
                            Comments ({comments.length})
                        </h4>

                        <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                            {loadingComments ? (
                                <p className="text-xs text-muted-foreground text-center py-2">Loading comments...</p>
                            ) : comments.length === 0 ? (
                                <p className="text-xs text-muted-foreground text-center py-2">No comments yet. Be the first!</p>
                            ) : (
                                comments.map(comment => (
                                    <div key={comment.id} className="flex gap-2.5 text-sm">
                                        <Link to={`/profile/${comment.user_id}`}>
                                            <Avatar className="h-6 w-6 border">
                                                <AvatarImage src={comment.avatar_url || undefined} />
                                                <AvatarFallback className="text-[10px]">{comment.username?.[0]?.toUpperCase() || "?"}</AvatarFallback>
                                            </Avatar>
                                        </Link>
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center justify-between">
                                                <Link to={`/profile/${comment.user_id}`} className="font-medium hover:underline text-xs">
                                                    {comment.username || "Anonymous"}
                                                </Link>
                                                <span className="text-[10px] text-muted-foreground">{formatRelativeTime(comment.created_at)}</span>
                                            </div>
                                            <p className="text-muted-foreground leading-snug">{comment.content}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {user ? (
                            <form onSubmit={handleSubmitComment} className="flex gap-2">
                                <Input
                                    placeholder="Add a comment..."
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    className="h-8 text-sm"
                                    disabled={submittingComment}
                                />
                                <Button size="sm" type="submit" disabled={!newComment.trim() || submittingComment} className="h-8 w-8 p-0 shrink-0">
                                    <Send className="h-3.5 w-3.5" />
                                </Button>
                            </form>
                        ) : (
                            <div className="bg-muted/50 rounded-lg p-2 text-center text-xs">
                                <Link to="/auth/login" className="text-primary hover:underline">Log in</Link> to comment
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div >
    );
}
