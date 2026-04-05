import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Plasma from '../components/animations/Plasma';
import BorderGlow from '../components/animations/BorderGlow';

export const QuizCard = ({ quiz }) => (
    <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        whileHover={{ y: -12, scale: 1.02 }}
        className="h-full"
    >
        <BorderGlow
            borderRadius={40}
            backgroundColor="rgba(10, 10, 12, 0.9)"
            className="h-full"
            colors={['#c084fc', '#f472b6', '#38bdf8']}
            glowIntensity={1}
        >
            <div className="p-6 sm:p-10 flex flex-col justify-between h-full relative overflow-hidden">
                {/* Background Dots Pattern */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none group-hover:opacity-[0.07] transition-opacity duration-700" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />

                {/* Top Accent Glow */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 rounded-full blur-[80px] transition-colors" />

                <div className="relative z-10 space-y-8">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between gap-4 w-full">
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary truncate block">{quiz.category}</span>
                            <div className="flex items-center gap-3">
                                {quiz.hasAttempted && (
                                    <div className="bg-primary/10 border border-primary/20 px-3 py-1 rounded-full flex items-center gap-1.5 shrink-0">
                                        <span className="material-symbols-outlined text-[14px] text-primary">verified</span>
                                        <span className="text-[8px] font-black uppercase tracking-widest text-primary">Attempted</span>
                                    </div>
                                )}
                                <div className={`shrink-0 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/5 bg-white/5 ${quiz.difficulty === 'Easy' ? 'text-green-500' : quiz.difficulty === 'Hard' ? 'text-rose-500' : 'text-amber-500'}`}>
                                    {quiz.difficulty}
                                </div>
                            </div>
                        </div>
                        <span className="w-8 h-[1.5px] bg-white/10 group-hover:w-full transition-all duration-700" />
                    </div>

                    <h3 className="text-3xl font-black font-headline tracking-tighter text-on-surface leading-[1.05] group-hover:text-white transition-colors uppercase line-clamp-2">{quiz.title}</h3>

                    <div className="flex items-center gap-6 pt-4 border-t border-white/5">
                        <div className="flex items-center gap-2 text-[10px] font-black tracking-widest text-on-surface-variant uppercase">
                            <span className="material-symbols-outlined text-[18px] text-primary/60">quiz</span>
                            {quiz.questions?.length} Questions
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-black tracking-widest text-on-surface-variant uppercase">
                            <span className="material-symbols-outlined text-[18px] text-primary/60">avg_time</span>
                            {quiz.timeLimit} Min
                        </div>
                    </div>
                </div>

                <Link to={`/quiz/${quiz._id}`} className={`relative z-10 mt-10 w-full py-5 rounded-2xl font-headline font-black text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-2xl transition-all group-active:scale-95 overflow-hidden ${quiz.hasAttempted ? 'bg-[#0a0a0c] border border-white/5 text-on-surface hover:bg-white/5' : 'editorial-gradient text-white shadow-primary/20 hover:scale-[1.03]'}`}>
                    <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    <span className="relative z-10">{quiz.hasAttempted ? 'Retake: 0 XP' : 'Start Quiz'}</span>
                    <span className="material-symbols-outlined relative z-10 text-xl font-light">{quiz.hasAttempted ? 'restart_alt' : 'play_arrow'}</span>
                </Link>
            </div>
        </BorderGlow>
    </motion.div>
);

const ExploreQuizzes = () => {
    const [isMobile, setIsMobile] = useState(false);
    const [quizzes, setQuizzes] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 1024);
        checkMobile();
        window.addEventListener('resize', checkMobile);

        const fetchQuizzes = async () => {
            try {
                const res = await axios.get('/api/quizzes', { params: { search } });
                setQuizzes(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchQuizzes();
        return () => window.removeEventListener('resize', checkMobile);
    }, [search]);

    return (
        <div className="min-h-screen bg-surface pt-32 sm:pt-40 pb-20 px-6 sm:px-8 lg:px-24 relative overflow-hidden">
            {/* Full-Page Plasma Background scoped to component bounds */}
            <div className="absolute inset-0 z-[1] opacity-30 pointer-events-none">
                {!isMobile ? (
                    <Plasma
                        color=""
                        speed={0.4}
                        direction="forward"
                        scale={1.2}
                        opacity={0.6}
                        mouseInteractive={true}
                    />
                ) : (
                    <div className="absolute inset-0 bg-primary/5 backdrop-blur-3xl" />
                )}
            </div>

            <div className="max-w-7xl mx-auto space-y-16 relative z-[10]">

                {/* Search & Header */}
                <header className="w-full flex flex-col items-center justify-center gap-10 text-center">
                    <div className="flex flex-col items-center space-y-4">
                        <span className="text-primary font-headline font-black tracking-[0.5em] text-[10px] sm:text-xs md:text-sm uppercase block">Browse All</span>
                        <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl md:text-7xl font-black font-headline tracking-tighter text-on-surface leading-none uppercase text-center">
                            Explore <br /><span className="gradient-text italic pr-2 -mr-2">Quizzes</span>.
                        </motion.h2>
                        <p className="text-on-surface-variant font-medium text-lg max-w-xl">Find the best quizzes to test your knowledge in any category.</p>
                    </div>

                    <div className="relative w-full max-w-md group">
                        <span className="absolute left-5 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant group-focus-within:text-primary transition-colors">search</span>
                        <input
                            type="text"
                            className="w-full bg-surface-container/50 backdrop-blur-xl border border-white/5 rounded-3xl py-5 pl-14 pr-6 focus:ring-4 focus:ring-primary/10 transition-all font-headline text-sm font-semibold outline-none shadow-2xl text-on-surface placeholder:text-on-surface-variant/30"
                            placeholder="Search by quiz name or category..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </header>

                {/* Quizzes Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="bg-surface-container/30 backdrop-blur-md p-10 rounded-[2.5rem] h-80 animate-pulse border border-white/5" />
                        ))}
                    </div>
                ) : quizzes.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10">
                        {quizzes.map(quiz => <QuizCard key={quiz._id} quiz={quiz} />)}
                    </div>
                ) : (
                    <div className="py-40 text-center bg-surface-container/30 backdrop-blur-md rounded-[4rem] border-2 border-dashed border-white/10">
                        <span className="material-symbols-outlined text-7xl text-white/10 mb-6">explore_off</span>
                        <p className="text-on-surface-variant text-xl font-headline font-bold">No quizzes found. Try a different search term.</p>
                        <button onClick={() => setSearch('')} className="mt-8 text-primary font-black uppercase tracking-widest text-xs hover:underline">Reset Search</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExploreQuizzes;
