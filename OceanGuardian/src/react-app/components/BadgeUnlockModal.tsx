import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/react-app/components/ui/dialog";
import { Button } from "@/react-app/components/ui/button";
import { Badge } from "@/react-app/components/ui/badge";
import ImpactBadgeGenerator from "@/react-app/components/ImpactBadgeGenerator";
import { useAuth } from "@getmocha/users-service/react";
import type { UserProfile } from "@/shared/types";
import { Share2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface BadgeUnlockModalProps {
    open: boolean;
    onClose: () => void;
    badge: {
        name: string;
        description: string;
        icon: string;
        rarity: string;
        category: string;
    };
}

const RARITY_THEMES: Record<string, {
    colors: string;
    glow: string;
    badgeClass: string;
    label: string;
}> = {
    common: {
        colors: "from-slate-300 to-slate-500",
        glow: "bg-slate-400/30",
        badgeClass: "bg-slate-500 text-white border-none",
        label: "Common",
    },
    uncommon: {
        colors: "from-emerald-400 to-teal-600",
        glow: "bg-emerald-400/30",
        badgeClass: "bg-emerald-500 text-white border-none",
        label: "Uncommon",
    },
    rare: {
        colors: "from-blue-400 to-indigo-600",
        glow: "bg-blue-400/30",
        badgeClass: "bg-blue-500 text-white border-none",
        label: "Rare",
    },
    epic: {
        colors: "from-purple-400 to-fuchsia-600",
        glow: "bg-purple-400/30",
        badgeClass: "bg-purple-500 text-white border-none",
        label: "Epic",
    },
    legendary: {
        colors: "from-amber-400 to-orange-600",
        glow: "bg-amber-400/30",
        badgeClass: "bg-amber-500 text-white border-none",
        label: "Legendary",
    },
};

export default function BadgeUnlockModal({ open, onClose, badge }: BadgeUnlockModalProps) {
    const theme = RARITY_THEMES[badge.rarity] || RARITY_THEMES.common;
    const [showGenerator, setShowGenerator] = useState(false);
    const { user } = useAuth();
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

    useEffect(() => {
        if (open && user) {
            fetch("/api/profiles/me")
                .then(res => res.ok ? res.json() : null)
                .then(data => setUserProfile(data))
                .catch(err => console.error("Failed to fetch profile for badge modal", err));
        }
    }, [open, user]);

    if (showGenerator && userProfile) {
        return (
            <ImpactBadgeGenerator
                badge={badge}
                userProfile={userProfile}
                onClose={() => setShowGenerator(false)}
            />
        );
    }

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent showCloseButton={false} className="overflow-visible sm:max-w-md bg-transparent border-none shadow-none">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0, rotate: -5 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="relative"
                >
                    {/* Background Radial Glow */}
                    <div className={`absolute inset-[-100px] -z-20 ${theme.glow} blur-[120px] rounded-full animate-pulse`} />

                    <div className="neo-flat rounded-[2.5rem] p-8 relative overflow-hidden bg-card/90 backdrop-blur-xl">
                        {/* Decorative floating elements */}
                        <motion.div
                            animate={{ y: [0, -15, 0], x: [0, 10, 0] }}
                            transition={{ duration: 5, repeat: Infinity }}
                            className={`absolute top-10 right-10 w-2 h-2 rounded-full bg-gradient-to-r ${theme.colors}`}
                        />
                        <motion.div
                            animate={{ y: [0, 15, 0], x: [0, -10, 0] }}
                            transition={{ duration: 7, repeat: Infinity }}
                            className={`absolute bottom-20 left-10 w-3 h-3 rounded-full bg-gradient-to-r ${theme.colors} opacity-50`}
                        />

                        <DialogHeader className="text-center items-center mb-6">
                            <motion.div
                                initial={{ y: -20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="flex items-center gap-2 px-4 py-1.5 neo-pressed rounded-full mb-4"
                            >
                                <Sparkles className="w-4 h-4 text-primary" />
                                <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">New Achievement</span>
                            </motion.div>
                            <DialogTitle className="text-3xl font-extrabold text-foreground">
                                Badge Unlocked!
                            </DialogTitle>
                        </DialogHeader>

                        <div className="flex flex-col items-center gap-6 py-4">
                            <div className="relative">
                                {/* Rays background */}
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                    className={`absolute inset-[-40px] -z-10 opacity-20 bg-[conic-gradient(from_0deg,transparent,white,transparent)] rounded-full`}
                                />

                                <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: "spring", damping: 12, stiffness: 100, delay: 0.3 }}
                                    className="text-8xl relative z-10"
                                >
                                    {badge.icon}
                                </motion.div>

                                {/* Orbiting rings */}
                                <div className={`absolute inset-[-10px] rounded-full border-2 border-primary/20 animate-spin-slow`} />
                                <div className={`absolute inset-[-20px] rounded-full border border-primary/10 animate-reverse-spin-slow`} />
                            </div>

                            <div className="text-center space-y-4">
                                <div>
                                    <h3 className="text-2xl font-black bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                                        {badge.name}
                                    </h3>
                                    <div className="flex gap-2 justify-center mt-3">
                                        <Badge className={`${theme.badgeClass} px-4 py-1 rounded-full font-bold shadow-lg`}>
                                            {theme.label}
                                        </Badge>
                                        <Badge variant="neomorph" className="capitalize px-4 py-1 rounded-full font-bold">
                                            {badge.category}
                                        </Badge>
                                    </div>
                                </div>
                                <DialogDescription className="text-lg text-muted-foreground font-medium leading-relaxed">
                                    {badge.description}
                                </DialogDescription>
                            </div>
                        </div>

                        <DialogFooter className="flex-col gap-4 mt-8">
                            <div className="flex gap-4 w-full">
                                <Button
                                    variant="neomorph"
                                    onClick={() => setShowGenerator(true)}
                                    className="flex-1 h-14 gap-2 font-bold uppercase tracking-widest text-primary"
                                    disabled={!userProfile}
                                >
                                    <Share2 className="w-5 h-5" />
                                    Share
                                </Button>
                                <Button onClick={onClose} variant="neomorph-primary" className="flex-1 h-14 font-black uppercase tracking-widest text-lg">
                                    Awesome!
                                </Button>
                            </div>
                        </DialogFooter>
                    </div>
                </motion.div>
            </DialogContent>
        </Dialog>
    );
}
