import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from "react";
import LevelUpModal from "@/react-app/components/LevelUpModal";
import BadgeUnlockModal from "@/react-app/components/BadgeUnlockModal";

interface BadgeInfo {
    name: string;
    description: string;
    icon: string;
    rarity: string;
    category: string;
}

type GamificationNotification =
    | { type: "level_up"; oldLevel: number; newLevel: number }
    | { type: "badge"; badge: BadgeInfo };

interface GamificationContextValue {
    triggerLevelUp: (oldLevel: number, newLevel: number) => void;
    triggerBadgeUnlock: (badge: BadgeInfo) => void;
}

const GamificationContext = createContext<GamificationContextValue | null>(null);

export function useGamification() {
    const ctx = useContext(GamificationContext);
    if (!ctx) {
        throw new Error("useGamification must be used within a GamificationProvider");
    }
    return ctx;
}

export function GamificationProvider({ children }: { children: ReactNode }) {
    const queueRef = useRef<GamificationNotification[]>([]);
    const [current, setCurrent] = useState<GamificationNotification | null>(null);

    const processNext = useCallback(() => {
        const next = queueRef.current.shift();
        if (next) {
            setCurrent(next);
        } else {
            setCurrent(null);
        }
    }, []);

    const enqueue = useCallback((notification: GamificationNotification) => {
        if (!current && queueRef.current.length === 0) {
            // No items pending, show immediately
            setCurrent(notification);
        } else {
            queueRef.current.push(notification);
        }
    }, [current]);

    const handleClose = useCallback(() => {
        // Show next in queue or clear
        processNext();
    }, [processNext]);

    const triggerLevelUp = useCallback(
        (oldLevel: number, newLevel: number) => {
            enqueue({ type: "level_up", oldLevel, newLevel });
        },
        [enqueue],
    );

    const triggerBadgeUnlock = useCallback(
        (badge: BadgeInfo) => {
            enqueue({ type: "badge", badge });
        },
        [enqueue],
    );

    return (
        <GamificationContext.Provider value={{ triggerLevelUp, triggerBadgeUnlock }}>
            {children}

            {/* Level-up modal */}
            {current?.type === "level_up" && (
                <LevelUpModal
                    open
                    onClose={handleClose}
                    oldLevel={current.oldLevel}
                    newLevel={current.newLevel}
                />
            )}

            {/* Badge unlock modal */}
            {current?.type === "badge" && (
                <BadgeUnlockModal
                    open
                    onClose={handleClose}
                    badge={current.badge}
                />
            )}
        </GamificationContext.Provider>
    );
}
