import { useState, useEffect } from "react";
import { BookOpen, ArrowRight, Lock, CheckCircle, Trophy } from "lucide-react";
import { Link } from "react-router";

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

    if (loading) return (
        <div className="flex items-center justify-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="mb-16 text-center relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-primary/10 rounded-full blur-3xl -z-10" />
                <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-4 uppercase">
                    Ocean <span className="text-accent brightness-125 italic">Learning Modules</span>
                </h1>
                <p className="text-white/40 text-sm font-black max-w-2xl mx-auto uppercase tracking-[0.3em] italic">
                    Master the ocean's mysteries. Complete advanced protocols to earn XP.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {lessons.map((lesson) => (
                    <div
                        key={lesson.id}
                        className={cn(
                            "group relative bg-secondary/60 rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden transition-all duration-500 hover:scale-[1.02] flex flex-col",
                            lesson.isLocked ? "opacity-60 grayscale blur-[1px]" : ""
                        )}
                    >
                        {/* Cover Image */}
                        <div className="h-56 bg-slate-900 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent z-10" />
                            {lesson.cover_image ? (
                                <img
                                    src={lesson.cover_image}
                                    alt={lesson.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary">
                                    <BookOpen className="h-16 w-16 opacity-40 transition-transform group-hover:scale-110" />
                                </div>
                            )}

                            {lesson.isLocked && (
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm z-20">
                                    <Lock className="h-10 w-10 text-white/50" />
                                </div>
                            )}

                            {lesson.isCompleted && (
                                <div className="absolute top-6 right-6 bg-accent text-white px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest flex items-center shadow-xl z-20 shadow-accent/20">
                                    <CheckCircle className="h-3.5 w-3.5 mr-2" />
                                    SYNCED
                                </div>
                            )}
                        </div>

                        <div className="p-8 flex flex-col flex-1">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center bg-primary/10 px-3 py-1 rounded-full ring-1 ring-primary/20">
                                    <Trophy className="h-3 w-3 mr-1.5" />
                                    {lesson.xp_reward} XP
                                </span>
                            </div>

                            <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight group-hover:text-primary transition-colors">{lesson.title}</h3>
                            <p className="text-white/40 text-[13px] mb-8 font-medium line-clamp-2 leading-relaxed italic">{lesson.description}</p>

                            <div className="mt-auto">
                                {lesson.isLocked ? (
                                    <div className="w-full py-4 bg-white/5 rounded-2xl text-center text-white/30 font-black text-[10px] uppercase tracking-[0.2em] border border-white/5">
                                        Protocol Locked
                                    </div>
                                ) : (
                                    <Link
                                        to={`/learning/lessons/${lesson.slug}`}
                                        className="inline-flex items-center justify-center w-full py-4 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-primary/80 transition-all shadow-xl shadow-primary/20 active:scale-95 group/btn"
                                    >
                                        Initiate Module
                                        <ArrowRight className="h-3.5 w-3.5 ml-2 transition-transform group-hover/btn:translate-x-1" />
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

// Simple CN helper since I might not have it loaded in this specific file if I moved things
function cn(...classes: string[]) {
    return classes.filter(Boolean).join(" ");
}
