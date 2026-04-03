import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRankByXP, getRankDetails } from '../utils/xpUtils';
import RippleGrid from '../components/animations/RippleGrid';
import BorderGlow from '../components/animations/BorderGlow';
import ConfirmModal from '../components/ConfirmModal';
import { useNotification } from '../context/NotificationContext';

const StatCard = ({ icon, value, label, color, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.5 }}
        whileHover={{ y: -8, scale: 1.02 }}
        className="h-full"
    >
        <BorderGlow borderRadius={40} backgroundColor="rgba(10, 10, 12, 0.9)" colors={['#c084fc', '#f472b6', '#38bdf8']} glowIntensity={1}>
            <div className="p-6 sm:p-8 flex flex-col justify-between min-h-[180px] sm:min-h-[220px] h-full relative overflow-hidden group">
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none group-hover:opacity-[0.05] transition-opacity duration-700" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
                <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[100px] opacity-20 group-hover:opacity-40 transition-opacity duration-700 ${color && color.includes('gradient') ? 'bg-primary' : color}`} />

                <div className="relative z-10 flex flex-col justify-between h-full">
                    <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center ${color} text-white shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-700 relative`}>
                        <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-white/20 animate-pulse opacity-0 group-hover:opacity-100 transition-opacity" />
                        <span className="material-symbols-outlined text-2xl sm:text-3xl font-light relative z-10">{icon}</span>
                    </div>

                    <div className="space-y-1 sm:space-y-2 mt-6">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-on-surface-variant">{label}</p>
                        </div>
                        <h4 className="text-3xl sm:text-5xl font-black font-headline tracking-tighter text-on-surface leading-none truncate pr-4">
                            {value}
                        </h4>
                    </div>
                </div>

                <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700" />
            </div>
        </BorderGlow>
    </motion.div>
);

