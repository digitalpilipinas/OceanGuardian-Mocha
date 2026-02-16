import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/react-app/components/ui/card";
import { Label } from "@/react-app/components/ui/label";
import { Input } from "@/react-app/components/ui/input";
import { Switch } from "@/react-app/components/ui/switch";
import { Button } from "@/react-app/components/ui/button";
import { useAuth } from "@getmocha/users-service/react";
import { Loader2, Save } from "lucide-react";
import { UserProfile } from "@/shared/types";
import { useToast } from "@/react-app/components/ui/use-toast";

export default function Settings() {
    const { user } = useAuth();
    // const [profile, setProfile] = useState<UserProfile | null>(null); // Removed unused state
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        region: "",
        country: "",
        leaderboard_visible: true,
        is_anonymous: false,
        notifications_enabled: true
    });

    useEffect(() => {
        if (!user) return;

        const fetchProfile = async () => {
            try {
                const res = await fetch("/api/profiles/me");
                if (res.ok) {
                    const data: UserProfile = await res.json();
                    // setProfile(data);
                    setFormData({
                        region: data.region || "",
                        country: data.country || "",
                        leaderboard_visible: data.leaderboard_visible === 1,
                        is_anonymous: data.is_anonymous === 1,
                        notifications_enabled: data.notifications_enabled === 1
                    });
                }
            } catch (err) {
                console.error("Failed to load settings:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [user]);

    const { toast } = useToast();

    const handleSave = async () => {
        if (!user) return;
        setSaving(true);
        try {
            const body = {
                region: formData.region,
                country: formData.country,
                leaderboard_visible: formData.leaderboard_visible ? 1 : 0,
                is_anonymous: formData.is_anonymous ? 1 : 0,
                notifications_enabled: formData.notifications_enabled ? 1 : 0
            };

            const res = await fetch("/api/profiles/me", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                toast({ title: "Settings saved", description: "Your preferences have been updated." });
            } else {
                toast({ title: "Error", description: "Failed to save settings.", variant: "destructive" });
            }
        } catch (err) {
            console.error("Error saving settings:", err);
            toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <h1 className="text-3xl font-bold mb-8">Settings</h1>

            <div className="space-y-6">
                {/* Location Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle>Location</CardTitle>
                        <CardDescription>
                            Set your location to join regional leaderboards.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="country">Country</Label>
                            <Input
                                id="country"
                                value={formData.country}
                                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                placeholder="e.g. Philippines"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="region">Region / City</Label>
                            <Input
                                id="region"
                                value={formData.region}
                                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                                placeholder="e.g. Manila"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Privacy Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle>Privacy</CardTitle>
                        <CardDescription>
                            Manage how you appear to others.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-base">Show in Leaderboards</Label>
                                <p className="text-sm text-muted-foreground">
                                    Allow your profile to appear on public leaderboards.
                                </p>
                            </div>
                            <Switch
                                checked={formData.leaderboard_visible}
                                onCheckedChange={(checked) => setFormData({ ...formData, leaderboard_visible: checked })}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-base">Anonymous Mode</Label>
                                <p className="text-sm text-muted-foreground">
                                    Hide your name and avatar on leaderboards (you will appear as "Anonymous").
                                </p>
                            </div>
                            <Switch
                                checked={formData.is_anonymous}
                                onCheckedChange={(checked) => setFormData({ ...formData, is_anonymous: checked })}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Notifications Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle>Notifications</CardTitle>
                        <CardDescription>
                            Manage your notification preferences.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-base">Enable Notifications</Label>
                                <p className="text-sm text-muted-foreground">
                                    Receive alerts about mission updates and rewards.
                                </p>
                            </div>
                            <Switch
                                checked={formData.notifications_enabled}
                                onCheckedChange={(checked) => setFormData({ ...formData, notifications_enabled: checked })}
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto">
                        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {!saving && <Save className="mr-2 h-4 w-4" />}
                        Save Changes
                    </Button>
                </div>
            </div>
        </div>
    );
}
