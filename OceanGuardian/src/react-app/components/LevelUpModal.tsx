import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/react-app/components/ui/dialog";
import { Button } from "@/react-app/components/ui/button";

interface LevelUpModalProps {
    open: boolean;
    onClose: () => void;
    oldLevel: number;
    newLevel: number;
}

const LEVEL_PERKS: Record<number, { title: string; description: string; icon: string }> = {
    5: { title: "Regional Explorer", description: "Unlock regional leaderboards", icon: "🗺️" },
    10: { title: "Mission Creator", description: "Create private cleanup missions", icon: "🎯" },
    15: { title: "Advanced Analyst", description: "Access advanced map filters", icon: "🔬" },
    20: { title: "Coral Scientist", description: "Unlock AI coral analysis tools", icon: "🪸" },
    25: { title: "Ambassador Nominator", description: "Nominate new Ambassadors", icon: "🤝" },
    50: { title: "Marine Legend", description: "Lifetime Legend badge & all features", icon: "👑" },
};

export default function LevelUpModal({ open, onClose, oldLevel, newLevel }: LevelUpModalProps) {
    // Find perks unlocked in this level range
    const unlockedPerks = Object.entries(LEVEL_PERKS)
        .filter(([lvl]) => {
            const l = parseInt(lvl);
            return l > oldLevel && l <= newLevel;
        })
        .map(([, perk]) => perk);

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent showCloseButton={false} className="overflow-hidden">
                {/* Animated background shimmer */}
                <div className="absolute inset-0 -z-10 bg-gradient-to-br from-amber-400/20 via-yellow-300/10 to-orange-400/20 animate-pulse rounded-4xl" />
                <div className="absolute inset-0 -z-10 overflow-hidden rounded-4xl">
                    <div className="absolute -top-10 -left-10 h-32 w-32 rounded-full bg-yellow-400/20 blur-3xl animate-[float_4s_ease-in-out_infinite]" />
                    <div className="absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-amber-400/20 blur-3xl animate-[float_4s_ease-in-out_infinite_1s]" />
                </div>

                <DialogHeader className="text-center items-center">
                    {/* Celebration emoji */}
                    <div className="text-6xl mb-2 animate-[bounce_0.6s_ease-in-out]">
                        🎉
                    </div>
                    <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                        Level Up!
                    </DialogTitle>
                    <DialogDescription className="text-base">
                        You've reached a new level!
                    </DialogDescription>
                </DialogHeader>

                {/* Level transition */}
                <div className="flex items-center justify-center gap-4 py-4">
                    <div className="text-center">
                        <div className="text-3xl font-bold text-muted-foreground">{oldLevel}</div>
                        <div className="text-xs text-muted-foreground">Before</div>
                    </div>
                    <div className="text-2xl text-amber-500 animate-[pulse_1.5s_ease-in-out_infinite]">→</div>
                    <div className="text-center">
                        <div className="relative">
                            <div className="text-5xl font-extrabold text-amber-500 animate-[scaleIn_0.5s_ease-out]">{newLevel}</div>
                            <div className="absolute inset-0 text-5xl font-extrabold text-amber-400/30 blur-sm animate-[pulse_2s_ease-in-out_infinite]">{newLevel}</div>
                        </div>
                        <div className="text-xs font-medium text-amber-600">New Level</div>
                    </div>
                </div>

                {/* Unlocked perks */}
                {unlockedPerks.length > 0 && (
                    <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-center text-muted-foreground">🔓 New Perks Unlocked</h4>
                        {unlockedPerks.map((perk) => (
                            <div key={perk.title} className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
                                <span className="text-2xl">{perk.icon}</span>
                                <div>
                                    <p className="font-semibold text-sm">{perk.title}</p>
                                    <p className="text-xs text-muted-foreground">{perk.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <DialogFooter>
                    <Button onClick={onClose} className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold">
                        Continue 🚀
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
