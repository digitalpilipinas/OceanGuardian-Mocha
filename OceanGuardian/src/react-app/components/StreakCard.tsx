import { Flame, Snowflake } from "lucide-react";

interface StreakCardProps {
    streakDays: number;
    streakFreezes: number;
}

export default function StreakCard({ streakDays, streakFreezes }: StreakCardProps) {
    return (
        <div className="grid grid-cols-2 gap-4">
            {/* Streak Counter */}
            <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-xl p-4 flex items-center justify-between">
                <div>
                    <div className="text-3xl font-bold text-orange-400">{streakDays}</div>
                    <div className="text-xs text-orange-200/60 uppercase tracking-wider font-semibold">Current Streak</div>
                </div>
                <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center">
                    <Flame className="w-6 h-6 text-orange-400 fill-orange-500/20" />
                </div>
            </div>

            {/* Freeze Inventory */}
            <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl p-4 flex items-center justify-between">
                <div>
                    <div className="text-3xl font-bold text-blue-400">{streakFreezes}</div>
                    <div className="text-xs text-blue-200/60 uppercase tracking-wider font-semibold">Streak Freezes</div>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <Snowflake className="w-6 h-6 text-blue-400 fill-blue-500/20" />
                </div>
            </div>
        </div>
    );
}