const Dashboard = () => {
    const { user } = useAuth();
    const { showNotification } = useNotification();
    const [stats, setStats] = useState({ attempts: [], totalXP: 0, avgAccuracy: 0 });
    const [recommended, setRecommended] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const handleClearHistory = async () => {
        try {
            await axios.delete('/api/attempts/clear');
            setStats(prev => ({ ...prev, attempts: [] }));
            showNotification('Academic record cleared successfully', 'success');
        } catch (err) {
            console.error('Failed to clear history:', err);
            showNotification('Security protocol failure: Unable to clear records.', 'error');
        }
    };

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const recRes = await axios.get('/api/quizzes?limit=3');
                setRecommended(recRes.data.slice(0, 3));

                const attemptRes = await axios.get('/api/attempts/user/me');
                const attempts = attemptRes.data;
                const totalXP = attempts.reduce((acc, a) => acc + (a.xpEarned || 0), 0);
                const avgAccuracy = attempts.length > 0 ? (attempts.reduce((acc, a) => acc + a.accuracy, 0) / attempts.length) : 0;

                setStats({ attempts, totalXP, avgAccuracy });
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchDashboardData();
    }, [user]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#050505] overflow-hidden">
            <div className="relative">
                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ repeat: Infinity, duration: 3 }}
                    className="absolute inset-x-[-120%] inset-y-[-120%] bg-primary/20 rounded-full blur-[120px]"
                />
                <div className="relative flex flex-col items-center gap-8">
                    <div className="w-24 h-24 relative">
                        <div className="absolute inset-0 editorial-gradient rounded-full blur-xl opacity-40 animate-pulse" />
                        <div className="relative w-full h-full border-[3px] border-white/5 border-t-primary rounded-full animate-spin shadow-2xl" />
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-[0.6em] text-primary animate-pulse">QuizMaster AI</span>
                        <div className="h-[2px] w-12 bg-white/10 overflow-hidden rounded-full">
                            <motion.div
                                animate={{ x: ['-100%', '100%'] }}
                                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                                className="h-full w-full bg-primary"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-surface pt-32 sm:pt-40 pb-20 px-4 sm:px-8 lg:px-24 relative overflow-hidden">
            {/* Interactive Ripple Grid Background */}
            <div className="absolute inset-0 z-[1] pointer-events-none opacity-40">
                <RippleGrid
                    enableRainbow={false}
                    gridColor="#6366f1"
                    rippleIntensity={0.06}
                    gridSize={10}
                    gridThickness={12}
                    mouseInteraction={true}
                    mouseInteractionRadius={1.2}
                    opacity={0.8}
                />
            </div>

            <div className="max-w-7xl mx-auto space-y-16 relative z-[10] pointer-events-none [&>*]:pointer-events-auto">

                {/* Welcome Header */}
                <header className="w-full flex flex-col items-center justify-center gap-10 text-center">
                    <div className="flex flex-col items-center space-y-6">
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center justify-center gap-4">
                            <span className="w-8 sm:w-12 h-[2px] bg-primary"></span>
                            <span className="text-primary font-headline font-black tracking-[0.5em] text-[10px] sm:text-xs uppercase block">Stats Overview</span>
                            <span className="w-8 sm:w-12 h-[2px] bg-primary"></span>
                        </motion.div>
                        <div className="text-center">
                            <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl sm:text-6xl md:text-8xl font-black font-headline tracking-tighter text-on-surface leading-none uppercase text-center">
                                Welcome, <br className="sm:hidden" /><span className="gradient-text italic px-4 py-2">{user.name.split(' ')[0]}</span>.
                            </motion.h2>
                            <div className="mt-12 relative group/rank py-2 flex justify-center">
                                <div className="absolute inset-0 bg-primary/20 rounded-[64px] blur-3xl -z-10 group-hover/rank:bg-primary/30 transition-all duration-700 max-w-3xl mx-auto" />
                                <div className="flex items-center gap-12 bg-white/[0.04] p-10 sm:p-14 rounded-[64px] border border-white/5 backdrop-blur-xl shadow-2xl transition-all duration-700 hover:border-white/10 max-w-fit mx-auto">
                                    <img src={getRankDetails(stats.totalXP).badge} alt={getRankByXP(stats.totalXP)} className="w-32 h-32 sm:w-48 sm:h-48 object-contain drop-shadow-[0_0_30px_rgba(255,255,255,0.2)] group-hover/rank:scale-105 transition-all duration-700" />
                                    <div className="flex flex-col items-center gap-4 text-center">
                                        <span className="text-[10px] sm:text-xs font-black uppercase tracking-[1em] text-on-surface-variant opacity-40 mb-1 pl-[1em]">Scholar Rank</span>
                                        <div className="relative flex flex-col items-center">
                                            <h3 style={{ color: getRankDetails(stats.totalXP).color }} className="text-3xl sm:text-5xl font-black font-headline tracking-tighter uppercase italic leading-none drop-shadow-sm pr-[0.05em]">{getRankByXP(stats.totalXP)}</h3>
                                            <div className="h-1.5 w-full max-w-[100px] mt-6 rounded-full opacity-30 shadow-[0_0_15px_rgba(255,255,255,0.3)] animate-pulse" style={{ backgroundColor: getRankDetails(stats.totalXP).color }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                    <StatCard
                        icon="emoji_events"
                        value={stats.totalXP.toLocaleString()}
                        label="Total XP"
                        color="editorial-gradient"
                        delay={0.2}
                    />
                    <StatCard
                        icon="query_stats"
                        value={`${stats.avgAccuracy.toFixed(1)}%`}
                        label="Avg Accuracy"
                        color="bg-primary/80"
                        delay={0.3}
                    />
                    <StatCard
                        icon="history_edu"
                        value={stats.attempts.length}
                        label="Quizzes Finished"
                        color="bg-white/10"
                        delay={0.4}
                    />
                </div>

                <div className="space-y-24">
                    {/* Recent Activity List */}
                    <div className="space-y-12">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/5 pb-8 gap-6 text-left">
                            <div className="flex flex-col gap-2">
                                <span className="text-[10px] font-black uppercase tracking-[0.6em] text-primary font-headline">Activity History</span>
                                <h3 className="text-4xl md:text-5xl font-black font-headline tracking-tighter text-on-surface uppercase sm:whitespace-nowrap">Recent Activity</h3>
                            </div>
                            {stats.attempts.length > 0 && (
                                <button
                                    onClick={() => setShowConfirmModal(true)}
                                    className="px-6 py-3 bg-error/10 hover:bg-error/20 text-error border border-error/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-lg">delete_sweep</span>
                                    Clear History
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {stats.attempts.length > 0 ? (
                                stats.attempts.slice(0, 5).map((attempt, index) => (
                                    <motion.div
                                        key={attempt._id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <Link to={`/results/${attempt._id}`} className="block h-full group">
                                            <BorderGlow
                                                borderRadius={48}
                                                backgroundColor="rgba(10, 10, 12, 0.9)"
                                                colors={['#c084fc', '#f472b6', '#38bdf8']}
                                                glowIntensity={1}
                                            >
                                                <div className="p-6 sm:p-10 flex flex-col sm:flex-row items-center justify-between min-h-[140px] sm:min-h-[160px] relative overflow-hidden group/item">
                                                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none group-hover/item:opacity-[0.06] transition-opacity duration-700" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
                                                    <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity duration-500" />

                                                    <div className="flex items-center gap-6 sm:gap-10 relative z-10 w-full">
                                                        <div className="w-14 h-14 sm:w-20 sm:h-20 bg-surface-container rounded-2xl sm:rounded-3xl flex items-center justify-center text-on-surface-variant group-hover/item:editorial-gradient group-hover/item:text-white transition-all duration-700 shadow-2xl group-hover/item:scale-105 group-hover/item:rotate-3 shrink-0">
                                                            <span className="material-symbols-outlined text-2xl sm:text-4xl font-light">auto_stories</span>
                                                        </div>
                                                        <div className="space-y-4 flex-grow text-left">
                                                            <div className="flex items-center gap-3">
                                                                <span className="w-8 h-[1.5px] bg-primary group-hover/item:w-full transition-all duration-700" />
                                                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Quiz Record</span>
                                                            </div>
                                                            <h4 className="text-xl md:text-2xl font-black font-headline tracking-tighter text-on-surface group-hover/item:text-white transition-colors leading-tight uppercase line-clamp-2">{attempt.quizId?.title || 'Attempt'}</h4>
                                                            <div className="flex flex-wrap items-center gap-8 text-[11px] font-bold text-on-surface-variant tracking-widest uppercase">
                                                                <div className="flex items-center gap-2 pt-1 font-black"><span className="material-symbols-outlined text-[18px] text-primary">bolt</span> {attempt.xpEarned || 0} XP</div>
                                                                <div className="flex items-center gap-2 pt-1 font-black" style={{ color: getRankDetails(attempt.xpEarned || 0).color }}>
                                                                    {attempt.accuracy.toFixed(1)}% Accuracy
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="material-symbols-outlined text-on-surface-variant group-hover/item:text-primary group-hover/item:translate-x-3 transition-all duration-500 font-light text-2xl sm:text-4xl opacity-20 group-hover/item:opacity-100 shrink-0 hidden xs:block">arrow_right_alt</div>
                                                    </div>
                                                </div>
                                            </BorderGlow>
                                        </Link>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="py-24 text-center bg-surface-container rounded-[3rem] border-2 border-dashed border-white/10">
                                    <span className="material-symbols-outlined text-5xl text-surface-container-highest mb-4">search_off</span>
                                    <p className="font-headline font-bold text-on-surface-variant">No quizzes found. Start your first attempt now!</p>
                                    <Link to="/explore" className="mt-6 inline-flex items-center gap-2 text-primary font-black uppercase tracking-widest text-xs hover:underline pt-2">Explore All Quizzes</Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recommended Units Section */}
                    <div className="space-y-12">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-white/5 pb-8 gap-10">
                            <div className="flex flex-col gap-3 text-left">
                                <span className="text-[10px] font-black uppercase tracking-[0.6em] text-primary font-headline">Recommendations</span>
                                <h3 className="text-3xl sm:text-5xl md:text-6xl font-black font-headline tracking-tight text-on-surface uppercase leading-[0.95]">Top Featured <br className="hidden sm:block" />Quizzes</h3>
                            </div>
                            <Link to="/explore" className="text-[10px] font-black text-primary uppercase tracking-[0.4em] hover:opacity-70 flex items-center gap-4 group pb-2 whitespace-nowrap">
                                <span className="underline underline-offset-[12px] decoration-2 opacity-50 group-hover:opacity-100 transition-all group-hover:tracking-[0.5em]">Browse All</span>
                                <span className="material-symbols-outlined text-2xl group-hover:translate-x-3 transition-transform font-light">arrow_forward</span>
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {recommended.map((quiz, index) => (
                                <Link to={`/quiz/${quiz._id}`} key={quiz._id} className="block group">
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="h-full"
                                    >
                                        <BorderGlow
                                            borderRadius={48}
                                            backgroundColor="rgba(10, 10, 12, 0.9)"
                                            colors={['#c084fc', '#f472b6', '#38bdf8']}
                                            glowIntensity={1}
                                        >
                                            <div className="p-6 sm:p-10 flex flex-col sm:flex-row items-center justify-between min-h-[140px] sm:min-h-[160px] relative overflow-hidden h-full group/rec">
                                                <div className="absolute inset-0 opacity-[0.03] pointer-events-none group-hover/rec:opacity-[0.06] transition-opacity duration-700" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
                                                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover/rec:opacity-100 transition-opacity duration-500" />

                                                <div className="flex items-center gap-6 sm:gap-10 relative z-10 w-full">
                                                    <div className="w-14 h-14 sm:w-20 sm:h-20 bg-surface-container rounded-2xl sm:rounded-3xl flex items-center justify-center text-on-surface-variant group-hover/rec:editorial-gradient group-hover/rec:text-white transition-all duration-700 shadow-2xl group-hover/rec:scale-105 group-hover/rec:rotate-3 shrink-0">
                                                        <span className="material-symbols-outlined text-2xl sm:text-4xl font-light">psychology</span>
                                                    </div>
                                                    <div className="space-y-4 flex-grow text-left">
                                                        <div className="flex items-center gap-3">
                                                            <span className="w-8 h-[1.5px] bg-primary group-hover/rec:w-full transition-all duration-700" />
                                                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">{quiz.category}</span>
                                                        </div>
                                                        <h4 className="text-2xl md:text-3xl font-black font-headline tracking-tighter text-on-surface leading-none uppercase group-hover/rec:text-white transition-all truncate max-w-[280px]">{quiz.title}</h4>
                                                        <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-[11px] font-black text-on-surface-variant tracking-widest uppercase">
                                                            <div className="flex items-center gap-2 pt-1 font-black whitespace-nowrap">
                                                                <span className="material-symbols-outlined text-[20px] text-primary/60">quiz</span>
                                                                {quiz.questions?.length} Questions
                                                            </div>
                                                            <div className="flex items-center gap-2 pt-1 font-black whitespace-nowrap">
                                                                <span className="material-symbols-outlined text-[20px] text-primary/60">avg_time</span>
                                                                {quiz.timeLimit} Min
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="material-symbols-outlined text-on-surface-variant group-hover/rec:text-primary group-hover/rec:translate-x-3 transition-all duration-500 font-light text-4xl opacity-20 group-hover/rec:opacity-100 shrink-0">bolt</div>
                                                </div>
                                            </div>
                                        </BorderGlow>
                                    </motion.div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <ConfirmModal
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                onConfirm={handleClearHistory}
                title="Wipe Records?"
                message="This will permanently delete your entire quiz history. This action protocol is irreversible."
                confirmText="Confirm Wipe"
                type="danger"
            />
        </div>
    );
};

export default Dashboard;
