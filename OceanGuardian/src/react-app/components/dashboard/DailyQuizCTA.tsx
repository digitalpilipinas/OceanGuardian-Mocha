import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Brain, CheckCircle2, ArrowRight } from "lucide-react";
import { useUserProfile } from "@/react-app/hooks/useUserProfile";

export default function DailyQuizCTA() {
    const { profile: user } = useUserProfile();
    const [completed, setCompleted] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        // Check local storage or API for "completed today"
        // For now we check the stats API we built in learning.ts which returns last_quiz_date
        // But actually get /api/learning/quiz/daily returns `alreadyCompleted` flag.
        fetch("/api/learning/quiz/daily")
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (data && data.alreadyCompleted) {
                    setCompleted(true);
                }
            })
            .catch(() => { })
            .finally(() => setLoading(false));

    }, [user]);

    if (loading) return null; // Or skeleton

    return (
        <div className={cn(
            "p-8 rounded-[2.5rem] border shadow-2xl relative overflow-hidden group transition-all duration-500",
            completed
                ? "bg-secondary/60 border-white/5"
                : "bg-gradient-to-br from-primary via-primary to-accent border-white/10"
        )}>
            {/* Background decorative elements */}
            {!completed && (
                <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-50 pointer-events-none" />
            )}

            <div className="relative z-10 flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <div className={cn(
                        "p-3 rounded-2xl",
                        completed ? "bg-primary/20" : "bg-white/20"
                    )}>
                        {completed ? (
                            <CheckCircle2 className="h-6 w-6 text-primary" />
                        ) : (
                            <Brain className="h-6 w-6 text-white animate-pulse" />
                        )}
                    </div>
                    {!completed && (
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/60 bg-white/10 px-3 py-1 rounded-full border border-white/10">
                            +50 XP Protocol
                        </span>
                    )}
                </div>

                <div className="space-y-2">
                    <h3 className={cn(
                        "text-2xl font-black tracking-tighter uppercase italic",
                        completed ? "text-white" : "text-white"
                    )}>
                        {completed ? "Intel Secured" : "Daily Intelligence"}
                    </h3>
                    <p className={cn(
                        "text-[10px] font-black uppercase tracking-widest leading-relaxed",
                        completed ? "text-white/20" : "text-white/60"
                    )}>
                        {completed
                            ? "Data transmission complete for this sector. Return in 24h."
                            : "Test your marine knowledge and earn critical XP bonus!"
                        }
                    </p>
                </div>

                {!completed && (
                    <Link
                        to="/learning/quiz"
                        className="inline-flex items-center justify-center w-full px-8 py-4 bg-white text-primary rounded-2xl font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-all shadow-xl group/btn"
                    >
                        Initiate Quiz
                        <ArrowRight className="ml-3 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                )}
            </div>
        </div>
    );
}

function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ');
}
