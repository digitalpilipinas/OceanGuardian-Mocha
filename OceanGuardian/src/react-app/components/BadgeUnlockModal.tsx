import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/react-app/components/ui/dialog";
import { Button } from "@/react-app/components/ui/button";
import { Badge } from "@/react-app/components/ui/badge";
import ImpactBadgeGenerator from "@/react-app/components/ImpactBadgeGenerator";
import { useAuth } from "@getmocha/users-service/react";
import type { UserProfile } from "@/shared/types";
import { Share2 } from "lucide-react";

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
    gradient: string;
    glow: string;
    badgeClass: string;
    label: string;
}> = {
    common: {
        gradient: "from-gray-300/20 via-slate-200/10 to-gray-400/20",
        glow: "bg-gray-400/20",
        badgeClass: "bg-gray-500 text-white",
        label: "Common",
    },
    uncommon: {
        gradient: "from-green-400/20 via-emerald-300/10 to-green-500/20",
        glow: "bg-green-400/20",
        badgeClass: "bg-green-500 text-white",
        label: "Uncommon",
    },
    rare: {
        gradient: "from-blue-400/20 via-cyan-300/10 to-blue-500/20",
        glow: "bg-blue-400/20",
        badgeClass: "bg-blue-500 text-white",
        label: "Rare",
    },
    epic: {
        gradient: "from-purple-400/20 via-violet-300/10 to-purple-500/20",
        glow: "bg-purple-400/20",
        badgeClass: "bg-purple-500 text-white",
        label: "Epic",
    },
    legendary: {
        gradient: "from-amber-400/20 via-yellow-300/10 to-amber-500/20",
        glow: "bg-amber-400/20",
        badgeClass: "bg-amber-500 text-white",
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
            // Fetch minimal profile if needed, or just use auth user info
            // Ideally we fetch full profile to get XP/Level etc for the generator
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
            <DialogContent showCloseButton={false} className="overflow-hidden sm:max-w-md">
                {/* Rarity-themed animated background */}
                <div className={`absolute inset-0 -z-10 bg-gradient-to-br ${theme.gradient} animate-pulse rounded-2xl`} />
                <div className="absolute inset-0 -z-10 overflow-hidden rounded-2xl">
                    <div className={`absolute -top-10 -left-10 h-40 w-40 rounded-full ${theme.glow} blur-3xl animate-[float_3s_ease-in-out_infinite]`} />
                    <div className={`absolute -bottom-10 -right-10 h-40 w-40 rounded-full ${theme.glow} blur-3xl animate-[float_3s_ease-in-out_infinite_1.5s]`} />
                </div>

                <DialogHeader className="text-center items-center">
                    <DialogTitle className="text-lg font-semibold text-muted-foreground">
                        Badge Unlocked!
                    </DialogTitle>
                </DialogHeader>

                {/* Badge icon with bounce animation */}
                <div className="flex flex-col items-center gap-4 py-4">
                    <div className="relative">
                        <div className="text-7xl animate-[bounceIn_0.6s_ease-out]">
                            {badge.icon}
                        </div>
                        {/* Shimmer ring */}
                        <div className="absolute inset-0 rounded-full border-2 border-current opacity-20 animate-[ping_2s_ease-in-out_infinite]" />
                    </div>
                    <div className="text-center space-y-2">
                        <h3 className="text-xl font-bold">{badge.name}</h3>
                        <DialogDescription className="text-base">
                            {badge.description}
                        </DialogDescription>
                        <div className="flex gap-2 justify-center">
                            <Badge className={theme.badgeClass}>
                                {theme.label}
                            </Badge>
                            <Badge variant="outline" className="capitalize">
                                {badge.category}
                            </Badge>
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex-col gap-2 sm:gap-0">
                    <div className="flex gap-2 w-full">
                        <Button
                            variant="outline"
                            onClick={() => setShowGenerator(true)}
                            className="flex-1 gap-2"
                            disabled={!userProfile}
                        >
                            <Share2 className="w-4 h-4" />
                            Share
                        </Button>
                        <Button onClick={onClose} className="flex-1 font-semibold">
                            Awesome! 🎊
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
