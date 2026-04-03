export const getRankByXP = (xp) => {
    if (xp >= 15000) return 'Legend';
    if (xp >= 9000) return 'Grandmaster';
    if (xp >= 5000) return 'Master';
    if (xp >= 2000) return 'Expert';
    if (xp >= 800) return 'Challenger';
    if (xp >= 300) return 'Explorer';
    return 'Rookie';
};

export const getRankDetails = (xp) => {
    if (xp >= 15000) return { rank: 'Legend', nextXP: null, prevXP: 15000, color: '#f59e0b', badge: '/ranks/legend.png' };
    if (xp >= 9000) return { rank: 'Grandmaster', nextXP: 15000, prevXP: 9000, color: '#ef4444', badge: '/ranks/grandmaster.png' };
    if (xp >= 5000) return { rank: 'Master', nextXP: 9000, prevXP: 5000, color: '#a855f7', badge: '/ranks/master.png' };
    if (xp >= 2000) return { rank: 'Expert', nextXP: 5000, prevXP: 2000, color: '#3b82f6', badge: '/ranks/expert.png' };
    if (xp >= 800) return { rank: 'Challenger', nextXP: 2000, prevXP: 800, color: '#10b981', badge: '/ranks/challenger.png' };
    if (xp >= 300) return { rank: 'Explorer', nextXP: 800, prevXP: 300, color: '#6366f1', badge: '/ranks/explorer.png' };
    return { rank: 'Rookie', nextXP: 300, prevXP: 0, color: '#94a3b8', badge: '/ranks/rookie.png' };
};

export const getRankProgress = (xp) => {
    const details = getRankDetails(xp);
    if (!details.nextXP) return 100;
    const range = details.nextXP - details.prevXP;
    const progress = ((xp - details.prevXP) / range) * 100;
    return Math.min(100, Math.max(0, progress));
};
