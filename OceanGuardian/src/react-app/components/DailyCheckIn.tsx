import { useState } from "react";
import { CheckCircle, Share2, Loader2, PartyPopper } from "lucide-react";
import { Button } from "@/react-app/components/ui/button";

interface DailyCheckInProps {
    checkedIn: boolean;
    onCheckIn: () => Promise<void>;
    streakDays: number;
}

export default function DailyCheckIn({ checkedIn, onCheckIn, streakDays }: DailyCheckInProps) {
    const [loading, setLoading] = useState(false);

    const handleCheckIn = async () => {
        setLoading(true);
        try {
            await onCheckIn();
        } finally {
            setLoading(false);
        }
    };

    const handleShare = async () => {
        const text = `I'm on a ${streakDays}-day Plastic-Free Streak on OceanGuardian! Join me in protecting our oceans. 🌊🔥`;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Plastic-Free Streak',
                    text: text,
                    url: window.location.origin,
                });
            } catch (err) {
                console.error("Share failed", err);
            }
        } else {
            // Fallback: copy to clipboard
            await navigator.clipboard.writeText(text);
            alert("Copied directly to clipboard!");
        }
    };

    if (checkedIn) {
        return (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 text-center animate-in fade-in zoom-in duration-500">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold text-emerald-100 mb-1">Pledge Complete!</h3>
                <p className="text-emerald-200/60 text-sm mb-4">You're plastic-free today. Keep it up!</p>

                <Button
                    variant="outline"
                    className="w-full border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20"
                    onClick={handleShare}
                >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Milestone
                </Button>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-xl p-6 text-center">
            <div className="w-16 h-16 bg-indigo-500/30 rounded-full flex items-center justify-center mx-auto mb-3 ring-4 ring-indigo-500/10">
                <PartyPopper className="w-8 h-8 text-indigo-300" />
            </div>
            <h3 className="text-xl font-bold text-white mb-1">Daily Pledge</h3>
            <p className="text-slate-300 text-sm mb-6">"I pledge to avoid single-use plastics today."</p>

            <Button
                size="lg"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-6 text-lg shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
                onClick={handleCheckIn}
                disabled={loading}
            >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "I Pledge to be Plastic-Free!"}
            </Button>
        </div>
    );
}
