import { useState, useEffect } from "react";
import { BookOpen, ArrowRight, Lock, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

// Since I don't have a full LessonView yet, I'll inline a simple view or just list component here first.
// Let's create the LIST component here, and a separate View if needed, or combine.
// For now, this will be the Lessons LIST.

interface Lesson {
    id: number;
    title: string;
    slug: string;
    description: string;
    unlock_level: number;
    xp_reward: number;
    cover_image?: string;
    isCompleted: boolean;
    isLocked: boolean;
}

export default function DeepDiveLessons() {
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/learning/lessons")
            .then(res => res.json())
            .then(data => setLessons(data.lessons))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="p-12 text-center">Loading lessons...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-10">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Deep Dive Lessons</h1>
                <p className="text-gray-600">
                    Master the ocean's mysteries. Complete lessons to earn XP and badges.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {lessons.map((lesson) => (
                    <div
                        key={lesson.id}
                        className={`relative bg-white rounded-2xl shadow-md overflow-hidden transition-all hover:shadow-lg flex flex-col ${lesson.isLocked ? "opacity-75 grayscale" : ""
                            }`}
                    >
                        {/* Cover Image Placeholder */}
                        <div className="h-48 bg-gray-200 relative">
                            {lesson.cover_image ? (
                                <img src={lesson.cover_image} alt={lesson.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-teal-100 text-teal-600">
                                    <BookOpen className="h-12 w-12" />
                                </div>
                            )}
                            {lesson.isLocked && (
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                    <div className="bg-white/90 px-4 py-2 rounded-full flex items-center shadow-lg">
                                        <Lock className="h-4 w-4 mr-2" />
                                        <span className="font-semibold text-sm">Unlocks at Level {lesson.unlock_level}</span>
                                    </div>
                                </div>
                            )}
                            {lesson.isCompleted && (
                                <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center shadow-md">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    COMPLETED
                                </div>
                            )}
                        </div>

                        <div className="p-6 flex-1 flex flex-col">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{lesson.title}</h3>
                            <p className="text-gray-500 text-sm mb-4 flex-1 line-clamp-3">
                                {lesson.description}
                            </p>

                            <div className="flex items-center justify-between mt-4">
                                <span className="text-xs font-semibold px-2 py-1 bg-yellow-100 text-yellow-700 rounded">
                                    {lesson.xp_reward} XP
                                </span>

                                {lesson.isLocked ? (
                                    <button disabled className="px-4 py-2 bg-gray-100 text-gray-400 rounded-lg text-sm font-medium cursor-not-allowed">
                                        Locked
                                    </button>
                                ) : (
                                    <Link
                                        to={`/learning/lessons/${lesson.slug}`}
                                        className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors"
                                    >
                                        Start Lesson
                                        <ArrowRight className="ml-1 h-4 w-4" />
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
