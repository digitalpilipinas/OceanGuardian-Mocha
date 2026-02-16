import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@getmocha/users-service/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/react-app/components/ui/card";
import { Button } from "@/react-app/components/ui/button";
import { Input } from "@/react-app/components/ui/input";
import { Label } from "@/react-app/components/ui/label";
import { Textarea } from "@/react-app/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/react-app/components/ui/select";
import { Loader2, ArrowLeft, MapPin, Calendar, Users, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/react-app/components/ui/use-toast";
import type { UserProfile } from "@/shared/types";

export default function CreateMission() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [isAuthorized, setIsAuthorized] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        location_name: "",
        latitude: "",
        longitude: "",
        start_time: "",
        end_time: "",
        difficulty: "1",
        max_participants: "",
        image_url: "",
    });

    useEffect(() => {
        async function checkPermission() {
            if (!user) return;
            try {
                const res = await fetch("/api/profiles/me");
                if (res.ok) {
                    const profile: UserProfile = await res.json();
                    if (["admin", "ambassador"].includes(profile.role)) {
                        setIsAuthorized(true);
                    } else {
                        toast({
                            title: "Access Denied",
                            description: "Only Ambassadors and Admins can create missions.",
                            variant: "destructive",
                        });
                        navigate("/missions");
                    }
                }
            } catch (err) {
                console.error("Failed to check permissions", err);
            } finally {
                setLoading(false);
            }
        }
        checkPermission();
    }, [user, navigate, toast]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const payload = {
                ...formData,
                latitude: parseFloat(formData.latitude),
                longitude: parseFloat(formData.longitude),
                difficulty: parseInt(formData.difficulty),
                max_participants: formData.max_participants ? parseInt(formData.max_participants) : undefined,
                start_time: new Date(formData.start_time).toISOString(),
                end_time: new Date(formData.end_time).toISOString(),
            };

            const res = await fetch("/api/missions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || "Failed to create mission");
            }

            toast({
                title: "Mission Created!",
                description: "Your cleanup mission has been successfully published.",
            });

            navigate("/missions");
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.message,
                variant: "destructive",
            });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!isAuthorized) return null;

    return (
        <div className="container mx-auto px-4 py-8 pb-20 md:pb-8 max-w-2xl">
            <Button variant="ghost" onClick={() => navigate("/missions")} className="mb-4 pl-0">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Missions
            </Button>

            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Create Cleanup Mission</CardTitle>
                    <CardDescription>
                        Organize a community cleanup event. Fill in the details below.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="title">Mission Title</Label>
                            <Input
                                id="title"
                                name="title"
                                placeholder="e.g., Beach Cleanup at Blue Bay"
                                required
                                value={formData.title}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                name="description"
                                placeholder="Describe the mission goals, what to bring, meeting point, etc."
                                required
                                value={formData.description}
                                onChange={handleChange}
                                rows={4}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="location_name">Location Name</Label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="location_name"
                                        name="location_name"
                                        placeholder="e.g. Blue Bay Beach"
                                        required
                                        value={formData.location_name}
                                        onChange={handleChange}
                                        className="pl-9"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Coordinates</Label>
                                <div className="flex gap-2">
                                    <Input
                                        name="latitude"
                                        placeholder="Lat (e.g. 14.5)"
                                        required
                                        type="number"
                                        step="any"
                                        value={formData.latitude}
                                        onChange={handleChange}
                                    />
                                    <Input
                                        name="longitude"
                                        placeholder="Long (e.g. 120.9)"
                                        required
                                        type="number"
                                        step="any"
                                        value={formData.longitude}
                                        onChange={handleChange}
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground">Tip: Use the Map page to find coordinates.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="start_time">Start Time</Label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                                    <Input
                                        id="start_time"
                                        name="start_time"
                                        type="datetime-local"
                                        required
                                        value={formData.start_time}
                                        onChange={handleChange}
                                        className="pl-9"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="end_time">End Time</Label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                                    <Input
                                        id="end_time"
                                        name="end_time"
                                        type="datetime-local"
                                        required
                                        value={formData.end_time}
                                        onChange={handleChange}
                                        className="pl-9"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="difficulty">Difficulty (1-5)</Label>
                                <Select
                                    value={formData.difficulty}
                                    onValueChange={(val) => handleSelectChange("difficulty", val)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">1 - Easy</SelectItem>
                                        <SelectItem value="2">2 - Moderate</SelectItem>
                                        <SelectItem value="3">3 - Challenging</SelectItem>
                                        <SelectItem value="4">4 - Hard</SelectItem>
                                        <SelectItem value="5">5 - Extreme</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="max_participants">Max Participants</Label>
                                <div className="relative">
                                    <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="max_participants"
                                        name="max_participants"
                                        type="number"
                                        placeholder="e.g. 20"
                                        value={formData.max_participants}
                                        onChange={handleChange}
                                        className="pl-9"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="image_url">Image URL (Optional)</Label>
                                <div className="relative">
                                    <ImageIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="image_url"
                                        name="image_url"
                                        placeholder="https://..."
                                        value={formData.image_url}
                                        onChange={handleChange}
                                        className="pl-9"
                                    />
                                </div>
                            </div>
                        </div>

                        <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                            {submitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating Mission...
                                </>
                            ) : (
                                "Create Mission"
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
