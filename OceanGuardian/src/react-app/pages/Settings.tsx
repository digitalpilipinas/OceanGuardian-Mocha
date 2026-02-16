import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/react-app/components/ui/card";
import { Label } from "@/react-app/components/ui/label";
import { Input } from "@/react-app/components/ui/input";
import { Switch } from "@/react-app/components/ui/switch";
import { Button } from "@/react-app/components/ui/button";
import { useUserProfile } from "@/react-app/hooks/useUserProfile";
import { Loader2, Save, User, MessageSquare, MapPin } from "lucide-react";
import { UserProfile } from "@/shared/types";
import { useToast } from "@/react-app/components/ui/use-toast";

export default function Settings() {
    const { profile: user } = useUserProfile();
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
        <div className="container mx-auto px-4 py-14 max-w-4xl pb-32">
            <div className="flex items-center gap-6 mb-16">
                <div className="p-5 rounded-[2rem] bg-white/5 border border-white/10 shadow-inner">
                    <Save className="h-10 w-10 text-primary brightness-125" />
                </div>
                <div>
                    <h1 className="text-5xl font-black text-white tracking-tighter">Control <span className="text-primary brightness-125 italic">Panel</span></h1>
                    <p className="text-sm font-bold text-white/40 mt-2 italic">Configure your Guardian profile and privacy protocols</p>
                </div>
            </div>

            <div className="space-y-10">
                {/* Location Settings */}
                <Card variant="glass" className="border-white/10 !bg-black/60 shadow-2xl backdrop-blur-2xl rounded-[2.5rem] overflow-hidden">
                    <CardHeader className="p-10 pb-6">
                        <CardTitle className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                            <MapPin className="h-6 w-6 text-primary/60" /> Location Protocols
                        </CardTitle>
                        <CardDescription className="text-white/40 font-bold italic mt-2">
                            Set your deployment zone to join regional leaderboards.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-10 pt-0 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <Label htmlFor="country" className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 ml-2">Sovereign State</Label>
                                <Input
                                    id="country"
                                    value={formData.country}
                                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                    placeholder="e.g. Philippines"
                                    className="h-14 bg-white/5 border-white/10 rounded-2xl px-6 text-white font-bold placeholder:text-white/10 focus:bg-white/10 transition-all"
                                />
                            </div>
                            <div className="space-y-3">
                                <Label htmlFor="region" className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 ml-2">Deployment City</Label>
                                <Input
                                    id="region"
                                    value={formData.region}
                                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                                    placeholder="e.g. Manila"
                                    className="h-14 bg-white/5 border-white/10 rounded-2xl px-6 text-white font-bold placeholder:text-white/10 focus:bg-white/10 transition-all"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Privacy Settings */}
                <Card variant="glass" className="border-white/10 !bg-black/60 shadow-2xl backdrop-blur-2xl rounded-[2.5rem] overflow-hidden">
                    <CardHeader className="p-10 pb-6">
                        <CardTitle className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                            <User className="h-6 w-6 text-primary/60" /> Stealth & Visibility
                        </CardTitle>
                        <CardDescription className="text-white/40 font-bold italic mt-2">
                            Manage your digital footprint within the collective.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-10 pt-0 space-y-10">
                        <div className="flex items-center justify-between group">
                            <div className="space-y-1">
                                <Label className="text-lg font-black text-white tracking-tight">Active Transmissions</Label>
                                <p className="text-xs font-bold text-white/30 italic">
                                    Allow your profile to appear on public leaderboards.
                                </p>
                            </div>
                            <Switch
                                checked={formData.leaderboard_visible}
                                onCheckedChange={(checked) => setFormData({ ...formData, leaderboard_visible: checked })}
                                className="data-[state=checked]:bg-primary"
                            />
                        </div>
                        <div className="flex items-center justify-between group">
                            <div className="space-y-1">
                                <Label className="text-lg font-black text-white tracking-tight">Ghost Protocol</Label>
                                <p className="text-xs font-bold text-white/30 italic">
                                    Hide your identity on leaderboards (appear as "Anonymous").
                                </p>
                            </div>
                            <Switch
                                checked={formData.is_anonymous}
                                onCheckedChange={(checked) => setFormData({ ...formData, is_anonymous: checked })}
                                className="data-[state=checked]:bg-primary"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Notifications Settings */}
                <Card variant="glass" className="border-white/10 !bg-black/60 shadow-2xl backdrop-blur-2xl rounded-[2.5rem] overflow-hidden">
                    <CardHeader className="p-10 pb-6">
                        <CardTitle className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                            <MessageSquare className="h-6 w-6 text-primary/60" /> Data Alerts
                        </CardTitle>
                        <CardDescription className="text-white/40 font-bold italic mt-2">
                            Manage your real-time signal preferences.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-10 pt-0">
                        <div className="flex items-center justify-between group">
                            <div className="space-y-1">
                                <Label className="text-lg font-black text-white tracking-tight">System Notifications</Label>
                                <p className="text-xs font-bold text-white/30 italic">
                                    Receive alerts about mission priority and rewards.
                                </p>
                            </div>
                            <Switch
                                checked={formData.notifications_enabled}
                                onCheckedChange={(checked) => setFormData({ ...formData, notifications_enabled: checked })}
                                className="data-[state=checked]:bg-primary"
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end pt-10">
                    <Button onClick={handleSave} disabled={saving} className="w-full h-16 rounded-[2rem] bg-primary text-white font-black uppercase tracking-widest text-xs shadow-2xl shadow-primary/40 border-none transition-all hover:scale-[1.02] active:scale-95">
                        {saving ? (
                            <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                        ) : (
                            <Save className="mr-3 h-5 w-5" />
                        )}
                        Authorize Changes
                    </Button>
                </div>
            </div>
        </div>
    );
}
