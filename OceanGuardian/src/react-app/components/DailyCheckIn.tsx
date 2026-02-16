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
            <div className="neo-flat rounded-3xl p-8 text-center animate-in fade-in zoom-in duration-500 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-500/5 rounded-full -ml-16 -mt-16" />
                <div className="relative z-10 w-20 h-20 neo-pressed rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-10 h-10 text-emerald-500" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-1 relative z-10">Pledge Complete!</h3>
                <p className="text-muted-foreground text-sm mb-6 relative z-10 font-medium">You're plastic-free today. Keep it up!</p>

                <Button
                    variant="neomorph"
                    className="w-full h-12 text-emerald-600 font-bold uppercase tracking-widest relative z-10"
                    onClick={handleShare}
                >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Milestone
                </Button>
            </div>
        );
    }

    return (
        <div className="neo-flat rounded-3xl p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16" />
            <div className="relative z-10 w-20 h-20 neo-pressed rounded-full flex items-center justify-center mx-auto mb-4 ring-4 ring-primary/5">
                <PartyPopper className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-2xl font-extrabold text-foreground mb-2 relative z-10">Daily Pledge</h3>
            <p className="text-muted-foreground text-sm mb-8 relative z-10 italic font-medium">"I pledge to avoid single-use plastics today."</p>

            <Button
                variant="neomorph-primary"
                size="lg"
                className="w-full h-16 text-lg font-bold uppercase tracking-widest relative z-10"
                onClick={handleCheckIn}
                disabled={loading}
            >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "I Pledge to be Plastic-Free!"}
            </Button>
        </div>
    );
}
