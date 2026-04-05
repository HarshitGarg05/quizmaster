import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import BorderGlow from '../components/animations/BorderGlow';

const Results = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { updateUser } = useAuth();
    const [attempt, setAttempt] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAttempt = async () => {
            try {
                const res = await axios.get(`/api/attempts/${id}`);
                setAttempt(res.data);
                if (res.data.user) {
                    updateUser(res.data.user);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAttempt();
    }, [id, updateUser]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-surface">
            <div className="relative w-20 h-20">
                <div className="absolute inset-0 editorial-gradient rounded-full animate-ping opacity-20"></div>
                <div className="relative w-full h-full border-4 border-white/5 border-t-primary rounded-full animate-spin"></div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-surface flex flex-col items-center justify-center pt-32 pb-20 px-6 sm:px-8 lg:px-24 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-10 left-10 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[140px] -z-10"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-5xl"
            >
                <BorderGlow
                    borderRadius={64}
                    backgroundColor="rgba(10, 10, 12, 0.4)"
                    colors={['#c084fc', '#f472b6', '#38bdf8']}
                    glowIntensity={1}
                >
                    <div className="p-8 sm:p-12 md:p-20 text-center space-y-12 sm:space-y-16 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 editorial-gradient" />

                        <div className="space-y-6">
                            <div className="w-28 h-28 editorial-gradient rounded-[2rem] flex items-center justify-center mx-auto text-white shadow-3xl shadow-primary/30 transform -rotate-12 hover:rotate-0 transition-transform duration-700">
                                <span className="material-symbols-outlined text-6xl">verified</span>
                            </div>
                            <h2 className="text-4xl md:text-7xl font-black font-headline tracking-tighter text-on-surface leading-none uppercase pt-6">Quiz <br /><span className="gradient-text">Completed!</span></h2>
                            <p className="text-lg md:text-xl text-on-surface-variant font-medium max-w-2xl mx-auto tracking-tight">Congratulations on finishing the quiz! Check your detailed stats below.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                            <div className="bg-surface-container-high p-6 md:p-8 rounded-3xl border border-white/5 shadow-sm group hover:bg-white/5 hover:shadow-xl transition-all duration-500">
                                <div className="text-3xl md:text-4xl font-black font-headline text-on-surface mb-2 tabular-nums">{attempt?.score}</div>
                                <div className="text-on-surface-variant text-[10px] sm:text-xs md:text-sm font-black uppercase tracking-[0.4em] flex items-center justify-center gap-2">
                                    <span className="material-symbols-outlined text-[18px] text-primary">analytics</span> Final Score
                                </div>
                            </div>
                            <div className="bg-surface-container-high p-6 md:p-8 rounded-3xl border border-white/5 shadow-sm group hover:bg-white/5 hover:shadow-xl transition-all duration-500">
                                <div className="text-3xl md:text-4xl font-black font-headline text-on-surface mb-2 tabular-nums">{Math.round(attempt?.accuracy)}%</div>
                                <div className="text-on-surface-variant text-[10px] sm:text-xs md:text-sm font-black uppercase tracking-[0.4em] flex items-center justify-center gap-2">
                                    <span className="material-symbols-outlined text-[18px] text-primary">track_changes</span> Accuracy
                                </div>
                            </div>
                            <div className="bg-surface-container-high p-6 md:p-8 rounded-3xl border border-white/5 shadow-sm group hover:bg-white/5 hover:shadow-xl transition-all duration-500">
                                <div className="text-3xl md:text-4xl font-black font-headline text-on-surface mb-2 tabular-nums">{Math.floor(attempt?.timeTaken / 60)}:{(attempt?.timeTaken % 60).toString().padStart(2, '0')}</div>
                                <div className="text-on-surface-variant text-[10px] sm:text-xs md:text-sm font-black uppercase tracking-[0.4em] flex items-center justify-center gap-2">
                                    <span className="material-symbols-outlined text-[18px] text-primary">schedule</span> Time Taken
                                </div>
                            </div>
                            <div className={`p-6 md:p-8 rounded-3xl shadow-2xl transition-all duration-500 transform ${attempt?.xpEarned === 0 ? 'bg-surface-container-high border border-white/10 grayscale-[0.5] scale-100' : 'editorial-gradient shadow-primary/20 scale-105 group hover:scale-110'}`}>
                                <div className={`text-3xl md:text-4xl font-black font-headline mb-2 tabular-nums ${attempt?.xpEarned === 0 ? 'text-on-surface-variant' : 'text-white'}`}>
                                    {attempt?.xpEarned > 0 ? '+' : ''}{attempt?.xpEarned || 0}
                                </div>
                                <div className={`${attempt?.xpEarned === 0 ? 'text-on-surface-variant/60' : 'text-white/80'} text-[10px] sm:text-xs md:text-sm font-black uppercase tracking-[0.4em] flex items-center justify-center gap-2`}>
                                    <span className="material-symbols-outlined text-[18px]">{attempt?.xpEarned === 0 ? 'history' : 'bolt'}</span>
                                    {attempt?.xpEarned === 0 ? 'Retake: 0 XP' : 'Total XP Earned'}
                                </div>
                            </div>
                        </div>

                        {attempt?.xpBreakdown && (
                            <div className="space-y-8 animate-fade-in pt-4 border-t border-white/5">
                                <div className="flex flex-col items-center gap-2">
                                    <span className="text-primary font-headline font-black tracking-[0.5em] text-[10px] sm:text-xs md:text-sm uppercase block">Quiz Stats</span>
                                    <h4 className="text-xl md:text-2xl font-black font-headline tracking-tighter text-on-surface uppercase italic">XP Breakdown</h4>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                                    {[
                                        { label: 'Base XP', id: 'baseXP', icon: 'auto_awesome' },
                                        { label: 'Accuracy', id: 'accuracyBonus', icon: 'analytics' },
                                        { label: 'Time Bonus', id: 'timeBonus', icon: 'avg_time' },
                                        { label: 'Streak', id: 'streakBonus', icon: 'vital_signs' },
                                        { label: 'Difficulty', id: 'difficultyMultiplier', icon: 'settings_input_component', prefix: 'x' }
                                    ].map((item, index) => (
                                        <motion.div
                                            key={item.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.1 * index }}
                                            className="bg-[#0a0a0c]/60 p-4 sm:p-6 rounded-2xl border border-white/5 flex flex-col items-center justify-center gap-2 sm:gap-3 hover:bg-white/5 transition-all group"
                                        >
                                            <span className="material-symbols-outlined text-xl sm:text-2xl text-on-surface-variant group-hover:text-primary transition-colors">{item.icon}</span>
                                            <div className="flex flex-col items-center leading-none">
                                                <span className="text-[10px] sm:text-xs md:text-sm text-on-surface-variant font-black uppercase tracking-[0.4em] mb-1.5 sm:mb-2">{item.label}</span>
                                                <span className={`text-lg sm:text-xl font-black tabular-nums ${item.id === 'difficultyMultiplier' ? 'text-primary' : 'text-on-surface'}`}>
                                                    {item.prefix || '+'}{attempt.xpBreakdown[item.id]}
                                                </span>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col md:flex-row items-center justify-center gap-6 sm:gap-8 pt-8 sm:pt-10">
                            <Link to={`/review/${id}`} className="w-full md:w-auto px-10 py-5 sm:px-12 sm:py-6 editorial-gradient text-white rounded-2xl font-black font-headline text-base sm:text-lg tracking-tight shadow-3xl shadow-primary/20 hover:scale-[1.03] active:scale-[0.98] transition-all flex items-center justify-center gap-4">
                                Review Answers <span className="material-symbols-outlined">description</span>
                            </Link>
                            <button onClick={() => navigate(`/quiz/${attempt?.quizId._id}`)} className="w-full md:w-auto px-10 py-5 sm:px-12 sm:py-6 bg-white/5 border-2 border-white/5 rounded-2xl font-black font-headline text-base sm:text-lg text-on-surface tracking-tight hover:bg-surface-container-high transition-all flex items-center justify-center gap-4">
                                Retake Quiz <span className="material-symbols-outlined">restart_alt</span>
                            </button>
                            <Link to="/dashboard" className="w-full md:w-auto px-10 py-5 sm:px-12 sm:py-6 bg-white/10 text-white rounded-2xl font-black font-headline text-base sm:text-lg tracking-tight hover:bg-primary transition-all flex items-center justify-center gap-4">
                                Dashboard <span className="material-symbols-outlined text-xl">logout</span>
                            </Link>
                        </div>
                    </div>
                </BorderGlow>
            </motion.div>
        </div>
    );
};

export default Results;
