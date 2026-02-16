
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
                    <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
                        Welcome back, <span className="text-primary brightness-150 drop-shadow-sm">{profile.username || "Guardian"}</span>!
                    </h1>
                    <p className="text-white/60 mt-2 text-lg font-bold tracking-wide">
                        Your ocean conservation journey continues today.
                    </p>
                </div>
                <div className="flex items-center gap-3 px-6 py-4 rounded-3xl glass-liquid border-white/5 bg-white/5">
                    <Award className="h-7 w-7 text-primary" />
                    <span className="font-black text-2xl text-white tracking-tighter">Level {profile.level || 1}</span>
                </div>
            </div>

            <Card variant="glass" className="relative overflow-hidden group">
                {/* Background decorative elements - Tuned down blurs */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary/5 rounded-full blur-[60px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

                <CardContent className="p-10 relative z-10">
                    <div className="flex justify-between items-end text-sm font-black mb-5 uppercase tracking-[0.2em]">
                        <span className="flex items-center gap-3 text-white">
                            <Star className="h-6 w-6 fill-primary text-primary" />
                            <span className="text-3xl tracking-tighter">{current.toLocaleString()}</span>
                            <span className="text-white/40 text-xs mt-1">XP EARNED</span>
                        </span>
                        <span className="text-white/50 text-xs font-bold bg-white/5 px-4 py-2 rounded-full border border-white/5">
                            {(required - current).toLocaleString()} XP TO LEVEL {(profile.level || 1) + 1}
                        </span>
                    </div>
                    <div className="bg-black/20 rounded-full p-1 border border-white/5 overflow-hidden">
                        <Progress value={progressPercent} className="h-3 rounded-full bg-transparent overflow-hidden" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
