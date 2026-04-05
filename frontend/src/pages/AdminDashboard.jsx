import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip
} from 'recharts';
import { getRankByXP, getRankDetails } from '../utils/xpUtils';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import BorderGlow from '../components/animations/BorderGlow';
import RippleGrid from '../components/animations/RippleGrid';
import ConfirmModal from '../components/ConfirmModal';

const StatCard = ({ icon, value, label, color, delay }) => {
    const isLongText = typeof value === 'string' && value.length > 12;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: delay || 0, duration: 0.5 }}
            whileHover={{ y: -8, scale: 1.02 }}
            className="h-full"
        >
            <BorderGlow borderRadius={40} backgroundColor="rgba(10, 10, 12, 0.9)" colors={['#c084fc', '#f472b6', '#38bdf8']} glowIntensity={1}>
                <div className="p-6 sm:p-8 flex flex-col justify-between min-h-[180px] sm:min-h-[220px] h-full relative overflow-hidden group">
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none group-hover:opacity-[0.05] transition-opacity duration-700" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
                    <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[100px] opacity-20 group-hover:opacity-40 transition-opacity duration-700 ${color && color.includes('gradient') ? 'bg-primary' : color}`} />

                    <div className="relative z-10 space-y-4">
                        <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-[1.1rem] flex items-center justify-center ${color || 'bg-white/10'} text-white shadow-2xl group-hover:scale-110 transition-transform duration-500 relative`}>
                            <div className="absolute inset-0 rounded-[1.1rem] bg-white/20 animate-pulse" />
                            <span className="material-symbols-outlined text-xl sm:text-2xl font-light relative z-10">{icon}</span>
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center gap-3">
                                <span className="w-4 h-[1.5px] bg-primary group-hover:w-8 transition-all duration-500" />
                                <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.4em] text-on-surface-variant group-hover:text-white transition-colors">{label}</span>
                            </div>
                            <h4 className={`font-black font-headline tracking-tighter text-on-surface leading-[1.1] line-clamp-2 ${isLongText ? 'text-xl sm:text-2xl mt-1' : 'text-3xl lg:text-4xl'}`}>
                                {value}
                            </h4>
                        </div>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-white/5 to-transparent group-hover:via-primary/30 transition-all duration-700" />
                </div>
            </BorderGlow>
        </motion.div>
    );
};

