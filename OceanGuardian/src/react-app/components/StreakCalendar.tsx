import { useMemo } from "react";
import { Check, Snowflake, X, Minus } from "lucide-react";
import { cn } from "@/react-app/lib/utils";

interface StreakLog {
    activity_date: string;
    type: "check_in" | "freeze" | "restore";
}

interface StreakCalendarProps {
    history: StreakLog[];
}

export default function StreakCalendar({ history }: StreakCalendarProps) {
    const calendarDays = useMemo(() => {
        const days = [];
        const today = new Date();
        const historyMap = new Map(history.map(h => [h.activity_date, h.type]));

        // Generate last 30 days (including today)
        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split("T")[0];
            const type = historyMap.get(dateStr);

            days.push({
                date: dateStr,
                dayOfMonth: date.getDate(),
                type: type || (i === 0 ? "future" : "missed"), // Today is "future" until checked in? No, today is "missed" if not checked in technically, but we treat it as different state usually.
                isToday: i === 0,
            });
        }
        return days;
    }, [history]);

    return (
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <h3 className="text-sm font-medium text-slate-300 mb-3">Last 30 Days</h3>

            <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((day) => {
                    let statusColor = "bg-slate-800/50 text-slate-600 border-slate-700/50";
                    let Icon = Minus;

                    if (day.type === "check_in") {
                        statusColor = "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
                        Icon = Check;
                    } else if (day.type === "freeze") {
                        statusColor = "bg-blue-500/20 text-blue-400 border-blue-500/30";
                        Icon = Snowflake;
                    } else if (day.type === "missed" && !day.isToday) {
                        statusColor = "bg-red-500/10 text-red-400/50 border-red-500/20";
                        Icon = X;
                    } else if (day.isToday && !day.type) {
                        // Today, pending checkin
                        statusColor = "bg-slate-800 text-slate-500 border-slate-700 border-dashed animate-pulse";
                        Icon = Minus;
                    }

                    return (
                        <div
                            key={day.date}
                            className={cn(
                                "aspect-square rounded-lg border flex flex-col items-center justify-center relative",
                                statusColor
                            )}
                            title={`${day.date}: ${day.type || "pending"}`}
                        >
                            <span className="text-[10px] absolute top-1 right-1 opacity-50">{day.dayOfMonth}</span>
                            <Icon className="w-4 h-4" />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
