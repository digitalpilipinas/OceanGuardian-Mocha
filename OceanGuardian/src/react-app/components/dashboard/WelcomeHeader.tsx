import { useEffect, useState } from "react";
import { useAuth } from "@getmocha/users-service/react";
import { Progress } from "@/react-app/components/ui/progress";
import { Card, CardContent } from "@/react-app/components/ui/card";
import { xpProgressInLevel, type UserProfile } from "@/shared/types";
import { Award, Star } from "lucide-react";

export default function WelcomeHeader() {
    const { user } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);

    useEffect(() => {
        if (user) {
            fetch("/api/profiles/me")
                .then((res) => (res.ok ? res.json() : null))
                .then(setProfile)
                .catch(() => { });
        }
    }, [user]);

    if (!user || !profile) return null;

    const { current, required } = xpProgressInLevel(profile.xp || 0, profile.level || 1);
    const progressPercent = Math.min(100, (current / required) * 100);

    return (
        <div className="mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                        Welcome back, {profile.username || "Guardian"}!
                    </h1>
                    <p className="text-muted-foreground mt-1 text-lg">
                        Ready to continue your ocean conservation journey?
                    </p>
                </div>
                <div className="flex items-center gap-3 neo-flat px-6 py-2 rounded-full">
                    <Award className="h-6 w-6 text-primary" />
                    <span className="font-bold text-primary text-lg">Level {profile.level || 1}</span>
                </div>
            </div>

            <Card variant="neomorph" className="p-1">
                <CardContent className="p-4 md:p-6">
                    <div className="flex justify-between text-sm font-bold mb-3 uppercase tracking-wider text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                            {current} XP
                        </span>
                        <span>{required} XP to next level</span>
                    </div>
                    <div className="p-1 neo-pressed rounded-full">
                        <Progress value={progressPercent} className="h-4 rounded-full bg-transparent" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
