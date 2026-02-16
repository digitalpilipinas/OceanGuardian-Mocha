
import { useUserProfile } from "@/react-app/hooks/useUserProfile";
import { Progress } from "@/react-app/components/ui/progress";
import { Card, CardContent } from "@/react-app/components/ui/card";
import { xpProgressInLevel } from "@/shared/types";
import { Award, Star } from "lucide-react";

export default function WelcomeHeader() {
    const { profile } = useUserProfile();


    if (!profile) return null;

    const { current, required } = xpProgressInLevel(profile.xp || 0, profile.level || 1);
    const progressPercent = Math.min(100, (current / required) * 100);

    return (
        <div className="mb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl md:text-5xl font-extrabold text-foreground tracking-tight">
                        Welcome back, <span className="text-primary">{profile.username || "Guardian"}</span>!
                    </h1>
                    <p className="text-muted-foreground mt-2 text-lg font-medium">
                        Your ocean conservation journey continues today.
                    </p>
                </div>
                <div className="flex items-center gap-3 px-6 py-3 rounded-2xl neo-flat border border-primary/20 bg-primary/5">
                    <Award className="h-6 w-6 text-primary" />
                    <span className="font-bold text-xl text-foreground">Level {profile.level || 1}</span>
                </div>
            </div>

            <Card variant="glass" className="relative overflow-hidden group">
                {/* Background decorative elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:bg-primary/20 transition-all duration-1000" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2 pointer-events-none group-hover:bg-secondary/20 transition-all duration-1000" />

                <CardContent className="p-8 relative z-10">
                    <div className="flex justify-between items-center text-sm font-bold mb-4 uppercase tracking-widest text-primary/80">
                        <span className="flex items-center gap-2">
                            <Star className="h-5 w-5 fill-primary text-primary" />
                            {current} XP
                        </span>
                        <span className="text-muted-foreground">{required - current} XP to Rank UP</span>
                    </div>
                    <div className="neo-pressed rounded-full p-1.5 overflow-hidden">
                        <Progress value={progressPercent} className="h-4 rounded-full bg-transparent overflow-hidden" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
