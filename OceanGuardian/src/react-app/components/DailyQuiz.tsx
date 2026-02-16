import { useState, useEffect } from "react";
import { Check, X, Trophy, ArrowRight, Flame, Brain, Award } from "lucide-react";
import { Link } from "react-router";

interface Question {
    id: number;
    question: string;
    options: string[];
    category: string;
    difficulty: string;
}

interface Result {
    questionId: number;
    isCorrect: boolean;
    correctAnswer: number;
    explanation: string;
}

export default function DailyQuiz() {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [answers, setAnswers] = useState<{ questionId: number; selectedOptionIndex: number }[]>([]);
    const [results, setResults] = useState<Result[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [xpEarned, setXpEarned] = useState(0);
    const [streak, setStreak] = useState(0);
    const [alreadyCompleted, setAlreadyCompleted] = useState(false);
    const [streakBonus, setStreakBonus] = useState(0);

    useEffect(() => {
        fetchQuiz();
    }, []);

    const fetchQuiz = async () => {
        try {
            const res = await fetch("/api/learning/quiz/daily");
            const data = await res.json();
            if (data.questions) {
                setQuestions(data.questions);
                setAlreadyCompleted(data.alreadyCompleted);
            }
        } catch (err) {
            console.error("Failed to load quiz", err);
        } finally {
            setLoading(false);
        }
    };

    const handleOptionSelect = (index: number) => {
        if (selectedOption !== null) return; // Prevent changing answer
        setSelectedOption(index);

        // Auto-advance after short delay or manual button?
        // Let's do manual "Next" button for better UX
    };

    const handleNext = () => {
        if (selectedOption === null) return;

        const newAnswers = [...answers, {
            questionId: questions[currentQuestionIndex].id,
            selectedOptionIndex: selectedOption
        }];
        setAnswers(newAnswers);
        setSelectedOption(null);

        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            submitQuiz(newAnswers);
        }
    };

    const submitQuiz = async (finalAnswers: typeof answers) => {
        setSubmitting(true);
        try {
            const res = await fetch("/api/learning/quiz/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ answers: finalAnswers }),
            });
            const data = await res.json();
            setResults(data.results);
            setXpEarned(data.earnedXp);
            setStreak(data.streak);
            setStreakBonus(data.streakBonus);
        } catch (err) {
            console.error("Failed to submit quiz", err);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-white/40 font-black uppercase tracking-widest animate-pulse">Syncing satellite data...</div>;

    if (alreadyCompleted) {
        return (
            <div className="max-w-md mx-auto mt-16 p-12 bg-secondary/60 border border-white/5 rounded-[3rem] shadow-2xl text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
                <div className="bg-primary/20 p-6 rounded-full w-24 h-24 mx-auto flex items-center justify-center mb-10 border border-primary/20 ring-4 ring-primary/10">
                    <Check className="h-12 w-12 text-primary brightness-125 animate-bounce" />
                </div>
                <h2 className="text-4xl font-black text-white tracking-tighter mb-4 uppercase">Frequency Secure</h2>
                <p className="text-white/40 font-black italic uppercase tracking-widest text-[10px] mb-12 leading-relaxed">
                    You've already transmitted today's data. Return in 24h for the next mission protocol.
                </p>
                <Link
                    to="/learning"
                    className="inline-flex items-center justify-center w-full px-10 py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-primary/80 transition-all shadow-xl shadow-primary/20 active:scale-95 group"
                >
                    <Award className="h-4 w-4 mr-3 transition-transform group-hover:rotate-12" />
                    Back to Hub
                </Link>
            </div>
        );
    }

    if (results) {
        const correctCount = results.filter(r => r.isCorrect).length;
        return (
            <div className="max-w-2xl mx-auto mt-8 px-4">
                <div className="bg-secondary/60 border border-white/5 rounded-[3.5rem] overflow-hidden shadow-2xl relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
                    <div className="bg-primary/10 p-12 text-center border-b border-white/5 relative z-10">
                        <Trophy className="h-24 w-24 mx-auto mb-8 text-accent animate-pulse drop-shadow-[0_0_25px_rgba(255,100,50,0.4)]" />
                        <h2 className="text-5xl font-black text-white tracking-tighter mb-2 uppercase">Sync complete</h2>
                        <p className="text-primary brightness-125 text-xl font-black uppercase tracking-[0.3em] italic">
                            Sync Rate: {correctCount}<span className="text-white/20">/</span>{questions.length}
                        </p>
                    </div>

                    <div className="p-12 relative z-10">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mb-12">
                            <div className="text-center group p-6 bg-white/5 rounded-[2rem] border border-white/5 hover:border-primary/20 transition-all">
                                <p className="text-[10px] text-white/30 font-black uppercase tracking-widest mb-2">XP Gain</p>
                                <p className="text-4xl font-black text-primary tracking-tighter italic">+{xpEarned}</p>
                            </div>
                            <div className="text-center group p-6 bg-white/5 rounded-[2rem] border border-white/5 hover:border-orange-500/20 transition-all">
                                <p className="text-[10px] text-white/30 font-black uppercase tracking-widest mb-2">Active Streak</p>
                                <div className="flex items-center justify-center gap-2">
                                    <p className="text-4xl font-black text-orange-500 tracking-tighter italic">{streak}</p>
                                    <Flame className="h-6 w-6 text-orange-500 fill-current" />
                                </div>
                            </div>
                            {streakBonus > 0 && (
                                <div className="text-center group p-6 bg-accent/10 rounded-[2rem] border border-accent/20 transition-all col-span-2 md:col-span-1">
                                    <p className="text-[10px] text-accent/50 font-black uppercase tracking-widest mb-2">Bonus Protocol</p>
                                    <p className="text-4xl font-black text-accent tracking-tighter italic">+{streakBonus}</p>
                                </div>
                            )}
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] border-b border-white/5 pb-6">Protocol Breakdown</h3>
                            {results.map((result, idx) => (
                                <div key={idx} className={cn(
                                    "p-8 rounded-[2rem] flex items-start gap-6 transition-all duration-500 group",
                                    result.isCorrect ? 'bg-primary/5 border border-primary/10 hover:border-primary/20' : 'bg-red-500/5 border border-red-500/10 hover:border-red-500/20'
                                )}>
                                    <div className={cn(
                                        "mt-1 p-2 rounded-xl transition-all",
                                        result.isCorrect ? 'bg-primary/20 text-primary shadow-lg shadow-primary/10' : 'bg-red-500/20 text-red-500 shadow-lg shadow-red-500/10'
                                    )}>
                                        {result.isCorrect ? <Check className="h-5 w-5" /> : <X className="h-5 w-5" />}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-black text-white text-lg mb-2 uppercase tracking-tight group-hover:text-primary transition-colors">
                                            {questions.find(q => q.id === result.questionId)?.question}
                                        </p>
                                        <p className="text-[13px] text-white/40 italic font-medium leading-relaxed">
                                            {result.explanation}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-16 flex justify-center">
                            <Link
                                to="/learning"
                                className="px-16 py-6 bg-white text-primary rounded-[2rem] font-black uppercase tracking-[0.3em] text-[10px] hover:scale-105 transition-all shadow-2xl shadow-primary/20 active:scale-95"
                            >
                                Re-engage Hub
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];

    return (
        <div className="max-w-3xl mx-auto mt-12 px-4">
            {/* Progress Bar */}
            <div className="mb-12">
                <div className="flex justify-between items-end mb-6 px-4">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-primary mb-2">Intelligence Sector</p>
                        <span className="text-3xl font-black text-white tracking-tighter uppercase italic">
                            Signal {currentQuestionIndex + 1}<span className="text-white/20 ml-2">of {questions.length}</span>
                        </span>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent italic bg-accent/10 px-4 py-2 rounded-full ring-1 ring-accent/20">
                        {questions[currentQuestionIndex].category}
                    </span>
                </div>
                <div className="h-4 bg-white/5 rounded-full overflow-hidden border border-white/5 shadow-inner p-1">
                    <div
                        className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-1000 ease-out shadow-[0_0_25px_rgba(3,169,244,0.6)]"
                        style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                    />
                </div>
            </div>

            <div className="bg-secondary/60 border border-white/5 rounded-[3.5rem] p-12 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                    <Brain className="h-40 w-40 text-primary" />
                </div>
                <h2 className="text-2xl md:text-4xl font-black text-white tracking-tighter leading-tight mb-12 relative z-10 italic">
                    "{currentQuestion.question}"
                </h2>

                <div className="space-y-4 relative z-10">
                    {currentQuestion.options.map((option, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleOptionSelect(idx)}
                            className={cn(
                                "w-full text-left p-8 rounded-3xl border transition-all duration-500 group/opt relative overflow-hidden",
                                selectedOption === idx
                                    ? "border-primary bg-primary shadow-2xl shadow-primary/20 translate-x-3 text-white"
                                    : "border-white/5 bg-white/5 hover:bg-white/10 text-white/40"
                            )}
                        >
                            <div className="flex items-center">
                                <div className={cn(
                                    "w-10 h-10 rounded-xl border-2 mr-6 flex items-center justify-center transition-all font-black text-[10px]",
                                    selectedOption === idx
                                        ? "border-white bg-white text-primary"
                                        : "border-white/10 text-white/20 group-hover/opt:border-white/30 group-hover/opt:text-white/60"
                                )}>
                                    {String.fromCharCode(65 + idx)}
                                </div>
                                <span className="text-base md:text-lg font-black tracking-tight uppercase leading-snug">{option}</span>
                            </div>
                        </button>
                    ))}
                </div>

                <div className="mt-16 flex justify-end">
                    <button
                        onClick={handleNext}
                        disabled={selectedOption === null || submitting}
                        className={cn(
                            "inline-flex items-center px-12 py-6 rounded-[2rem] font-black uppercase tracking-[0.4em] text-[10px] transition-all shadow-2xl",
                            selectedOption === null
                                ? "bg-white/5 text-white/20 border border-white/5 cursor-not-allowed"
                                : "bg-white text-primary hover:bg-primary hover:text-white shadow-primary/20 active:scale-95 group-hover:translate-x-1"
                        )}
                    >
                        {submitting ? "Transmitting..." : (
                            <>
                                {currentQuestionIndex === questions.length - 1 ? "End Protocol" : "Secure Signal"}
                                <ArrowRight className="ml-4 h-5 w-5 animate-pulse" />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ');
}
