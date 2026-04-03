import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import ScrollVelocity from '../components/animations/ScrollVelocity';
import RotatingText from '../components/animations/RotatingText';
import LiquidEther from '../components/animations/LiquidEther';
import BorderGlow from '../components/animations/BorderGlow';

const HeroIllustration = () => (
    <div className="relative w-full aspect-square flex items-center justify-center translate-y-10 lg:translate-y-0 scale-100 lg:scale-125">
        {/* Illustrations sit above the section background */}

        {/* Central Core */}
        <motion.div
            animate={{ scale: [1, 1.05, 1], rotate: [0, 5, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="relative z-20 w-64 h-64 bg-surface-container/30 backdrop-blur-3xl rounded-[3rem] border border-white/10 shadow-3xl shadow-black/80 flex items-center justify-center"
        >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent rounded-[3rem]"></div>
            <span className="material-symbols-outlined text-primary text-8xl drop-shadow-[0_0_20px_rgba(var(--color-primary-rgb),0.5)]">bolt</span>

            {/* Orbiting particles */}
            {[...Array(6)].map((_, i) => (
                <motion.div
                    key={i}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 12 + i * 3, repeat: Infinity, ease: "linear" }}
                    className="absolute inset--20 border border-white/5 rounded-full"
                    style={{ padding: i * 20 }}
                >
                    <div className="w-1.5 h-1.5 bg-primary rounded-full absolute top-0 left-1/2 -translate-x-1/2 blur-[1px]"></div>
                </motion.div>
            ))}
        </motion.div>

        {/* Floating Quiz Question Card */}
        <motion.div
            animate={{ y: [0, -30, 0], x: [0, -15, 0], rotate: [5, 8, 5] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-10 right-8 w-72 bg-surface-container/60 backdrop-blur-2xl p-6 rounded-3xl border border-white/10 shadow-2xl z-30 flex flex-col gap-3"
        >
            <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
                <p className="text-[10px] font-black uppercase tracking-widest text-primary">Live Quiz</p>
            </div>
            <p className="text-sm font-bold text-on-surface leading-snug">What is the capital of France?</p>
            <div className="flex flex-col gap-2 mt-1">
                <div className="w-full h-9 bg-white/5 rounded-lg border border-white/5 flex items-center px-4 text-[11px] font-bold text-on-surface/50">Lyon</div>
                <div className="w-full h-9 bg-primary/20 rounded-lg border border-primary/20 flex items-center px-4 text-[11px] font-black text-primary relative">
                    <span className="pr-6">Paris</span>
                    <span className="material-symbols-outlined text-sm absolute right-4 top-1/2 -translate-y-1/2">check_circle</span>
                </div>
            </div>
        </motion.div>

        {/* Floating Metrics Badge */}
        <motion.div
            animate={{ y: [0, -30, 0], x: [0, -15, 0], rotate: [-10, -15, -10] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-12 left-4 w-60 bg-surface-container/60 backdrop-blur-2xl p-6 rounded-2xl border border-white/10 shadow-2xl z-40 flex items-center gap-4"
        >
            <div className="w-12 h-12 rounded-xl editorial-gradient flex items-center justify-center text-white shadow-xl">
                <span className="material-symbols-outlined">trending_up</span>
            </div>
            <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant">Accuracy</p>
                <div className="flex items-baseline gap-1">
                    <p className="text-lg font-black text-on-surface">96.4</p>
                    <p className="text-[10px] font-bold text-primary">%</p>
                </div>
                <div className="w-full h-1 bg-white/5 rounded-full mt-2 overflow-hidden">
                    <motion.div
                        animate={{ width: ["0%", "96.4%", "96.4%"] }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                        className="h-full bg-primary shadow-[0_0_8px_rgba(var(--color-primary-rgb),0.5)]"
                    />
                </div>
            </div>
        </motion.div>

        {/* Abstract decorative lines */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent rotate-[30deg] pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent rotate-[-30deg] pointer-events-none"></div>
    </div>
);

const FeatureCard = ({ quiz }) => {
    const navigate = useNavigate();
    return (
        <motion.div
            whileHover={{ y: -8, scale: 1.02 }}
            className="h-full"
        >
            <BorderGlow
                borderRadius={32}
                backgroundColor="rgba(10, 10, 12, 0.9)"
                className="h-full cursor-pointer"
                glowColor="40 80 80"
                glowIntensity={0.8}
            >
                <div
                    className="p-6 sm:p-8 flex flex-col gap-4 h-full relative"
                    onClick={() => navigate(`/quiz/${quiz._id}`)}
                >
                    {/* Glossy background gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    <div className="relative z-10 flex flex-col gap-4 h-full font-headline uppercase">
                        <div className="flex items-center justify-between">
                            <p className="text-[9px] font-black tracking-widest text-primary bg-primary/10 px-2.5 py-1 rounded-full">{quiz.category || 'General'}</p>
                            <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
                        </div>

                        <h3 className="text-xl sm:text-2xl font-black text-on-surface leading-[1.05] tracking-tighter uppercase min-h-[2.5rem] line-clamp-2">
                            {quiz.title}
                        </h3>

                        <div className="flex flex-wrap gap-2 text-[9px] items-center font-black tracking-widest text-on-surface-variant">
                            <div className="flex items-center gap-1.5 bg-on-surface/5 px-2 py-1 rounded-lg">
                                <span className="material-symbols-outlined text-[14px]">menu_book</span>
                                {quiz.questions?.length} Q
                            </div>
                            <div className="flex items-center gap-1.5 bg-on-surface/5 px-2 py-1 rounded-lg">
                                <span className="material-symbols-outlined text-[14px]">timer</span>
                                {quiz.timeLimit} M
                            </div>
                        </div>

                        <p className="text-[11px] font-medium leading-relaxed italic text-on-surface-variant opacity-60 flex-grow normal-case tracking-tight line-clamp-2">
                            {quiz.description || `Interactive ${quiz.category} quiz.`}
                        </p>

                        <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-auto">
                            <span className="text-[9px] font-black tracking-widest text-on-surface/70">
                                Start
                            </span>
                            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5">
                                <span className="material-symbols-outlined text-base">arrow_forward</span>
                            </div>
                        </div>
                    </div>
                </div>
            </BorderGlow>
        </motion.div>
    );
};

const Landing = () => {
    const [isMobile, setIsMobile] = useState(false);
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [platformStats, setPlatformStats] = useState({ totalUsers: 340, totalQuizzes: 12, totalAttempts: 560, totalXP: 48000 });

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 1024);
        checkMobile();
        window.addEventListener('resize', checkMobile);

        const fetchQuizzes = async () => {
            setLoading(true);
            try {
                const [quizRes, statsRes] = await Promise.all([
                    axios.get('/api/quizzes'),
                    axios.get('/api/quizzes/public/stats').catch(() => ({ data: null }))
                ]);

                if (quizRes.data) setQuizzes(quizRes.data.slice(0, 4));
                if (statsRes.data) setPlatformStats(statsRes.data);
            } catch (err) {
                console.error("Failed to fetch landing data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchQuizzes();
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return (
        <div className="min-h-screen pt-16 sm:pt-20 overflow-x-hidden bg-surface">
            {/* Hero Section */}
            <section className="relative min-h-[90vh] flex items-center px-4 sm:px-8 lg:px-24 pt-12 sm:pt-20 pb-16 sm:pb-24 overflow-hidden">
                {/* Dynamic Liquid Ether Background - Hero Only */}
                <div className="absolute inset-0 z-[1] pointer-events-none">
                    {!isMobile ? (
                        <LiquidEther
                            colors={['#5227FF', '#FF9FFC', '#B19EEF']}
                            mouseForce={20}
                            cursorSize={100}
                            isViscous={true}
                            viscous={30}
                            iterationsViscous={16}
                            iterationsPoisson={16}
                            resolution={0.4}
                            isBounce={false}
                            autoDemo={true}
                            autoSpeed={0.5}
                            autoIntensity={2.2}
                            takeoverDuration={0.25}
                            autoResumeDelay={3000}
                            autoRampDuration={0.6}
                            color0="#5227FF"
                            color1="#FF9FFC"
                            color2="#B19EEF"
                        />
                    ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10 backdrop-blur-3xl opacity-50" />
                    )}
                </div>
                {/* Subtle Background Atmosphere Overlays */}
                <div className="absolute top-1/4 -left-20 w-[600px] h-[600px] bg-primary/10 blur-[150px] rounded-full pointer-events-none"></div>
                <div className="absolute bottom-1/4 -right-20 w-[600px] h-[600px] bg-indigo-500/10 blur-[150px] rounded-full pointer-events-none"></div>

                <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-[1.1fr_0.9fr] gap-20 items-center relative z-[10]">
                    <div className="flex flex-col gap-10 items-start text-left">
                        <div className="flex flex-wrap items-center gap-3 md:gap-4 overflow-visible">
                            <span className="text-on-surface font-black text-xl sm:text-2xl md:text-3xl font-headline tracking-tighter whitespace-nowrap shrink-0">Become a</span>
                            <RotatingText
                                texts={["Quiz Master", "Top Scorer", "Speed Thinker", "Knowledge Pro", "Leaderboard King"]}
                                mainClassName="bg-primary text-white font-black text-sm sm:text-lg md:text-2xl font-headline tracking-tighter px-4 sm:px-10 py-1.5 sm:py-3 rounded-full shadow-2xl shadow-primary/30 justify-center items-center flex overflow-hidden whitespace-nowrap"
                                staggerDuration={0.02}
                                splitBy="characters"
                                rotationInterval={3000}
                                transition={{ type: 'spring', damping: 25, stiffness: 200, bounce: 0 }}
                                staggerFrom="center"
                            />
                        </div>

                        <motion.h1
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 1, ease: "circOut" }}
                            className="text-4xl sm:text-6xl md:text-8xl font-black font-headline leading-[0.95] tracking-tighter text-on-surface uppercase"
                        >
                            The ultimate <br />
                            <span className="gradient-text block py-1 sm:py-2 leading-tight">platform</span>
                            for learning.
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-base sm:text-lg md:text-2xl text-on-surface-variant leading-relaxed max-w-xl font-medium"
                        >
                            Test your knowledge and master new subjects with ease. Learn anything, anywhere with our powerful AI-driven quiz platform.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-6 w-full sm:w-auto"
                        >
                            <Link to="/register" className="editorial-gradient text-white px-8 sm:px-10 py-4 sm:py-5 rounded-2xl font-headline text-base sm:text-lg font-bold tracking-tight shadow-3xl shadow-primary/40 hover:scale-105 active:scale-95 transition-all text-center">
                                Get Started Free
                            </Link>
                            <Link to="/explore" className="px-8 sm:px-10 py-4 sm:py-5 rounded-2xl font-headline text-base sm:text-lg font-bold tracking-tight text-on-surface border border-white/10 bg-surface-container/10 backdrop-blur-md hover:bg-surface-container-high transition-all text-center">
                                Explore Quizzes
                            </Link>
                        </motion.div>

                        {/* Trust Bar with Real Stats */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="w-full max-w-2xl bg-white/[0.02] border border-white/5 rounded-3xl p-6 sm:p-10 flex flex-wrap items-center justify-between gap-10 mt-6 sm:mt-10"
                        >
                            <div className="text-left space-y-2">
                                <p className="text-2xl sm:text-4xl font-black font-headline text-on-surface leading-none uppercase">
                                    {platformStats.totalQuizzes || 0}
                                </p>
                                <p className="text-[9px] sm:text-[10px] md:text-xs font-black uppercase tracking-[0.5em] text-primary">Quizzes Ready</p>
                            </div>

                            <div className="w-px h-10 bg-white/10 hidden sm:block"></div>

                            <div className="text-left space-y-2">
                                <p className="text-2xl sm:text-4xl font-black font-headline text-on-surface leading-none uppercase">
                                    {platformStats.totalXP > 1000 ? `${(platformStats.totalXP / 1000).toFixed(1)}k+` : platformStats.totalXP}
                                </p>
                                <p className="text-[9px] sm:text-[10px] md:text-xs font-black uppercase tracking-[0.5em] text-primary">Points Earned</p>
                            </div>

                            <div className="w-px h-10 bg-white/10 hidden sm:block"></div>

                            <div className="text-left space-y-2">
                                <p className="text-2xl sm:text-4xl font-black font-headline text-on-surface leading-none uppercase">
                                    {platformStats.totalUsers || 0}
                                </p>
                                <p className="text-[9px] sm:text-[10px] md:text-xs font-black uppercase tracking-[0.5em] text-primary">Active Minds</p>
                            </div>

                            <div className="hidden lg:flex items-center gap-4 bg-primary/10 px-4 py-3 rounded-2xl border border-primary/20">
                                <span className="material-symbols-outlined text-primary text-xl">verified</span>
                                <div className="leading-none">
                                    <p className="text-[8px] font-black uppercase tracking-widest text-primary mb-1">Status</p>
                                    <p className="text-[10px] font-bold text-white">Certified Pro</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    <div className="relative hidden lg:block">
                        <HeroIllustration />
                    </div>
                </div>
            </section>

            <div className="pb-24">
                <ScrollVelocity
                    texts={[
                        <div className="flex gap-20">
                            <div className="velocity-item"><div className="velocity-icon"><span className="material-symbols-outlined text-lg">psychology</span></div>Test Your Brain</div>
                            <div className="velocity-item"><div className="velocity-icon"><span className="material-symbols-outlined text-lg">timer</span></div>Beat The Clock</div>
                            <div className="velocity-item"><div className="velocity-icon"><span className="material-symbols-outlined text-lg">leaderboard</span></div>Climb The Leaderboard</div>
                        </div>,
                        <div className="flex gap-20">
                            <div className="velocity-item"><div className="velocity-icon"><span className="material-symbols-outlined text-lg">auto_awesome</span></div>AI-Powered Quizzes</div>
                            <div className="velocity-item"><div className="velocity-icon"><span className="material-symbols-outlined text-lg">calendar_today</span></div>Learn Daily</div>
                            <div className="velocity-item"><div className="velocity-icon"><span className="material-symbols-outlined text-lg">groups</span></div>Challenge Friends</div>
                        </div>
                    ]}
                    velocity={40}
                />
            </div>



            {/* Featured Section */}
            <section className="py-20 sm:py-32 px-4 sm:px-8 lg:px-24 bg-surface-container/5 outline-b outline-white/5">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 sm:gap-10 mb-12 sm:mb-20">
                        <div className="flex flex-col gap-2 sm:gap-6 max-w-2xl text-left">
                            <p className="text-primary font-headline font-black tracking-[0.5em] text-[10px] sm:text-xs md:text-sm uppercase mb-3 sm:mb-6">Our Selection</p>
                            <h2 className="text-4xl sm:text-4xl md:text-6xl font-black font-headline text-on-surface leading-[1.0] uppercase tracking-tighter">
                                Top Featured <br />
                                Quizzes.
                            </h2>
                        </div>
                        <Link to="/explore" className="group relative self-start sm:self-end mt-4 sm:mt-0 flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] sm:text-sm font-black uppercase tracking-[0.2em] text-on-surface group-hover:text-primary transition-colors">Explore All Quizzes</span>
                                <span className="material-symbols-outlined text-[18px] text-on-surface group-hover:text-primary transition-all transform group-hover:translate-x-1">north_east</span>
                            </div>
                            <div className="w-full h-[1.5px] bg-on-surface group-hover:bg-primary group-hover:w-full transition-all"></div>
                        </Link>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {loading ? (
                            [...Array(4)].map((_, i) => (
                                <div key={i} className="bg-surface-container p-8 rounded-3xl h-64 animate-pulse border border-white/5 flex flex-col gap-5">
                                    <div className="w-16 h-3 bg-surface-container-high rounded-full"></div>
                                    <div className="w-full h-6 bg-surface-container-high rounded-lg"></div>
                                    <div className="w-2/3 h-3 bg-surface-container-high rounded-md"></div>
                                    <div className="mt-auto w-full h-8 bg-surface-container-high rounded-lg"></div>
                                </div>
                            ))
                        ) : quizzes.length > 0 ? (
                            quizzes.map(quiz => <FeatureCard key={quiz._id} quiz={quiz} />)
                        ) : (
                            <div className="col-span-full py-20 text-center bg-surface-container rounded-[3rem] border-2 border-dashed border-white/10 flex flex-col items-center gap-6">
                                <span className="material-symbols-outlined text-5xl text-surface-container-highest">quiz</span>
                                <div className="space-y-2">
                                    <h4 className="text-xl font-bold font-headline text-on-surface uppercase tracking-wide">No quizzes available yet</h4>
                                    <p className="text-on-surface-variant font-medium">Be the first to create an amazing quiz!</p>
                                </div>
                                <Link to="/register" className="editorial-gradient text-white px-8 py-4 rounded-xl font-headline text-sm font-bold tracking-tight shadow-lg shadow-primary/20">
                                    Join & Create
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 sm:py-40 px-4 sm:px-8 lg:px-24">
                <div className="max-w-5xl mx-auto editorial-gradient rounded-[2rem] sm:rounded-[3rem] p-8 sm:p-16 md:p-24 text-center relative overflow-hidden shadow-3xl shadow-primary/20">
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                    <div className="relative z-10 flex flex-col items-center gap-6 sm:gap-10">
                        <h2 className="text-2xl sm:text-4xl md:text-7xl font-black font-headline text-white leading-[1.1] uppercase tracking-tighter">Ready to start <br />your journey?</h2>
                        <p className="text-white/80 text-sm sm:text-lg md:text-xl font-medium max-w-xl mx-auto leading-relaxed">
                            Join thousands of users learning and growing every day. Simple. Fast. Effective.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-6 w-full sm:w-auto">
                            <Link to="/register" className="bg-white text-primary px-8 sm:px-12 py-3.5 sm:py-5 rounded-xl font-headline text-sm sm:text-base md:text-lg font-bold tracking-tight shadow-xl hover:bg-surface transition-all active:scale-95 text-center">
                                Join Now
                            </Link>
                            <Link to="/login" className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-8 sm:px-12 py-3.5 sm:py-5 rounded-xl font-headline text-sm sm:text-base md:text-lg font-bold tracking-tight hover:bg-white/20 transition-all active:scale-95 text-center">
                                Sign In
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

        </div >
    );
};

export default Landing;
