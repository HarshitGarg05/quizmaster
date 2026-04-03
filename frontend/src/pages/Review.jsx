import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

import BorderGlow from '../components/animations/BorderGlow';

const Review = () => {
    const { id } = useParams();
    const [attempt, setAttempt] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // 'all' or 'incorrect'

    useEffect(() => {
        const fetchAttempt = async () => {
            try {
                const res = await axios.get(`/api/attempts/${id}`);
                setAttempt(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAttempt();
    }, [id]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-surface">
            <div className="relative w-20 h-20">
                <div className="absolute inset-0 editorial-gradient rounded-full animate-ping opacity-20"></div>
                <div className="relative w-full h-full border-4 border-white/5 border-t-primary rounded-full animate-spin"></div>
            </div>
        </div>
    );

    const questions = attempt?.quizId?.questions || [];
    const answers = attempt?.answers || [];
    const incorrectCount = answers.filter(a => !a.isCorrect).length;

    const filteredAnswers = filter === 'incorrect'
        ? answers.filter(a => !a.isCorrect)
        : answers;

    return (
        <div className="min-h-screen bg-surface pt-24 sm:pt-32 pb-12 sm:pb-24 px-4 sm:px-6 md:px-8 max-w-5xl mx-auto">
            {/* Header Summary Section */}
            <section className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-4">
                        <Link to={`/results/${id}`} className="p-2 hover:bg-surface-container rounded-full transition-colors flex items-center justify-center group">
                            <span className="material-symbols-outlined text-primary group-hover:-translate-x-1 transition-transform">arrow_back</span>
                        </Link>
                        <span className="text-on-surface-variant font-black uppercase text-[10px] sm:text-xs md:text-sm tracking-[0.4em]">Back to Results</span>
                    </div>
                    <h1 className="text-3xl md:text-6xl font-black font-headline tracking-tighter mb-4 text-on-surface uppercase leading-none">
                        Attempt Review: <br /><span className="gradient-text">{attempt?.quizId?.title}</span>
                    </h1>
                    <p className="text-on-surface-variant max-w-2xl leading-relaxed text-base md:text-lg font-medium opacity-80">
                        Review your performance across {questions.length} modules. You correctly answered {answers.length - incorrectCount} questions.
                    </p>
                </div>
                <div className="bg-surface-container p-8 rounded-[2.5rem] border border-white/5 shadow-2xl flex flex-col items-center justify-center min-w-[200px] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-2 h-full editorial-gradient opacity-20"></div>
                    <div className="text-on-surface-variant text-[10px] sm:text-xs md:text-sm font-black uppercase tracking-[0.4em] mb-1">Final Score</div>
                    <div className="text-5xl font-black text-primary font-headline tracking-tighter">
                        {Math.round(attempt?.accuracy)}<span className="text-xl opacity-40 font-black">%</span>
                    </div>
                    <div className="mt-4 w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${attempt?.accuracy}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="h-full editorial-gradient"
                        />
                    </div>
                </div>
            </section>

            {/* Filter & Control Rail */}
            <div className="flex flex-col sm:flex-row items-center justify-between mb-12 pb-8 border-b border-white/5 gap-6">
                <div className="flex items-center gap-2 bg-surface-container-high p-1 rounded-full border border-white/5 shadow-xl ring-1 ring-white/5">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 min-w-[140px] ${filter === 'all' ? 'bg-primary text-white shadow-xl scale-[1.02]' : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5'}`}
                    >
                        All Questions
                    </button>
                    <button
                        onClick={() => setFilter('incorrect')}
                        className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 min-w-[140px] ${filter === 'incorrect' ? 'bg-error text-white shadow-xl scale-[1.02]' : 'text-on-surface-variant hover:text-error hover:bg-white/5'}`}
                    >
                        Incorrect Only ({incorrectCount})
                    </button>
                </div>
                <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-primary gap-3 bg-primary/5 px-6 py-3 rounded-full border border-primary/20">
                    <span className="material-symbols-outlined text-[20px]">info</span>
                    <span className="whitespace-nowrap font-headline">Detailed explanations for growth</span>
                </div>
            </div>

            {/* Question List */}
            <div className="space-y-12">
                <AnimatePresence mode="popLayout">
                    {filteredAnswers.map((answer, index) => {
                        const questionData = questions.find(q => q._id === answer.questionId);
                        if (!questionData) return null;

                        const originalIndex = answers.indexOf(answer);

                        return (
                            <motion.div
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: index * 0.05 }}
                                key={answer.questionId}
                            >
                                <BorderGlow
                                    borderRadius={48}
                                    backgroundColor="rgba(26, 26, 30, 0.4)"
                                    colors={answer.isCorrect ? ['#c084fc', '#f472b6', '#38bdf8'] : ['#ef4444', '#f87171', '#dc2626']}
                                    glowIntensity={1}
                                >
                                    <article className="p-8 sm:p-10 md:p-12 relative overflow-hidden transition-all duration-300 group">
                                        <div className={`absolute left-0 top-0 bottom-0 w-2 ${answer.isCorrect ? 'editorial-gradient' : 'bg-error/30'}`}></div>

                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 sm:mb-10">
                                            <div className="flex items-center gap-3">
                                                <span className={`text-[10px] font-black uppercase tracking-widest px-5 py-2 rounded-full ring-1 ${answer.isCorrect ? 'bg-primary/5 text-primary ring-primary/20' : 'bg-error/5 text-error ring-error/20'}`}>
                                                    Question {(originalIndex + 1).toString().padStart(2, '0')} • {answer.isCorrect ? 'Correct' : 'Incorrect'}
                                                </span>
                                                {answer.isCorrect && <span className="material-symbols-outlined text-primary text-sm animate-pulse">verified</span>}
                                            </div>
                                            <span className="text-[10px] font-black font-headline text-on-surface-variant/40 uppercase tracking-[0.2em]">{answer.isCorrect ? '+10 POINTS' : '0 POINTS'}</span>
                                        </div>

                                        <h3 className="text-xl md:text-3xl font-black font-headline text-on-surface mb-8 md:mb-10 leading-tight uppercase tracking-tight">
                                            {questionData.question}
                                        </h3>

                                        <div className="grid gap-4 mb-10">
                                            {questionData.options.map((option, i) => {
                                                const isCorrect = option === questionData.correctAnswer;
                                                const isUserSelection = option === answer.userAnswer;
                                                const label = String.fromCharCode(65 + i);

                                                let cardStyles = "bg-surface-container-high border-2 border-transparent text-on-surface-variant opacity-60";
                                                let icon = null;

                                                if (isCorrect) {
                                                    cardStyles = "bg-primary/5 border-primary/20 text-primary shadow-sm opacity-100 ring-1 ring-primary/10";
                                                    icon = "check_circle";
                                                } else if (isUserSelection && !answer.isCorrect) {
                                                    cardStyles = "bg-error/5 border-error/20 text-error shadow-sm opacity-100 ring-1 ring-error/10";
                                                    icon = "cancel";
                                                }

                                                return (
                                                    <div
                                                        key={i}
                                                        className={`relative p-5 sm:p-6 rounded-2xl flex items-center gap-4 sm:gap-6 border-2 transition-all group/opt ${cardStyles}`}
                                                    >
                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 transition-all ${isCorrect ? 'bg-primary text-white' : isUserSelection ? 'bg-error text-white' : 'bg-surface-container-high text-on-surface-variant group-hover/opt:bg-white/10'}`}>
                                                            {label}
                                                        </div>
                                                        <div className="flex-1 pr-10">
                                                            <p className="text-sm font-bold tracking-tight leading-tight">
                                                                {option}
                                                                {isCorrect && <span className="ml-2 text-[8px] font-black uppercase tracking-widest opacity-40 whitespace-nowrap">(Correct)</span>}
                                                                {isUserSelection && !isCorrect && <span className="ml-2 text-[8px] font-black uppercase tracking-widest opacity-40 whitespace-nowrap">(Your Answer)</span>}
                                                            </p>
                                                        </div>
                                                        {icon && (
                                                            <div className="absolute right-5 sm:right-6 flex items-center justify-center">
                                                                <span className={`material-symbols-outlined text-2xl animate-in zoom-in-50 duration-300 ${isCorrect ? 'text-primary' : 'text-error'}`}>
                                                                    {icon}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <div className="bg-surface-container-high/60 p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] border border-white/5 flex gap-4 sm:gap-6 relative overflow-hidden group/explain">
                                            <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-[4rem] opacity-5 -z-10 transition-transform duration-700 group-hover/explain:scale-150 ${answer.isCorrect ? 'editorial-gradient' : 'bg-error'}`}></div>
                                            <div className={`w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 ${answer.isCorrect ? 'bg-primary/10 text-primary' : 'bg-error/10 text-error'}`}>
                                                <span className="material-symbols-outlined text-lg sm:text-2xl">{answer.isCorrect ? 'auto_awesome' : 'tips_and_updates'}</span>
                                            </div>
                                            <div className="flex-1">
                                                <h4 className={`text-[10px] sm:text-xs md:text-sm font-black uppercase tracking-[0.4em] mb-3 ${answer.isCorrect ? 'text-primary' : 'text-error'}`}>Mentor Explanation</h4>
                                                <p className="text-[11px] sm:text-sm font-medium text-on-surface-variant leading-relaxed">
                                                    {questionData.explanation || 'Detailed analysis not provided, but mastery is within reach!'}
                                                </p>
                                            </div>
                                        </div>
                                    </article>
                                </BorderGlow>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Review;
