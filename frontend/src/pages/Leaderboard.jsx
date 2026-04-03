import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { getRankByXP, getRankDetails } from '../utils/xpUtils';
import SoftAurora from '../components/animations/SoftAurora';
import BorderGlow from '../components/animations/BorderGlow';

const Leaderboard = () => {
    const { currentUser } = useAuth();
    const [leaders, setLeaders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [timeframe, setTimeframe] = useState('Monthly');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    useEffect(() => {
        const fetchLeaders = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`/api/users/leaderboard?timeframe=${timeframe}`);
                const realData = res.data || [];
                const processed = realData
                    .sort((a, b) => (b.xp || 0) - (a.xp || 0))
                    .filter(user => user && user.role !== 'admin' && user.role !== 'Admin');
                setLeaders(processed);
            } catch (err) {
                console.error('Leaderboard Fetch Error:', err);
                setLeaders([]);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaders();
    }, [timeframe]);

    // ABSOLUTE PERSISTENCE: Podium Data only cares about the raw database leaderboard
    const podiumData = (leaders || []).slice(0, 3);

    // FILTERED UNIVERSAL LIST: Search entire list starting from Rank 1
    const filteredAll = (leaders || []).filter(l =>
        l && l.name && l.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Pagination for the filtered results
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const pagedItems = filteredAll.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredAll.length / itemsPerPage);

    // FIXED HEIGHT GRID: Always 5 rows
    const displayItems = [...pagedItems, ...Array(Math.max(0, itemsPerPage - pagedItems.length)).fill(null)];

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-surface relative overflow-hidden">
            <div className="absolute inset-0 z-0 opacity-30">
                <SoftAurora speed={0.4} />
            </div>
            <div className="relative z-10 flex flex-col items-center gap-6">
                <div className="relative w-24 h-24">
                    <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
                    <div className="relative w-full h-full border-4 border-white/5 border-t-primary rounded-full animate-spin"></div>
                </div>
                <p className="text-on-surface-variant font-black uppercase tracking-[0.4em] text-[10px] animate-pulse">Syncing Ranks...</p>
            </div>
        </div>
    );

    return (
        <div className="bg-surface text-on-surface min-h-screen flex flex-col pt-20 relative overflow-hidden">
            <div className="absolute inset-0 z-0 pointer-events-none">
                <SoftAurora speed={0.6} scale={1.5} brightness={1} color1="#f7f7f7" color2="#e100ff" noiseFrequency={2.5} noiseAmplitude={1} bandHeight={0.5} bandSpread={1} octaveDecay={0.1} layerOffset={0} colorSpeed={1} enableMouseInteraction={true} mouseInfluence={0.25} />
            </div>

            <main className="flex-grow relative z-10 pointer-events-none [&>*]:pointer-events-auto">
                <section className="max-w-7xl mx-auto px-6 sm:px-8 py-8 md:py-12">
                    <div className="w-full flex flex-col items-center justify-center gap-10 mb-12 md:mb-20 text-center">
                        <div className="max-w-2xl px-4 sm:px-0 flex flex-col items-center">
                            <span className="text-primary font-headline font-black tracking-[0.5em] text-[10px] sm:text-xs md:text-sm uppercase mb-6 block">hall of fame</span>
                            <h1 className="text-4xl md:text-7xl font-extrabold tracking-tighter text-on-surface mb-6 font-headline uppercase leading-none text-center">Global <br /><span className="gradient-text italic px-2">Rankings</span></h1>
                            <p className="text-on-surface-variant text-sm md:text-lg leading-relaxed font-body font-medium max-w-xl mx-auto opacity-70">The top scholars are fixed at the top. Search below to find anyone else in the ranks.</p>
                        </div>
                        <div className="flex items-center gap-2 bg-surface-container-high p-1.5 rounded-full shadow-inner border border-white/5 mx-auto md:mx-0 w-full max-w-[320px] sm:max-w-[440px]">
                            {['Weekly', 'Monthly', 'All Time'].map((t) => (
                                <button key={t} onClick={() => setTimeframe(t)} className={`flex-1 py-3 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all duration-300 ${timeframe === t ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5'}`}>{t}</button>
                            ))}
                        </div>
                    </div>

                    {/* HALL OF FAME: Always Renders Based on true database leaders */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 items-center lg:items-end gap-12 lg:gap-0 max-w-5xl mx-auto mb-20 px-4 mt-8 md:mt-12">
                        {/* Rank 2 - Silver (Order 2 on mobile, 1 on desktop) */}
                        <div className="flex flex-col items-center order-2 lg:order-1 lg:translate-x-6">
                            <div className="relative group mb-4">
                                <BorderGlow borderRadius={100} backgroundColor="rgba(15, 15, 20, 0.4)" colors={['#ffffff', '#e2e8f0', '#94a3b8']} glowIntensity={0.5}>
                                    <div className="w-28 h-28 lg:w-32 lg:h-32 rounded-full overflow-hidden border-2 border-white p-1 relative z-10 transition-transform group-hover:scale-105">
                                        {podiumData[1]?.avatar ? <img className="w-full h-full object-cover rounded-full" src={podiumData[1].avatar} alt={podiumData[1].name} /> : <div className="w-full h-full flex items-center justify-center font-bold text-white editorial-gradient rounded-full text-3xl">{podiumData[1]?.name?.[0] || '?'}</div>}
                                    </div>
                                </BorderGlow>
                                <div className="absolute right-0 bottom-0 w-10 h-10 bg-gradient-to-br from-white via-blue-50 to-slate-300 rounded-full flex items-center justify-center border-4 border-surface shadow-[0_0_20px_rgba(255,255,255,0.4)] z-20">
                                    <span className="text-slate-900 font-headline font-black text-sm">2</span>
                                </div>
                            </div>
                            <div className="text-center p-6 sm:p-8 rounded-[40px] bg-white/5 border border-white/10 backdrop-blur-md w-full max-w-[240px] shadow-lg group-hover:bg-white/[0.08] transition-all flex flex-col items-center">
                                <img src={getRankDetails(podiumData[1]?.xp || 0).badge} alt={getRankByXP(podiumData[1]?.xp || 0)} className="w-24 h-24 sm:w-28 sm:h-28 object-contain mb-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] group-hover:scale-110 transition-transform duration-700" />
                                <p className="font-headline font-black text-on-surface truncate text-lg sm:text-xl mb-1">{podiumData[1]?.name || 'Scholar'}</p>
                                <p className="font-headline font-black text-primary text-xl sm:text-2xl">{(podiumData[1]?.xp || 0).toLocaleString()} <span className="text-[10px] font-medium opacity-60 uppercase tracking-widest">PTS</span></p>
                            </div>
                        </div>

                        {/* Rank 1 - Golden (Order 1 on mobile, 2 on desktop) */}
                        <div className="flex flex-col items-center order-1 lg:order-2 z-20">
                            <div className="relative group mb-6">
                                <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                                    <span className="material-symbols-outlined text-yellow-400 text-3xl drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]">workspace_premium</span>
                                </div>
                                <BorderGlow borderRadius={100} backgroundColor="rgba(15, 15, 20, 0.4)" colors={['#FCD34D', '#F59E0B', '#fbbf24']} glowIntensity={0.6}>
                                    <div className="w-36 h-36 lg:w-44 lg:h-44 rounded-full overflow-hidden border-4 border-yellow-300 p-1 relative z-10 shadow-2xl group-hover:scale-105 transition-transform">
                                        {podiumData[0]?.avatar ? <img className="w-full h-full object-cover rounded-full" src={podiumData[0].avatar} alt={podiumData[0].name} /> : <div className="w-full h-full flex items-center justify-center font-bold text-white leading-none editorial-gradient rounded-full text-5xl">{podiumData[0]?.name?.[0] || '?'}</div>}
                                    </div>
                                </BorderGlow>
                                <div className="absolute -right-2 bottom-0 w-12 h-12 bg-gradient-to-br from-yellow-200 via-yellow-400 to-amber-500 rounded-full flex items-center justify-center border-4 border-surface shadow-[0_0_20px_rgba(251,191,36,0.4)] z-20">
                                    <span className="text-yellow-950 font-headline font-black text-base">1</span>
                                </div>
                            </div>
                            <div className="text-center p-8 sm:p-10 rounded-[50px] bg-white/10 border border-white/20 backdrop-blur-xl shadow-2xl w-full max-w-[280px] group-hover:bg-white/15 transition-all flex flex-col items-center scale-110">
                                <img src={getRankDetails(podiumData[0]?.xp || 0).badge} alt={getRankByXP(podiumData[0]?.xp || 0)} className="w-32 h-32 sm:w-40 sm:h-40 object-contain mb-4 drop-shadow-[0_0_20px_rgba(250,204,21,0.5)] group-hover:scale-110 transition-transform duration-700" />
                                <p className="font-headline font-black text-on-surface text-2xl sm:text-3xl mb-1 truncate">{podiumData[0]?.name || 'Leader'}</p>
                                <p className="font-headline font-black text-primary text-3xl sm:text-4xl">{(podiumData[0]?.xp || 0).toLocaleString()} <span className="text-sm font-medium opacity-60 uppercase tracking-widest">PTS</span></p>
                            </div>
                        </div>

                        {/* Rank 3 - Bronze (Order 3 on mobile, 3 on desktop) */}
                        <div className="flex flex-col items-center order-3 lg:order-3 lg:-translate-x-6">
                            <div className="relative group mb-4">
                                <BorderGlow borderRadius={100} backgroundColor="rgba(15, 15, 20, 0.4)" colors={['#fb923c', '#ea580c', '#9a3412']} glowIntensity={0.3}>
                                    <div className="w-28 h-28 lg:w-32 lg:h-32 rounded-full overflow-hidden border-2 border-orange-400 p-1 relative z-10 transition-transform group-hover:scale-105">
                                        {podiumData[2]?.avatar ? <img className="w-full h-full object-cover rounded-full" src={podiumData[2].avatar} alt={podiumData[2].name} /> : <div className="w-full h-full flex items-center justify-center font-bold text-white editorial-gradient rounded-full text-3xl">{podiumData[2]?.name?.[0] || '?'}</div>}
                                    </div>
                                </BorderGlow>
                                <div className="absolute right-0 bottom-0 w-10 h-10 bg-gradient-to-br from-orange-300 via-orange-500 to-orange-700 rounded-full flex items-center justify-center border-4 border-surface shadow-[0_0_15px_rgba(249,115,22,0.3)] z-20">
                                    <span className="text-orange-950 font-headline font-black text-sm">3</span>
                                </div>
                            </div>
                            <div className="text-center p-6 sm:p-8 rounded-[40px] bg-white/5 border border-white/10 backdrop-blur-md w-full max-w-[240px] shadow-lg group-hover:bg-white/[0.08] transition-all flex flex-col items-center">
                                <img src={getRankDetails(podiumData[2]?.xp || 0).badge} alt={getRankByXP(podiumData[2]?.xp || 0)} className="w-24 h-24 sm:w-28 sm:h-28 object-contain mb-4 drop-shadow-[0_0_15px_rgba(249,115,22,0.2)] group-hover:scale-110 transition-transform duration-700" />
                                <p className="font-headline font-black text-on-surface truncate text-lg sm:text-xl mb-1">{podiumData[2]?.name || 'Scholar'}</p>
                                <p className="font-headline font-black text-primary text-xl sm:text-2xl">{(podiumData[2]?.xp || 0).toLocaleString()} <span className="text-[10px] font-medium opacity-60 uppercase tracking-widest">PTS</span></p>
                            </div>
                        </div>
                    </div>

                    <div className="max-w-6xl mx-auto px-4">
                        <BorderGlow borderRadius={32} backgroundColor="rgba(25, 25, 30, 0.4)" colors={['#c084fc', '#f472b6', '#38bdf8']} glowIntensity={0.2} className="w-full overflow-hidden shadow-2xl border border-white/5">
                            <div className="relative">
                                <div className="flex flex-col items-center text-center gap-2 mb-10 px-8 pt-8">
                                    <h2 className="text-3xl font-black text-white italic tracking-tight font-headline">RANKING LIST</h2>
                                    <p className="text-on-surface-variant font-medium text-xs tracking-widest uppercase opacity-60">Search the entire scholar database</p>
                                </div>
                                <div className="overflow-hidden min-h-[500px] relative">
                                    <table className="w-full border-collapse">
                                        <thead>
                                            <tr className="bg-white/5">
                                                <th className="px-4 sm:px-8 py-5 text-left text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em]">Rank</th>
                                                <th className="px-4 sm:px-8 py-5 text-left text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em]">Player</th>
                                                <th className="px-4 sm:px-8 py-5 text-center text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] hidden sm:table-cell">Rank Title</th>
                                                <th className="px-4 sm:px-8 py-5 text-right text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em]">Total XP</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {displayItems.map((u, i) => {
                                                if (!u) return (
                                                    <tr key={`empty-${i}`} className="h-[96px] opacity-0 transition-none"><td colSpan="4"></td></tr>
                                                );
                                                const originalRank = leaders.findIndex(l => l._id === u._id) + 1;
                                                return (
                                                    <tr key={u._id} className="hover:bg-white/5 transition-all group h-[96px]">
                                                        <td className="px-4 sm:px-8 py-4 sm:py-6 font-headline font-bold text-base sm:text-lg text-white/20 group-hover:text-primary transition-colors">{originalRank}</td>
                                                        <td className="px-4 sm:px-8 py-4 sm:py-6">
                                                            <div className="flex items-center gap-3 sm:gap-4">
                                                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden flex-shrink-0 bg-white/5 border border-white/10 shadow-sm group-hover:shadow-md transition-all">
                                                                    {u.avatar ? <img className="w-full h-full object-cover" src={u.avatar} alt={u.name} /> : <div className="w-full h-full flex items-center justify-center font-bold text-white editorial-gradient rounded-full text-sm">{u.name[0]}</div>}
                                                                </div>
                                                                <div className="flex flex-col">
                                                                    <p className="font-bold text-on-surface font-body group-hover:text-white truncate max-w-[100px] sm:max-w-none">{u.name}</p>
                                                                    <div className="sm:hidden flex items-center gap-1">
                                                                        <img src={getRankDetails(u.xp).badge} alt={getRankByXP(u.xp)} className="w-5 h-5 object-contain" />
                                                                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-60" style={{ color: getRankDetails(u.xp).color }}>{getRankByXP(u.xp)}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 sm:px-8 py-4 sm:py-6 text-center hidden sm:table-cell">
                                                            <div className="flex flex-col items-center gap-1 group/badge transition-transform hover:scale-110">
                                                                <img src={getRankDetails(u.xp).badge} alt={getRankByXP(u.xp)} className="w-12 h-12 sm:w-14 sm:h-14 object-contain drop-shadow-md" />
                                                                <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80" style={{ color: getRankDetails(u.xp).color }}>{getRankByXP(u.xp)}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 sm:px-8 py-4 sm:py-6 text-right font-headline font-extrabold text-on-surface text-lg sm:text-xl group-hover:text-primary transition-colors">{(u.xp || 0).toLocaleString()}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                    {filteredAll.length === 0 && (
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <div className="flex flex-col items-center gap-4 opacity-40">
                                                <span className="material-symbols-outlined text-4xl">search_off</span>
                                                <p className="text-sm font-black uppercase tracking-widest leading-loose font-headline text-center">No scholars found <br /><span className="text-[10px] font-medium tracking-[0.3em] font-body opacity-50">Try checking the spelling</span></p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="px-8 py-6 bg-white/5 flex flex-col sm:flex-row justify-between items-center gap-6">
                                    <div className="relative w-full max-w-xs">
                                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">search</span>
                                        <input value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} className="bg-surface-container-high border-white/10 border rounded-2xl pl-12 pr-6 py-3 text-sm focus:ring-2 focus:ring-primary w-full shadow-sm text-on-surface placeholder-on-surface-variant/30 outline-none" placeholder="Search for name..." type="text" />
                                    </div>
                                    {totalPages > 1 && (
                                        <div className="flex items-center justify-center gap-2 overflow-x-auto no-scrollbar pb-2 sm:pb-0 max-w-full">
                                            <button
                                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                                disabled={currentPage === 1}
                                                className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-white/5 text-on-surface-variant disabled:opacity-20 transition-all active:scale-90"
                                            >
                                                <span className="material-symbols-outlined text-sm">chevron_left</span>
                                            </button>

                                            {(() => {
                                                const pages = [];
                                                const maxVisible = 5;
                                                if (totalPages <= maxVisible) {
                                                    for (let i = 1; i <= totalPages; i++) pages.push(i);
                                                } else {
                                                    pages.push(1);
                                                    if (currentPage > 3) pages.push('...');
                                                    const start = Math.max(2, currentPage - 1);
                                                    const end = Math.min(totalPages - 1, currentPage + 1);
                                                    for (let i = start; i <= end; i++) {
                                                        if (!pages.includes(i)) pages.push(i);
                                                    }
                                                    if (currentPage < totalPages - 2) pages.push('...');
                                                    if (!pages.includes(totalPages)) pages.push(totalPages);
                                                }
                                                return pages.map((p, i) => (
                                                    p === '...' ? (
                                                        <span key={`ellipsis-${i}`} className="w-8 text-center text-on-surface-variant/30 font-black">···</span>
                                                    ) : (
                                                        <button
                                                            key={p}
                                                            onClick={() => setCurrentPage(p)}
                                                            className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all ${currentPage === p ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-110' : 'hover:bg-white/5 text-on-surface-variant'}`}
                                                        >
                                                            {p}
                                                        </button>
                                                    )
                                                ));
                                            })()}

                                            <button
                                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                                disabled={currentPage === totalPages}
                                                className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-white/5 text-on-surface-variant disabled:opacity-20 transition-all active:scale-90"
                                            >
                                                <span className="material-symbols-outlined text-sm">chevron_right</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </BorderGlow>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Leaderboard;
