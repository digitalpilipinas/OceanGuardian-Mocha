
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
        <div className="mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-white drop-shadow-md">
                        Welcome back, {profile.username || "Guardian"}!
                    </h1>
                    <p className="text-blue-100/80 mt-1 text-lg">
                        Ready to continue your ocean conservation journey?
                    </p>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full">
                    <Award className="h-5 w-5 text-amber-400" />
                    <span className="font-bold text-white">Level {profile.level || 1}</span>
                </div>
            </div>

            <Card className="bg-gradient-to-r from-cyan-600 to-blue-700 border-none shadow-xl relative overflow-hidden">
                {/* Background decorative elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

                <CardContent className="p-6 relative z-10">
                    <div className="flex justify-between text-sm font-semibold mb-3 uppercase tracking-wider text-blue-100">
                        <span className="flex items-center gap-1.5">
                            <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                            {current} XP <span className="text-blue-200/70 font-normal normal-case ml-1">Current</span>
                        </span>
                        <span className="text-blue-200/70">{required - current} XP to next level</span>
                    </div>
                    <div className="bg-black/20 rounded-full p-1 backdrop-blur-sm">
                        <Progress value={progressPercent} className="h-3 rounded-full bg-white/10 [&>div]:bg-amber-400" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
