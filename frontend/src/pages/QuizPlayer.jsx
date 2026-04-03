import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import BorderGlow from '../components/animations/BorderGlow';
import { useNotification } from '../context/NotificationContext';

const QuizPlayer = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showNotification } = useNotification();
    const [quiz, setQuiz] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [loading, setLoading] = useState(true);

    const fetchQuiz = useCallback(async () => {
        try {
            const res = await axios.get(`/api/quizzes/${id}`);
            setQuiz(res.data);
            setTimeLeft((res.data.timeLimit || 10) * 60);
        } catch (err) {
            console.error(err);
            navigate('/explore');
        } finally {
            setLoading(false);
        }
    }, [id, navigate]);

    useEffect(() => {
        fetchQuiz();
    }, [fetchQuiz]);

    const submitQuiz = useCallback(async () => {
        if (!quiz) return;
        const formattedAnswers = quiz.questions.map((q, index) => ({
            questionId: q._id,
            userAnswer: answers[index] || '',
            isCorrect: answers[index] === q.correctAnswer
        }));

        const correctCount = formattedAnswers.filter(a => a.isCorrect).length;
        const score = correctCount * (quiz.marksPerQuestion || 1);
        const accuracy = (correctCount / quiz.questions.length) * 100;

        try {
            const res = await axios.post('/api/attempts', {
                quizId: id,
                answers: formattedAnswers,
                score,
                accuracy,
                timeTaken: (quiz.timeLimit * 60) - timeLeft
            });
            navigate(`/results/${res.data._id}`);
        } catch (err) {
            console.error(err);
            showNotification('Neural uplink failed: Submission incomplete. Re-attempting connection...', 'error');
        }
    }, [quiz, answers, timeLeft, id, navigate]);

    useEffect(() => {
        if (timeLeft <= 0 && !loading && quiz) {
            submitQuiz();
            return;
        }
        const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [timeLeft, loading, quiz, submitQuiz]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-surface">
            <div className="relative w-20 h-20">
                <div className="absolute inset-0 editorial-gradient rounded-full animate-ping opacity-20"></div>
                <div className="relative w-full h-full border-4 border-white/5 border-t-primary rounded-full animate-spin"></div>
            </div>
        </div>
    );

    const formatTime = (seconds) => {
        const min = Math.floor(seconds / 60);
        const sec = seconds % 60;
        return `${min}:${sec < 10 ? '0' : ''}${sec}`;
    };

    const question = quiz?.questions[currentQuestion];

    return (
        <div className="min-h-screen bg-surface pt-24 sm:pt-28 pb-12 sm:pb-20 px-6 sm:px-8 lg:px-24 flex flex-col lg:flex-row gap-10 sm:gap-16 overflow-x-hidden">

            {/* Assessment Core */}
            <div className="flex-1 space-y-12">
                <BorderGlow borderRadius={48} backgroundColor="rgba(10, 10, 12, 0.4)" colors={['#c084fc', '#f472b6', '#38bdf8']} glowIntensity={1}>
                    <header className="p-6 sm:p-8 md:p-10 flex flex-col md:flex-row justify-between items-center gap-6 md:gap-10 h-full">
                        <div className="space-y-2 sm:space-y-4 text-center md:text-left w-full md:w-auto">
                            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center justify-center md:justify-start gap-2">
                                <p className="text-primary font-headline font-black tracking-[0.5em] text-[10px] sm:text-xs md:text-sm uppercase mb-3">Quiz Protocol</p>
                            </motion.div>
                            <h2 className="text-xl sm:text-2xl md:text-4xl font-black font-headline tracking-tighter text-on-surface leading-none uppercase truncate max-w-full md:max-w-md">{quiz?.title}</h2>
                            <div className="flex items-center justify-center md:justify-start gap-3 sm:gap-6 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                                <span>Q {currentQuestion + 1} of {quiz?.questions.length}</span>
                                <div className="w-1 h-1 bg-white/10 rounded-full"></div>
                                <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[14px] sm:text-[16px] text-primary">timer</span> {formatTime(timeLeft)}</span>
                            </div>
                        </div>
                        <button
                            onClick={submitQuiz}
                            className="w-full md:w-auto px-6 sm:px-10 py-3.5 sm:py-5 group editorial-gradient text-white rounded-xl sm:rounded-2xl font-headline font-black text-xs sm:text-sm tracking-widest uppercase flex items-center justify-center gap-2 sm:gap-3 shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all text-center"
                        >
                            Submit Quiz <span className="material-symbols-outlined text-lg sm:text-xl group-hover:rotate-12 transition-transform">send</span>
                        </button>
                    </header>
                </BorderGlow>

                <main>
                    <AnimatePresence mode="wait">
                        <BorderGlow borderRadius={64} backgroundColor="rgba(10, 10, 12, 0.4)" colors={['#c084fc', '#f472b6', '#38bdf8']} glowIntensity={1}>
                            <div className="p-6 sm:p-10 md:p-16 relative h-full">
                                <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-primary/10 rounded-bl-[2rem] sm:rounded-bl-[4rem]"></div>
                                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.5em] text-on-surface-variant/40 mb-6 block">Current Question</span>
                                <h3 className="text-xl sm:text-2xl md:text-5xl font-black font-headline tracking-tight text-on-surface leading-[1.1] mb-8 sm:mb-16">{question?.question}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
                                    {question?.options.map((option, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setAnswers({ ...answers, [currentQuestion]: option })}
                                            className={`group relative p-5 sm:p-8 rounded-[1.25rem] sm:rounded-[2.5rem] text-left border-none transition-editorial flex items-center gap-4 sm:gap-6 ${answers[currentQuestion] === option ? 'bg-primary text-white shadow-2xl shadow-primary/30' : 'bg-surface-container-high hover:bg-white/5 text-on-surface-variant hover:text-on-surface'}`}
                                        >
                                            <div className="flex items-center gap-4 sm:gap-6 flex-grow min-w-0 pr-6 sm:pr-10">
                                                <div className={`w-9 h-9 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center font-black text-base sm:text-xl shrink-0 transition-all ${answers[currentQuestion] === option ? 'bg-white/20' : 'bg-white/5 text-primary shadow-sm group-hover:scale-110'}`}>
                                                    {String.fromCharCode(65 + i)}
                                                </div>
                                                <span className={`text-sm sm:text-lg font-extrabold font-headline select-none tracking-wide ${answers[currentQuestion] === option ? 'text-white' : 'text-on-surface'}`}>{option}</span>
                                            </div>
                                            <div className="absolute right-6 sm:right-10 flex items-center justify-center">
                                                <AnimatePresence>
                                                    {answers[currentQuestion] === option && (
                                                        <motion.div
                                                            initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
                                                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                                            exit={{ opacity: 0, scale: 0.5 }}
                                                            className="material-symbols-outlined text-white text-xl sm:text-3xl shrink-0"
                                                        >
                                                            check_circle
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </BorderGlow>
                    </AnimatePresence>
                </main>

                <footer className="flex items-center justify-between pt-4 sm:pt-6 pb-4">
                    <button
                        onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                        disabled={currentQuestion === 0}
                        className="py-3.5 sm:py-5 px-6 sm:px-10 rounded-xl sm:rounded-2xl border-2 border-white/5 text-on-surface font-black uppercase tracking-widest text-[9px] sm:text-xs flex items-center gap-2 sm:gap-3 hover:bg-white/5 transition-all disabled:opacity-20 disabled:cursor-not-allowed group whitespace-nowrap"
                    >
                        <span className="material-symbols-outlined text-base sm:text-xl group-hover:-translate-x-1 transition-transform">arrow_back</span> PREVIOUS
                    </button>
                    <div className="hidden lg:flex gap-2 text-on-surface-variant opacity-30">
                        {[...Array(quiz?.questions.length)].map((_, i) => (
                            <div key={i} className={`w-2 h-2 rounded-full transition-all duration-500 ${i === currentQuestion ? 'w-8 bg-primary opacity-100' : 'bg-on-surface-variant'}`} />
                        ))}
                    </div>
                    <button
                        onClick={() => setCurrentQuestion(prev => Math.min(quiz?.questions.length - 1, prev + 1))}
                        disabled={currentQuestion === quiz?.questions.length - 1}
                        className="py-3.5 sm:py-5 px-6 sm:px-10 rounded-xl sm:rounded-2xl border-2 border-white/5 text-on-surface font-black uppercase tracking-widest text-[9px] sm:text-xs flex items-center gap-2 sm:gap-3 hover:bg-white/5 transition-all disabled:opacity-20 disabled:cursor-not-allowed group whitespace-nowrap"
                    >
                        NEXT <span className="material-symbols-outlined text-base sm:text-xl group-hover:translate-x-1 transition-transform">arrow_forward</span>
                    </button>
                </footer>
            </div>

            {/* Navigation Panel Sidebar */}
            <aside className="w-full lg:w-[400px] sticky top-28 h-fit">
                <BorderGlow borderRadius={64} backgroundColor="rgba(10, 10, 12, 0.4)" colors={['#c084fc', '#f472b6', '#38bdf8']} glowIntensity={1}>
                    <div className="p-8 sm:p-12 flex flex-col gap-8 sm:gap-12 h-full">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between border-b border-white/5 pb-6">
                                <h4 className="text-xl sm:text-2xl font-black font-headline tracking-tighter text-on-surface uppercase leading-none">Questions.</h4>
                                <span className="text-[10px] font-black text-primary bg-white/5 px-4 py-1.5 rounded-full uppercase tracking-widest">{quiz?.questions.length} Total</span>
                            </div>
                        </div>

                        <div className="flex-1 pb-4">
                            {Object.entries(
                                quiz?.questions.reduce((acc, q, i) => {
                                    const normalizedName = (q.section || 'General Questions').trim();
                                    if (!acc[normalizedName]) acc[normalizedName] = { displayName: normalizedName, indices: [] };
                                    acc[normalizedName].indices.push(i);
                                    return acc;
                                }, {})
                            ).map(([name, { indices }]) => (
                                <div key={name} className="mb-8 sm:mb-12 last:mb-0">
                                    <h5 className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant mb-4 sm:mb-6 flex items-center gap-3 sm:gap-4">
                                        <span className="w-3 sm:w-4 h-[2px] bg-primary"></span>
                                        {name}
                                    </h5>
                                    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-4 gap-3 sm:gap-4 px-2 py-4">
                                        {indices.map((i) => (
                                            <button
                                                key={i}
                                                onClick={() => setCurrentQuestion(i)}
                                                className={`w-full aspect-square rounded-full flex items-center justify-center font-black tracking-tight transition-all duration-300 text-xs sm:text-sm border-2 
                                                    ${currentQuestion === i
                                                        ? (answers[i] ? 'bg-primary border-primary text-white scale-110 shadow-2xl shadow-primary/30' : 'border-primary bg-primary/10 text-primary scale-110 shadow-lg shadow-primary/10')
                                                        : (answers[i] ? 'bg-primary border-primary text-white shadow-xl shadow-primary/20' : 'bg-surface-container-high border-white/5 hover:border-primary/50 text-on-surface-variant hover:text-on-surface')
                                                    }
                                                `}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="pt-8 border-t border-white/5 flex flex-col gap-5">
                            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">
                                <span>Status</span>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-widest text-on-surface-variant"><div className="w-3 h-3 bg-primary rounded-full shadow-lg shadow-primary/20" /> Answered</div>
                                <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-widest text-on-surface-variant"><div className="w-3 h-3 bg-surface-container-high border-2 border-white/10 rounded-full" /> Not Answered</div>
                            </div>
                        </div>
                    </div>
                </BorderGlow>
            </aside>
        </div>
    );
};

export default QuizPlayer;
