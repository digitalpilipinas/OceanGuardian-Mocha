import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { ArrowLeft, Award } from "lucide-react";

interface Lesson {
    id: number;
    title: string;
    content: string;
    xp_reward: number;
    isCompleted?: boolean; // fetched separately or computed
}

export default function LessonView() {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const [lesson, setLesson] = useState<Lesson | null>(null);
    const [loading, setLoading] = useState(true);
    const [completing, setCompleting] = useState(false);
    const [completeSuccess, setCompleteSuccess] = useState(false);
    const [xpEarned, setXpEarned] = useState(0);

    useEffect(() => {
        fetch(`/api/learning/lessons/${slug}`)
            .then((res) => {
                if (!res.ok) throw new Error("Lesson not found");
                return res.json();
            })
            .then((data) => setLesson(data))
            .catch((err) => {
                console.error(err);
                navigate("/learning/lessons"); // Redirect if invalid
            })
            .finally(() => setLoading(false));
    }, [slug, navigate]);

    const handleComplete = async () => {
        if (!lesson) return;
        setCompleting(true);
        try {
            const res = await fetch(`/api/learning/lessons/${lesson.id}/complete`, {
                method: "POST",
            });
            const data = await res.json();
            if (data.success) {
                setCompleteSuccess(true);
                setXpEarned(data.xpEarned);
            } else if (data.message === "Already completed") {
                // Handle case where user re-completes
                setCompleteSuccess(true);
                setXpEarned(0);
            }
        } catch (err) {
            console.error("Failed to complete lesson", err);
        } finally {
            setCompleting(false);
        }
    };

    if (loading) return <div className="p-12 text-center">Loading lesson...</div>;
    if (!lesson) return null;

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <Link to="/learning/lessons" className="inline-flex items-center text-gray-500 hover:text-blue-600 mb-6 transition-colors">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Lessons
            </Link>

            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-teal-500 to-emerald-600 p-8 text-white">
                    <h1 className="text-3xl font-bold mb-2">{lesson.title}</h1>
                    <div className="flex items-center space-x-4 mt-4">
                        <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
                            {lesson.xp_reward} XP Reward
                        </span>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 prose prose-lg max-w-none prose-headings:text-gray-900 prose-a:text-blue-600">
                    <ReactMarkdown>{lesson.content}</ReactMarkdown>
                </div>

                {/* Footer / Action */}
                <div className="p-8 bg-gray-50 border-t flex flex-col items-center">
                    {completeSuccess ? (
                        <div className="text-center animate-fade-in-up">
                            <div className="bg-green-100 p-4 rounded-full inline-flex items-center justify-center mb-4">
                                <Award className="h-10 w-10 text-green-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Lesson Completed!</h3>
                            <p className="text-gray-600 mb-6">
                                {xpEarned > 0
                                    ? `You earned ${xpEarned} XP for mastering this topic.`
                                    : "You have already completed this lesson."}
                            </p>
                            <Link to="/learning/lessons" className="px-6 py-3 bg-gray-900 text-white rounded-full font-semibold hover:bg-gray-800 transition-colors">
                                Continue Learning
                            </Link>
                        </div>
                    ) : (
                        <button
                            onClick={handleComplete}
                            disabled={completing}
                            className={`px-8 py-4 bg-teal-600 text-white text-lg font-bold rounded-full shadow-lg hover:bg-teal-700 hover:shadow-xl transition-all transform hover:-translate-y-1 ${completing ? "opacity-75 cursor-wait" : ""
                                }`}
                        >
                            {completing ? "Completing..." : "Complete Lesson & Earn XP"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
