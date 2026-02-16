import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/react-app/components/ui/dialog";
import { Button } from "@/react-app/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Map as MapIcon, Target, Search, Waves, Handshake, Crown, Sparkles } from "lucide-react";

interface LevelUpModalProps {
    open: boolean;
    onClose: () => void;
    oldLevel: number;
    newLevel: number;
}

const LEVEL_PERKS: Record<number, { title: string; description: string; icon: any }> = {
    5: { title: "Regional Explorer", description: "Unlock regional leaderboards", icon: MapIcon },
    10: { title: "Mission Creator", description: "Create private cleanup missions", icon: Target },
    15: { title: "Advanced Analyst", description: "Access advanced map filters", icon: Search },
    20: { title: "Coral Scientist", description: "Unlock AI coral analysis tools", icon: Waves },
    25: { title: "Ambassador Nominator", description: "Nominate new Ambassadors", icon: Handshake },
    50: { title: "Marine Legend", description: "Lifetime Legend badge & all features", icon: Crown },
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
            <DialogContent showCloseButton={false} className="bg-transparent border-none shadow-none max-w-sm sm:max-w-md overflow-visible">
                <motion.div
                    initial={{ y: 50, opacity: 0, scale: 0.9 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: 50, opacity: 0, scale: 0.9 }}
                    className="relative"
                >
                    {/* Ambient Glow */}
                    <div className="absolute inset-[-50px] -z-10 bg-amber-400/20 blur-[100px] rounded-full animate-pulse" />

                    <div className="neo-flat rounded-[3rem] p-10 relative overflow-hidden bg-card/90 backdrop-blur-xl">
                        {/* Shimmer overlay */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />

                        <DialogHeader className="text-center items-center mb-8">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: [0, 1.2, 1] }}
                                transition={{ duration: 0.5 }}
                                className="mb-4 p-4 rounded-3xl neo-flat"
                            >
                                <Sparkles className="w-16 h-16 text-amber-500" />
                            </motion.div>
                            <DialogTitle className="text-4xl font-black bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">
                                Level Up!
                            </DialogTitle>
                            <DialogDescription className="text-lg font-bold text-muted-foreground/80 mt-2">
                                Your journey expands!
                            </DialogDescription>
                        </DialogHeader>

                        {/* Level transition visualization */}
                        <div className="flex items-center justify-between gap-6 py-8 px-4 mb-8 neo-pressed rounded-[2rem]">
                            <div className="text-center">
                                <div className="text-4xl font-black text-muted-foreground/50">{oldLevel}</div>
                                <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground/40 mt-1">Previous</div>
                            </div>

                            <motion.div
                                animate={{ x: [0, 5, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                className="text-amber-500"
                            >
                                <TrendingUp className="w-8 h-8" />
                            </motion.div>

                            <div className="text-center">
                                <div className="relative">
                                    <motion.div
                                        initial={{ scale: 0.5 }}
                                        animate={{ scale: 1 }}
                                        className="text-6xl font-black text-amber-500"
                                    >
                                        {newLevel}
                                    </motion.div>
                                    <div className="absolute inset-0 text-6xl font-black text-amber-400/40 blur-md animate-pulse">{newLevel}</div>
                                </div>
                                <div className="text-xs font-bold uppercase tracking-widest text-amber-600/60 mt-1">Reached</div>
                            </div>
                        </div>

                        {/* Unlocked perks section */}
                        <AnimatePresence>
                            {unlockedPerks.length > 0 && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    className="space-y-4 mb-10"
                                >
                                    <h4 className="text-xs font-black text-center text-muted-foreground uppercase tracking-widest mb-4">New Powers Unlocked</h4>
                                    <div className="grid gap-3">
                                        {unlockedPerks.map((perk, i) => (
                                            <motion.div
                                                key={perk.title}
                                                initial={{ x: -20, opacity: 0 }}
                                                animate={{ x: 0, opacity: 1 }}
                                                transition={{ delay: 0.1 * i }}
                                                className="flex items-center gap-4 p-4 rounded-2xl neo-flat group hover:bg-amber-500/5 transition-colors"
                                            >
                                                <div className="neo-pressed p-3 rounded-xl group-hover:scale-110 transition-transform">
                                                    <perk.icon className="w-8 h-8 text-amber-500" />
                                                </div>
                                                <div>
                                                    <p className="font-black text-sm text-foreground">{perk.title}</p>
                                                    <p className="text-xs text-muted-foreground font-medium">{perk.description}</p>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <DialogFooter className="mt-4">
                            <Button
                                onClick={onClose}
                                variant="neomorph-primary"
                                className="w-full h-16 text-xl font-black uppercase tracking-[0.2em] shadow-amber-500/20"
                            >
                                Continue
                            </Button>
                        </DialogFooter>
                    </div>
                </motion.div>
            </DialogContent>
        </Dialog>
    );
}
