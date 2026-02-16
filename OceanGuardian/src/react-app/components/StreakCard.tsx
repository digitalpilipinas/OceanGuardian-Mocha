import { Flame, Snowflake } from "lucide-react";
import { motion } from "framer-motion";

interface StreakCardProps {
    streakDays: number;
    streakFreezes: number;
}

export default function StreakCard({ streakDays, streakFreezes }: StreakCardProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {/* Streak Counter */}
            <motion.div
                whileHover={{ y: -5 }}
                className="neo-flat rounded-3xl p-6 flex items-center justify-between group overflow-hidden relative"
            >
                <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
                <div className="relative z-10">
                    <div className="text-4xl font-extrabold text-orange-500">{streakDays}</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-widest font-bold mt-1">Current Streak</div>
                </div>
                <div className="relative z-10 w-16 h-16 rounded-2xl neo-pressed flex items-center justify-center">
                    <Flame className="w-8 h-8 text-orange-500 fill-orange-500/10 animate-pulse" />
                </div>
            </motion.div>

            {/* Freeze Inventory */}
            <motion.div
                whileHover={{ y: -5 }}
                className="neo-flat rounded-3xl p-6 flex items-center justify-between group overflow-hidden relative"
            >
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
                <div className="relative z-10">
                    <div className="text-4xl font-extrabold text-blue-500">{streakFreezes}</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-widest font-bold mt-1">Freezes Left</div>
                </div>
                <div className="relative z-10 w-16 h-16 rounded-2xl neo-pressed flex items-center justify-center">
                    <Snowflake className="w-8 h-8 text-blue-500 fill-blue-500/10" />
                </div>
            </motion.div>
        </div>
    );
}
