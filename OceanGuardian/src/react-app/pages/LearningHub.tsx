import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
                    Ocean Learning Hub
                </h1>
                <p className="mt-4 text-xl text-gray-600">
                    Expand your knowledge, earn XP, and become a true Ocean Guardian.
                </p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="bg-white rounded-xl shadow-md p-6 flex items-center space-x-4 border-l-4 border-blue-500">
                    <div className="p-3 bg-blue-100 rounded-full">
                        <Brain className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Daily Streak</p>
                        <p className="text-2xl font-bold text-gray-900">
                            {stats?.streak_days || 0} Days
                        </p>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-md p-6 flex items-center space-x-4 border-l-4 border-purple-500">
                    <div className="p-3 bg-purple-100 rounded-full">
                        <Trophy className="h-8 w-8 text-purple-600" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Total XP Earned</p>
                        <p className="text-2xl font-bold text-gray-900">
                            {stats?.total_xp_earned || 0} XP
                        </p>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-md p-6 flex items-center space-x-4 border-l-4 border-teal-500">
                    <div className="p-3 bg-teal-100 rounded-full">
                        <BookOpen className="h-8 w-8 text-teal-600" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Quizzes Completed</p>
                        <p className="text-2xl font-bold text-gray-900">
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
                    className="group relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 opacity-90 group-hover:scale-105 transition-transform duration-500" />
                    <div className="relative p-8 h-full flex flex-col items-center text-center text-white">
                        <div className="p-4 bg-white/20 rounded-full mb-6 backdrop-blur-sm">
                            <Brain className="h-10 w-10 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">Daily Quiz</h3>
                        <p className="text-blue-100 mb-6">
                            Test your knowledge with 5 new questions every day. Earn XP and keep your streak alive!
                        </p>
                        <span className="mt-auto inline-flex items-center px-4 py-2 bg-white text-blue-600 rounded-full font-semibold text-sm group-hover:bg-blue-50 transition-colors">
                            Play Now
                        </span>
                    </div>
                </Link>

                {/* Deep Dive Lessons Card */}
                <Link
                    to="/learning/lessons"
                    className="group relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-teal-400 to-emerald-600 opacity-90 group-hover:scale-105 transition-transform duration-500" />
                    <div className="relative p-8 h-full flex flex-col items-center text-center text-white">
                        <div className="p-4 bg-white/20 rounded-full mb-6 backdrop-blur-sm">
                            <BookOpen className="h-10 w-10 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">Deep Dive Lessons</h3>
                        <p className="text-teal-100 mb-6">
                            Master complex topics with in-depth lessons. Unlock new content as you level up.
                        </p>
                        <span className="mt-auto inline-flex items-center px-4 py-2 bg-white text-teal-600 rounded-full font-semibold text-sm group-hover:bg-teal-50 transition-colors">
                            Start Learning
                        </span>
                    </div>
                </Link>

                {/* Fact Library Card */}
                <Link
                    to="/learning/facts"
                    className="group relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-pink-500 opacity-90 group-hover:scale-105 transition-transform duration-500" />
                    <div className="relative p-8 h-full flex flex-col items-center text-center text-white">
                        <div className="p-4 bg-white/20 rounded-full mb-6 backdrop-blur-sm">
                            <Lightbulb className="h-10 w-10 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">Fact Library</h3>
                        <p className="text-orange-100 mb-6">
                            Explore a vast database of amazing ocean facts. Search by category or discover something random.
                        </p>
                        <span className="mt-auto inline-flex items-center px-4 py-2 bg-white text-orange-600 rounded-full font-semibold text-sm group-hover:bg-orange-50 transition-colors">
                            Browse Facts
                        </span>
                    </div>
                </Link>
            </div>
        </div>
    );
}