const AdminDashboard = () => {
    const [isMobile, setIsMobile] = useState(false);
    const [quizzes, setQuizzes] = useState([]);
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeUsersToday: 0,
        totalQuizzes: 0,
        totalAttempts: 0,
        averageScore: 0,
        topCategory: 'N/A',
        dailyAttempts: []
    });
    const [topUsers, setTopUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('quiz');
    const [searchQuery, setSearchQuery] = useState('');
    const { user: currentUser } = useAuth();
    const { showNotification } = useNotification();
    const [confirmConfig, setConfirmConfig] = useState({ isOpen: false });

    const fetchAdminData = async () => {
        try {
            const [quizzesRes, statsRes, usersRes, topUsersRes] = await Promise.all([
                axios.get('/api/quizzes/admin/list'),
                axios.get('/api/admin/stats'),
                axios.get('/api/admin/users'),
                axios.get('/api/admin/top-users')
            ]);
            if (quizzesRes.data) setQuizzes(quizzesRes.data);
            if (statsRes.data) setStats(statsRes.data);
            if (usersRes.data) setUsers(usersRes.data);
            if (topUsersRes.data) {
                const filteredTop = topUsersRes.data.filter(u => u.role !== 'Admin' && u.role !== 'admin');
                setTopUsers(filteredTop);
            }
        } catch (err) {
            console.error('Admin data fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 1024);
        checkMobile();
        window.addEventListener('resize', checkMobile);

        fetchAdminData();
        const interval = setInterval(fetchAdminData, 30000); // Polling every 30s

        return () => {
            clearInterval(interval);
            window.removeEventListener('resize', checkMobile);
        };
    }, []);

    const toggleRole = async (userId, currentRole) => {
        const newRole = currentRole === 'Admin' ? 'User' : 'Admin';
        try {
            const res = await axios.put('/api/admin/users/role', { userId, role: newRole });
            setUsers(prev => prev.map(u => u._id === userId ? res.data : u));
            showNotification(`User role updated to ${newRole}`, 'success');
        } catch (err) {
            showNotification(err.response?.data?.message || 'Role update failed', 'error');
        }
    };

    const handleBan = async (userId) => {
        try {
            const res = await axios.put(`/api/admin/users/${userId}/ban`);
            setUsers(prev => prev.map(u => u._id === userId ? res.data : u));
            showNotification(res.data.isBanned ? 'User banned' : 'User unbanned', 'success');
        } catch (err) {
            showNotification(err.response?.data?.message || 'Ban action failed', 'error');
        }
    };

    const handleResetUser = (userId) => {
        setConfirmConfig({
            isOpen: true,
            title: "Reset Progress?",
            message: "Permanently delete this user's entire history and XP.",
            confirmText: "Reset user",
            onConfirm: async () => {
                try {
                    await axios.delete(`/api/admin/users/${userId}/reset`);
                    fetchAdminData();
                    showNotification('User progress reset', 'success');
                } catch (err) {
                    showNotification('Reset failed', 'error');
                }
            }
        });
    };

    const handleResetLeaderboard = async () => {
        setConfirmConfig({
            isOpen: true,
            title: "Clear Leaderboard?",
            message: "Wipe all leaderboard rankings. This action cannot be undone.",
            confirmText: "Clear Rankings",
            onConfirm: async () => {
                try {
                    await axios.delete('/api/admin/leaderboard/reset');
                    fetchAdminData();
                    showNotification('Leaderboard purged', 'success');
                } catch (err) {
                    showNotification('Global reset failed', 'error');
                }
            }
        });
    };

    const handleDeleteQuiz = (quizId) => {
        setConfirmConfig({
            isOpen: true,
            title: "Destroy Quiz?",
            message: "This will permanently delete the quiz and all associated records.",
            confirmText: "Delete quiz",
            onConfirm: async () => {
                try {
                    await axios.delete(`/api/quizzes/${quizId}`);
                    setQuizzes(prev => prev.filter(q => q._id !== quizId));
                    showNotification('Quiz deleted', 'success');
                } catch (err) {
                    showNotification('Delete failed', 'error');
                }
            }
        });
    };

    const filteredQuizzes = (quizzes || []).filter(q =>
        (q.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (q.category || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredUsers = (users || []).filter(u => {
        const uId = u._id || u.id;
        const currentUserId = currentUser?._id || currentUser?.id;
        const isSelf = String(uId) === String(currentUserId);
        const matchesSearch = (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (u.email || '').toLowerCase().includes(searchQuery.toLowerCase());
        return !isSelf && matchesSearch;
    });

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#050505]">
            <div className="relative w-24 h-24 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="min-h-screen bg-surface pt-24 sm:pt-28 pb-12 sm:pb-20 px-4 sm:px-8 lg:px-24 relative overflow-hidden">
            {/* Interactive Ripple Grid Background */}
            <div className="absolute inset-0 z-[1] pointer-events-none opacity-40">
                {!isMobile ? (
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
                ) : (
                    <div className="absolute inset-0 bg-surface-container/50 backdrop-blur-3xl" />
                )}
            </div>

            <div className="max-w-7xl mx-auto space-y-16 relative z-10 pointer-events-none [&>*]:pointer-events-auto">

                {/* Header */}
                <header className="w-full flex flex-col items-center justify-center gap-10 text-center">
                    <div className="flex flex-col items-center space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="w-8 h-[2px] bg-primary"></span>
                            <span className="text-primary font-headline font-black tracking-[0.5em] text-[10px] sm:text-xs md:text-sm uppercase block">Admin Control</span>
                        </div>
                        <h2 className="text-3xl sm:text-4xl md:text-6xl font-black font-headline tracking-tighter text-on-surface leading-none text-center">
                            System <br /><span className="gradient-text italic px-2">Management</span>.
                        </h2>
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 w-full md:w-auto">
                        <button onClick={handleResetLeaderboard} className="flex-1 md:flex-none px-6 sm:px-8 py-3 sm:py-4 bg-error/10 border border-error/20 text-error rounded-xl sm:rounded-2xl font-black text-[9px] sm:text-[10px] uppercase tracking-widest hover:bg-error hover:text-white transition-all">
                            Reset Leaderboard
                        </button>
                        <Link to="/admin/quiz/create" className="flex-1 md:flex-none px-6 sm:px-8 py-3 sm:py-4 editorial-gradient text-white rounded-xl sm:rounded-2xl font-black text-[9px] sm:text-[10px] uppercase tracking-widest shadow-xl hover:scale-105 transition-all text-center">
                            Create Quiz
                        </Link>
                    </div>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    <StatCard icon="groups" value={(stats.totalUsers || 0).toLocaleString()} label="Total Users" color="editorial-gradient" />
                    <StatCard icon="bolt" value={(stats.activeUsersToday || 0).toLocaleString()} label="Active Today" color="bg-primary/80" />
                    <StatCard icon="library_books" value={(stats.totalQuizzes || 0).toLocaleString()} label="Total Quizzes" color="bg-white/10" />
                    <StatCard icon="analytics" value={(stats.totalAttempts || 0).toLocaleString()} label="Total Attempts" color="bg-white/10" />
                    <StatCard icon="star" value={`${Number(stats.averageScore || 0).toFixed(1)}%`} label="Average Score" color="bg-white/10" />
                    <StatCard icon="category" value={stats.topCategory || 'N/A'} label="Top Category" color="bg-white/10" />
                </div>

                {/* Charts & Snapshots */}
                <div className="grid lg:grid-cols-[1.5fr_1fr] gap-10">
                    {/* Graph */}
                    <BorderGlow borderRadius={56} backgroundColor="rgba(10, 10, 12, 0.9)" colors={['#c084fc', '#f472b6', '#38bdf8']} glowIntensity={1}>
                        <div className="p-6 sm:p-10 min-h-[350px] sm:min-h-[400px]">
                            <h3 className="text-lg sm:text-xl font-black font-headline uppercase tracking-widest text-on-surface mb-6 sm:mb-10 text-left">Daily Activity</h3>
                            <div className="h-[250px] sm:h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={stats.dailyAttempts || []}>
                                        <defs>
                                            <linearGradient id="colorAttempts" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} />
                                        <Tooltip contentStyle={{ backgroundColor: '#0a0a0c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem' }} />
                                        <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorAttempts)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </BorderGlow>

                    {/* Snapshot */}
                    <BorderGlow borderRadius={56} backgroundColor="rgba(10, 10, 12, 0.9)" colors={['#c084fc', '#f472b6', '#38bdf8']} glowIntensity={1}>
                        <div className="p-8 sm:p-10 h-full">
                            <h3 className="text-lg sm:text-xl font-black font-headline uppercase tracking-widest text-on-surface mb-8 sm:mb-10 text-left">Top Users</h3>
                            <div className="space-y-4">
                                {(topUsers || []).slice(0, 5).map((user, idx) => (
                                    <div key={user._id || idx} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                                        <div className="flex items-center gap-4">
                                            <span className="text-xs font-black text-on-surface-variant w-4">{idx + 1}</span>
                                            <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 shrink-0 shadow-lg">
                                                {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full editorial-gradient rounded-full flex items-center justify-center text-xs font-black text-white">{(user.name || 'U')[0]}</div>}
                                            </div>
                                            <div className="text-left">
                                                <p className="text-xs font-black text-on-surface leading-none mb-1 truncate max-w-[100px]">{user.name || 'Anonymous'}</p>
                                                <div className="flex items-center gap-1">
                                                    <img src={getRankDetails(user.xp || 0).badge} alt={getRankByXP(user.xp || 0)} className="w-5 h-5 object-contain" />
                                                    <p className="text-[8px] font-black uppercase text-primary tracking-widest">{getRankByXP(user.xp || 0)}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right flex flex-col items-end">
                                            <div className="flex items-baseline gap-1">
                                                <p className="text-xs font-black text-primary">{(user.xp || 0).toLocaleString()}</p>
                                                <p className="text-[8px] font-black text-on-surface-variant uppercase">XP</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </BorderGlow>
                </div>

                {/* Tabs & Search */}
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6 pt-8">
                    <div className="flex gap-2 sm:gap-4 p-1.5 sm:p-2 bg-white/5 rounded-2xl border border-white/5 overflow-x-auto no-scrollbar">
                        <button onClick={() => setActiveTab('quiz')} className={`flex-1 sm:flex-none px-6 sm:px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'quiz' ? 'bg-primary text-white shadow-lg' : 'text-on-surface-variant'}`}>
                            Quizzes
                        </button>
                        <button onClick={() => setActiveTab('users')} className={`flex-1 sm:flex-none px-6 sm:px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'users' ? 'bg-primary text-white shadow-lg' : 'text-on-surface-variant'}`}>
                            Users
                        </button>
                    </div>
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full md:max-w-sm bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-black outline-none focus:border-primary/50 transition-all text-on-surface"
                    />
                </div>

                {/* Tab Content */}
                <AnimatePresence mode="wait">
                    {activeTab === 'quiz' ? (
                        <motion.div key="q" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                            {filteredQuizzes.map(quiz => (
                                <BorderGlow borderRadius={40} backgroundColor="rgba(10, 10, 12, 0.9)" colors={['#c084fc', '#f472b6', '#38bdf8']} glowIntensity={1}>
                                    <div className="p-6 sm:p-8 flex items-center justify-between group hover:bg-white/10 transition-all text-left gap-4 h-full">
                                        <div className="flex items-center gap-4 sm:gap-6 overflow-hidden">
                                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/5 rounded-xl sm:rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shrink-0">
                                                <span className="material-symbols-outlined text-2xl sm:text-3xl">{(quiz.category || 'Q')[0]}</span>
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="text-base sm:text-lg font-black text-on-surface mb-1 truncate">{quiz.title || 'Untitled'}</h4>
                                                <p className="text-[9px] sm:text-[10px] font-black uppercase text-primary tracking-widest truncate">{quiz.category || 'General'}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 relative z-20">
                                            <Link to={`/admin/quiz/edit/${quiz._id}`} className="p-2 sm:p-3 bg-white/5 rounded-xl border border-white/5 text-on-surface-variant hover:text-primary transition-all pointer-events-auto">
                                                <span className="material-symbols-outlined text-base sm:text-lg">edit</span>
                                            </Link>
                                            <button onClick={() => handleDeleteQuiz(quiz._id)} className="p-2 sm:p-3 bg-white/5 rounded-xl border border-white/5 text-on-surface-variant hover:text-error transition-all pointer-events-auto">
                                                <span className="material-symbols-outlined text-base sm:text-lg">delete</span>
                                            </button>
                                        </div>
                                    </div>
                                </BorderGlow>
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div key="u" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid md:grid-cols-2 gap-8">
                            {filteredUsers.map(user => (
                                <BorderGlow borderRadius={40} backgroundColor="rgba(10, 10, 12, 0.9)" colors={['#c084fc', '#f472b6', '#38bdf8']} glowIntensity={1}>
                                    <div className="p-8 flex flex-col gap-6 group hover:bg-white/10 transition-all text-left h-full">
                                        <div className="flex items-center gap-6">
                                            <div className="w-14 h-14 rounded-full overflow-hidden border border-white/10 shrink-0 shadow-xl">
                                                {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full editorial-gradient rounded-full flex items-center justify-center text-lg font-black text-white">{(user.name || 'U')[0]}</div>}
                                            </div>
                                            <div className="min-w-0 flex-grow">
                                                <h4 className="text-lg font-black text-on-surface leading-none mb-1 truncate">{user.name || 'Anonymous'}</h4>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded bg-primary/10 text-primary`}>{user.role}</span>
                                                    {user.isBanned && <span className="text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded bg-error/20 text-error">Banned</span>}
                                                    {(user.role === 'User' || user.role === 'user') && (
                                                        <div className="flex items-center gap-1.5 bg-white/5 py-1 px-2 rounded-lg border border-white/5">
                                                            <img src={getRankDetails(user.xp || 0).badge} alt={getRankByXP(user.xp || 0)} className="w-4 h-4 object-contain" />
                                                            <span className="text-[8px] font-black uppercase tracking-[0.2em] opacity-60" style={{ color: getRankDetails(user.xp || 0).color }}>{getRankByXP(user.xp || 0)}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-3 relative z-20">
                                            <button onClick={() => toggleRole(user._id, user.role)} className="p-3 rounded-xl bg-white/5 border border-white/5 text-[9px] font-black uppercase tracking-widest hover:bg-primary/20 hover:text-primary transition-all pointer-events-auto">Change Role</button>
                                            <button onClick={() => handleBan(user._id)} className="p-3 rounded-xl bg-white/5 border border-white/5 text-[9px] font-black uppercase tracking-widest hover:bg-error/20 hover:text-error transition-all pointer-events-auto">{user.isBanned ? 'Unban' : 'Ban'}</button>
                                            <button onClick={() => handleResetUser(user._id)} className="p-3 rounded-xl bg-white/5 border border-white/5 text-[9px] font-black uppercase tracking-widest hover:bg-primary/20 hover:text-primary transition-all pointer-events-auto">Reset</button>
                                        </div>
                                    </div>
                                </BorderGlow>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>

            <ConfirmModal
                isOpen={confirmConfig.isOpen}
                onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
                onConfirm={confirmConfig.onConfirm}
                title={confirmConfig.title}
                message={confirmConfig.message}
                confirmText={confirmConfig.confirmText}
                type="danger"
            />
        </div>
    );
};

export default AdminDashboard;
