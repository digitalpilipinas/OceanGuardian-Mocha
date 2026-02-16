import { useState, useEffect } from "react";
import { Link } from "react-router";
import { BookOpen, Brain, Lightbulb, Trophy } from "lucide-react";

export default function LearningHub() {
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        fetch("/api/learning/stats")
            .then((res) => res.json())
            .then((data) => setStats(data))
            .catch((err) => console.error("Failed to fetch stats", err));
    }, []);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center mb-16 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10" />
                <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-4 uppercase">
                    Ocean <span className="text-accent italic">Learning Hub</span>
                </h1>
                <p className="text-xl text-white/50 font-black italic max-w-2xl mx-auto uppercase tracking-widest text-sm">
                    Expand your mission intelligence, earn XP, and become a true Ocean Guardian.
                </p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                <div className="bg-secondary/60 rounded-3xl p-8 flex items-center space-x-6 border border-white/5 shadow-2xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="p-4 bg-primary/10 rounded-2xl relative z-10 transition-transform group-hover:scale-110">
                        <Brain className="h-8 w-8 text-primary" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.2em]">Daily Streak</p>
                        <p className="text-3xl font-black text-white tracking-tighter">
                            {stats?.streak_days || 0} <span className="text-primary italic">Days</span>
                        </p>
                    </div>
                </div>
                <div className="bg-secondary/60 rounded-3xl p-8 flex items-center space-x-6 border border-white/5 shadow-2xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="p-4 bg-accent/10 rounded-2xl relative z-10 transition-transform group-hover:scale-110">
                        <Trophy className="h-8 w-8 text-accent" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.2em]">Total XP Earned</p>
                        <p className="text-3xl font-black text-white tracking-tighter">
                            {stats?.total_xp_earned || 0} <span className="text-accent italic">XP</span>
                        </p>
                    </div>
                </div>
                <div className="bg-secondary/60 rounded-3xl p-8 flex items-center space-x-6 border border-white/5 shadow-2xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="p-4 bg-blue-400/10 rounded-2xl relative z-10 transition-transform group-hover:scale-110">
                        <BookOpen className="h-8 w-8 text-blue-400" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.2em]">Quizzes Completed</p>
                        <p className="text-3xl font-black text-white tracking-tighter">
                            {stats?.quizzes_completed || 0}
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Daily Quiz Card */}
                <Link
                    to="/learning/quiz"
                    className="group relative bg-secondary/80 rounded-3xl border border-white/5 shadow-2xl hover:shadow-primary/20 transition-all duration-500 overflow-hidden h-80 flex flex-col"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-blue-900/60 transition-transform duration-700 group-hover:scale-110" />
                    <div className="relative p-8 h-full flex flex-col items-center text-center text-white z-10">
                        <div className="p-4 bg-white/10 rounded-full mb-6 backdrop-blur-md ring-1 ring-white/20 transition-transform group-hover:rotate-12">
                            <Brain className="h-10 w-10 text-white" />
                        </div>
                        <h3 className="text-2xl font-black mb-2 uppercase tracking-tight">Daily Quiz</h3>
                        <p className="text-white/60 font-medium text-sm mb-6 max-w-[200px]">
                            Test your knowledge with 5 new questions every day. Earn XP and keep your streak alive!
                        </p>
                        <span className="mt-auto inline-flex items-center px-6 py-2 bg-white text-primary rounded-full font-black text-[10px] uppercase tracking-widest group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-xl">
                            Transmit Answer
                        </span>
                    </div>
                </Link>

                {/* Deep Dive Lessons Card - Switched from Teal to Coral/Blue */}
                <Link
                    to="/learning/lessons"
                    className="group relative bg-secondary/80 rounded-3xl border border-white/5 shadow-2xl hover:shadow-accent/20 transition-all duration-500 overflow-hidden h-80 flex flex-col"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-accent/30 to-purple-900/60 transition-transform duration-700 group-hover:scale-110" />
                    <div className="relative p-8 h-full flex flex-col items-center text-center text-white z-10">
                        <div className="p-4 bg-white/10 rounded-full mb-6 backdrop-blur-md ring-1 ring-white/20 transition-transform group-hover:-rotate-12">
                            <BookOpen className="h-10 w-10 text-white" />
                        </div>
                        <h3 className="text-2xl font-black mb-2 uppercase tracking-tight">Deep Dive</h3>
                        <p className="text-white/60 font-medium text-sm mb-6 max-w-[200px]">
                            Master complex topics with in-depth lessons. Unlock new content as you level up.
                        </p>
                        <span className="mt-auto inline-flex items-center px-6 py-2 bg-white text-accent rounded-full font-black text-[10px] uppercase tracking-widest group-hover:bg-accent group-hover:text-white transition-all duration-300 shadow-xl">
                            Initiate Learning
                        </span>
                    </div>
                </Link>

                {/* Fact Library Card */}
                <Link
                    to="/learning/facts"
                    className="group relative bg-secondary/80 rounded-3xl border border-white/5 shadow-2xl hover:shadow-blue-400/20 transition-all duration-500 overflow-hidden h-80 flex flex-col"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400/30 to-slate-900/60 transition-transform duration-700 group-hover:scale-110" />
                    <div className="relative p-8 h-full flex flex-col items-center text-center text-white z-10">
                        <div className="p-4 bg-white/10 rounded-full mb-6 backdrop-blur-md ring-1 ring-white/20 transition-transform group-hover:scale-110">
                            <Lightbulb className="h-10 w-10 text-white" />
                        </div>
                        <h3 className="text-2xl font-black mb-2 uppercase tracking-tight">Intelligence</h3>
                        <p className="text-white/60 font-medium text-sm mb-6 max-w-[200px]">
                            Explore a vast database of amazing ocean facts. Search by category or discover something random.
                        </p>
                        <span className="mt-auto inline-flex items-center px-6 py-2 bg-white text-blue-600 rounded-full font-black text-[10px] uppercase tracking-widest group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-xl">
                            Browse Data
                        </span>
                    </div>
                </Link>
            </div>
        </div>
    );
}
