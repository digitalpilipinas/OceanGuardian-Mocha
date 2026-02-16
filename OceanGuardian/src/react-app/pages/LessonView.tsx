import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router";
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

    if (loading) return <div className="p-20 text-center text-white/20 font-black uppercase tracking-widest animate-pulse italic">Decrypting educational data...</div>;
    if (!lesson) return null;

    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <Link to="/learning/lessons" className="inline-flex items-center text-white/40 hover:text-primary mb-10 transition-all font-black uppercase tracking-widest text-[10px] group">
                <ArrowLeft className="h-4 w-4 mr-3 transition-transform group-hover:-translate-x-1" />
                Return to Directory
            </Link>

            <div className="bg-secondary/40 border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="bg-primary/20 p-12 border-b border-white/10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Award className="h-32 w-32 text-primary" />
                    </div>
                    <div className="relative z-10">
                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4">{lesson.title}</h1>
                        <div className="flex items-center gap-4">
                            <span className="bg-primary text-white px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20">
                                {lesson.xp_reward.toLocaleString()} XP Bounty
                            </span>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-12 prose prose-invert prose-lg max-w-none prose-headings:text-white prose-headings:font-black prose-headings:tracking-tight prose-p:text-white/70 prose-p:font-medium prose-p:leading-relaxed prose-strong:text-primary prose-a:text-primary prose-code:text-primary prose-pre:bg-black/60 prose-pre:border prose-pre:border-white/10 prose-pre:rounded-2xl">
                    <ReactMarkdown>{lesson.content}</ReactMarkdown>
                </div>

                {/* Footer / Action */}
                <div className="p-12 bg-white/5 border-t border-white/10">
                    {completeSuccess ? (
                        <div className="text-center animate-in zoom-in duration-500">
                            <div className="bg-primary/20 p-6 rounded-full inline-flex items-center justify-center mb-6 border border-primary/30 shadow-2xl shadow-primary/20">
                                <Award className="h-12 w-12 text-primary brightness-125" />
                            </div>
                            <h3 className="text-3xl font-black text-white tracking-tight mb-3">Protocol Synchronized</h3>
                            <p className="text-white/40 font-bold italic mb-10">
                                {xpEarned > 0
                                    ? `Transmission verified. ${xpEarned} XP has been added to your profile.`
                                    : "This data has already been synchronized with your profile."}
                            </p>
                            <Link to="/learning" className="px-10 py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/40 hover:scale-105 active:scale-95 transition-all inline-block">
                                Continue Research
                            </Link>
                        </div>
                    ) : (
                        <div className="flex justify-center">
                            <button
                                onClick={handleComplete}
                                disabled={completing}
                                className={`px-12 py-6 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-2xl shadow-primary/40 hover:scale-105 active:scale-95 transition-all ${completing ? "opacity-75 cursor-wait" : ""
                                    }`}
                            >
                                {completing ? "Verifying..." : "Synchronize Data & Claim XP"}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
