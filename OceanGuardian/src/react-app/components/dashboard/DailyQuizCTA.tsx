import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Card, CardContent } from "@/react-app/components/ui/card";
import { Button } from "@/react-app/components/ui/button";
import { Brain, CheckCircle2, ArrowRight } from "lucide-react";
import { useAuth } from "@getmocha/users-service/react";

export default function DailyQuizCTA() {
    const { user } = useAuth();
    const [completed, setCompleted] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        // Check local storage or API for "completed today"
        // For now we check the stats API we built in learning.ts which returns last_quiz_date
        // But actually get /api/learning/quiz/daily returns `alreadyCompleted` flag.
        fetch("/api/learning/quiz/daily")
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (data && data.alreadyCompleted) {
                    setCompleted(true);
                }
            })
            .catch(() => { })
            .finally(() => setLoading(false));

    }, [user]);

    if (loading) return null; // Or skeleton

    return (
        <Card className={`border-none shadow-md overflow-hidden ${completed ? 'bg-green-50 dark:bg-green-950/20' : 'bg-gradient-to-br from-indigo-500 to-purple-600'}`}>
            <CardContent className="p-6">
                <div className="flex items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            {completed ? (
                                <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                            ) : (
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <Brain className="h-6 w-6 text-white" />
                                </div>
                            )}
                            <h3 className={`text-lg font-bold ${completed ? 'text-green-800 dark:text-green-300' : 'text-white'}`}>
                                {completed ? "Daily Quiz Completed!" : "Daily Ocean Quiz"}
                            </h3>
                        </div>
                        <p className={`text-sm ${completed ? 'text-green-700 dark:text-green-400' : 'text-indigo-100'}`}>
                            {completed ? "Great job! Come back tomorrow for more XP." : "Test your knowledge and earn 50 XP bonus!"}
                        </p>
                    </div>

                    {!completed && (
                        <Button size="sm" variant="secondary" className="whitespace-nowrap" asChild>
                            <Link to="/learning/quiz">
                                Start Quiz <ArrowRight className="ml-1 h-3 w-3" />
                            </Link>
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
