import React, { useState, useEffect } from "react";
import { Check, X, Trophy, ArrowRight, Home } from "lucide-react";
import { Link } from "react-router-dom";

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

    if (loading) return <div className="p-8 text-center">Loading quiz...</div>;

    if (alreadyCompleted) {
        return (
            <div className="max-w-md mx-auto mt-16 p-8 bg-white rounded-2xl shadow-lg text-center">
                <div className="bg-green-100 p-4 rounded-full w-20 h-20 mx-auto flex items-center justify-center mb-6">
                    <Check className="h-10 w-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold mb-4">Quiz Completed!</h2>
                <p className="text-gray-600 mb-8">
                    You've already taken today's quiz. Come back tomorrow for new questions and to keep your streak alive!
                </p>
                <Link
                    to="/learning"
                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-colors"
                >
                    <Home className="mr-2 h-5 w-5" />
                    Back to Learning Hub
                </Link>
            </div>
        );
    }

    if (results) {
        const correctCount = results.filter(r => r.isCorrect).length;
        return (
            <div className="max-w-2xl mx-auto mt-8 p-6">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="bg-blue-600 p-8 text-center text-white">
                        <Trophy className="h-16 w-16 mx-auto mb-4 text-yellow-300" />
                        <h2 className="text-3xl font-bold mb-2">Quiz Complete!</h2>
                        <p className="text-blue-100 text-lg">
                            You scored {correctCount}/{questions.length}
                        </p>
                    </div>

                    <div className="p-8">
                        <div className="flex justify-center space-x-8 mb-8">
                            <div className="text-center">
                                <p className="text-sm text-gray-500 font-medium">XP Earned</p>
                                <p className="text-3xl font-bold text-blue-600">+{xpEarned}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-sm text-gray-500 font-medium">Streak</p>
                                <div className="flex items-center justify-center space-x-1">
                                    <p className="text-3xl font-bold text-orange-500">{streak}</p>
                                    <span className="text-xl">🔥</span>
                                </div>
                            </div>
                            {streakBonus > 0 && (
                                <div className="text-center">
                                    <p className="text-sm text-gray-500 font-medium">Streak Bonus</p>
                                    <p className="text-3xl font-bold text-purple-600">+{streakBonus}</p>
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-semibold text-gray-900 border-b pb-2">Result Breakdown</h3>
                            {results.map((result, idx) => (
                                <div key={idx} className={`p-4 rounded-lg flex items-start space-x-3 ${result.isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
                                    <div className={`mt-0.5 p-1 rounded-full ${result.isCorrect ? 'bg-green-200' : 'bg-red-200'}`}>
                                        {result.isCorrect ? <Check className="h-4 w-4 text-green-700" /> : <X className="h-4 w-4 text-red-700" />}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 mb-1">{questions.find(q => q.id === result.questionId)?.question}</p>
                                        <p className="text-sm text-gray-600">{result.explanation}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 flex justify-center">
                            <Link
                                to="/learning"
                                className="px-8 py-3 bg-gray-900 text-white rounded-full font-semibold hover:bg-gray-800 transition-colors"
                            >
                                Back to Dashboard
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];

    return (
        <div className="max-w-2xl mx-auto mt-8 px-4">
            {/* Progress Bar */}
            <div className="mb-6">
                <div className="flex justify-between text-sm font-medium text-gray-500 mb-2">
                    <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
                    <span>{questions[currentQuestionIndex].category}</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-blue-600 transition-all duration-300 ease-out"
                        style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                    />
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                    {currentQuestion.question}
                </h2>

                <div className="space-y-3">
                    {currentQuestion.options.map((option, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleOptionSelect(idx)}
                            className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${selectedOption === idx
                                    ? "border-blue-500 bg-blue-50 text-blue-700 font-medium"
                                    : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                                }`}
                        >
                            <div className="flex items-center">
                                <div className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center ${selectedOption === idx ? "border-blue-500 bg-blue-500" : "border-gray-300"
                                    }`}>
                                    {selectedOption === idx && <div className="w-2 h-2 rounded-full bg-white" />}
                                </div>
                                {option}
                            </div>
                        </button>
                    ))}
                </div>

                <div className="mt-8 flex justify-end">
                    <button
                        onClick={handleNext}
                        disabled={selectedOption === null || submitting}
                        className={`inline-flex items-center px-6 py-3 rounded-full font-semibold transition-all ${selectedOption === null
                                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                : "bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg"
                            }`}
                    >
                        {submitting ? "Submitting..." : (
                            <>
                                {currentQuestionIndex === questions.length - 1 ? "Finish Quiz" : "Next Question"}
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
