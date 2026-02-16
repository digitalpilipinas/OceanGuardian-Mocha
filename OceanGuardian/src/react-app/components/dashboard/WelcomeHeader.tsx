import { useUserProfile } from "@/react-app/hooks/useUserProfile";
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
                    <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter leading-tight uppercase">
                        Welcome back, <span className="text-accent italic">{profile.username || "Guardian"}</span>
                    </h1>
                    <p className="text-white/40 mt-2 text-sm font-black uppercase tracking-[0.3em] italic">
                        Your ocean conservation journey continues today.
                    </p>
                </div>
                <div className="flex items-center gap-3 px-8 py-4 rounded-[1.5rem] bg-secondary/80 border border-white/5 shadow-2xl group">
                    <Award className="h-8 w-8 text-accent group-hover:scale-110 transition-transform" />
                    <span className="font-black text-3xl text-white tracking-tighter italic">Lvl {profile.level || 1}</span>
                </div>
            </div>

            <div className="bg-secondary/40 border border-white/10 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden group">
                {/* Background decorative elements */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:bg-primary/20 transition-colors" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/5 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

                <div className="relative z-10">
                    <div className="flex justify-between items-end text-sm font-black mb-6 uppercase tracking-[0.3em]">
                        <span className="flex items-center gap-4 text-white">
                            <Star className="h-7 w-7 fill-accent text-accent animate-pulse" />
                            <span className="text-4xl tracking-tighter italic">{current.toLocaleString()}</span>
                            <span className="text-white/20 text-[10px] mt-1">XP Points</span>
                        </span>
                        <span className="text-white/40 text-[10px] font-black bg-white/5 px-4 py-2 rounded-full border border-white/5 uppercase tracking-widest">
                            {(required - current).toLocaleString()} XP TO LEVEL {(profile.level || 1) + 1}
                        </span>
                    </div>
                    <div className="bg-black/40 rounded-full h-4 border border-white/5 overflow-hidden shadow-inner p-1">
                        <div
                            className="h-full bg-gradient-to-r from-primary via-accent to-primary rounded-full transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(255,100,50,0.3)]"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
