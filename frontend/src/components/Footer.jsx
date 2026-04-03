import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-surface py-12 sm:py-20 px-6 sm:px-8 lg:px-24 border-t border-white/5 mt-auto">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-12 sm:gap-16 mb-16">
                    <div className="col-span-2 space-y-6 sm:space-y-8">
                        <Link to="/" className="flex items-center gap-3 group">
                            <div className="w-10 h-10 editorial-gradient rounded-full flex items-center justify-center font-black text-white text-xl shadow-lg transition-transform group-hover:scale-105">Q</div>
                            <span className="text-2xl font-black font-headline tracking-tighter text-on-surface">Quiz<span className="gradient-text">Master</span></span>
                        </Link>
                        <p className="text-on-surface-variant font-medium text-sm sm:text-lg max-w-sm leading-relaxed">
                            The intelligent platform for modern learners. Master any subject with AI-driven insights and interactive challenges.
                        </p>
                    </div>

                    <div className="space-y-6 lg:ml-auto">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/40">Platform</h4>
                        <ul className="space-y-4 font-headline">
                            <li><Link to="/explore" className="text-[11px] font-black uppercase tracking-widest text-on-surface hover:text-primary transition-all hover:translate-x-1 inline-block">Explore</Link></li>
                            <li><Link to="/leaderboard" className="text-[11px] font-black uppercase tracking-widest text-on-surface hover:text-primary transition-all hover:translate-x-1 inline-block">Leaderboard</Link></li>
                            <li><Link to="/dashboard" className="text-[11px] font-black uppercase tracking-widest text-on-surface hover:text-primary transition-all hover:translate-x-1 inline-block">Dashboard</Link></li>
                        </ul>
                    </div>

                    <div className="space-y-6 lg:ml-auto">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/40">Company</h4>
                        <ul className="space-y-4 font-headline">
                            <li><a href="#" className="text-[11px] font-black uppercase tracking-widest text-on-surface hover:text-primary transition-all hover:translate-x-1 inline-block">About Us</a></li>
                            <li><a href="#" className="text-[11px] font-black uppercase tracking-widest text-on-surface hover:text-primary transition-all hover:translate-x-1 inline-block">Privacy</a></li>
                            <li><a href="#" className="text-[11px] font-black uppercase tracking-widest text-on-surface hover:text-primary transition-all hover:translate-x-1 inline-block">Terms</a></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-10 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-8">
                    <p className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest opacity-40">
                        © 2026 QuizMaster AI. All rights reserved.
                    </p>
                    <div className="flex gap-8">
                        {['Twitter', 'LinkedIn', 'Discord'].map(social => (
                            <a key={social} href="#" className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors">{social}</a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
