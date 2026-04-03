import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { getRankByXP, getRankDetails } from '../utils/xpUtils';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const menuRef = useRef(null);

    const handleLogout = () => {
        logout();
        setIsMobileMenuOpen(false);
        navigate('/');
    };

    const isActive = (path) => location.pathname === path;

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowUserMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location]);

    return (
        <nav className="fixed top-0 w-full z-[1000] bg-surface/80 backdrop-blur-xl shadow-2xl h-16 sm:h-20 transition-editorial border-b border-white/5">
            <div className="flex justify-between items-center px-4 sm:px-8 h-full max-w-7xl mx-auto relative">
                <div className="flex items-center gap-4 sm:gap-12">
                    <Link to="/" className="flex items-center gap-2 group transition-all duration-300">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 editorial-gradient rounded-full flex items-center justify-center font-black text-white text-lg sm:text-xl shadow-lg group-hover:scale-105 transition-transform shrink-0">Q</div>
                        <span className="text-xl sm:text-2xl font-black font-headline tracking-tighter text-on-surface">Quiz<span className="gradient-text">Master</span></span>
                    </Link>

                    {user?.role !== 'Admin' && (
                        <div className="hidden md:flex gap-8 items-center font-headline text-sm font-semibold tracking-tight">
                            <Link
                                to="/explore"
                                className={`${isActive('/explore') ? 'text-primary border-b-2 border-primary pb-1' : 'text-on-surface-variant hover:text-on-surface'} transition-all duration-200 ease-out`}
                            >
                                Explore
                            </Link>
                            <Link
                                to="/leaderboard"
                                className={`${isActive('/leaderboard') ? 'text-primary border-b-2 border-primary pb-1' : 'text-on-surface-variant hover:text-on-surface'} transition-all duration-200 ease-out`}
                            >
                                Leaderboard
                            </Link>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-4 sm:gap-6">
                    {user && (
                        <Link
                            to={user.role === 'Admin' ? "/admin" : "/dashboard"}
                            className={`hidden sm:flex items-center h-11 px-6 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all border-2 ${isActive('/admin') || isActive('/dashboard') ? 'editorial-gradient text-white border-transparent' : 'bg-surface-container border-white/5 text-on-surface-variant hover:border-primary/30 hover:text-primary shadow-sm hover:shadow-md'}`}
                        >
                            Dashboard
                        </Link>
                    )}

                    {user ? (
                        <div className="relative flex items-center gap-4" ref={menuRef}>
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border-2 border-white/10 shadow-xl overflow-hidden bg-surface-container-high hover:scale-105 transition-transform ring-2 ring-transparent hover:ring-primary/20"
                            >
                                {user.avatar ? (
                                    <img src={user.avatar} alt="User Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full editorial-gradient rounded-full flex items-center justify-center text-white font-black text-lg">{user.name[0]}</div>
                                )}
                            </button>

                            {/* Hamburger Menu Icon (Mobile Only - Users Only) */}
                            {user.role !== 'Admin' && (
                                <button
                                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                    className="flex md:hidden w-10 h-10 items-center justify-center rounded-xl bg-surface-container border border-white/5 text-on-surface"
                                >
                                    <span className="material-symbols-outlined">{isMobileMenuOpen ? 'close' : 'menu'}</span>
                                </button>
                            )}

                            <AnimatePresence>
                                {showUserMenu && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                        className="absolute right-0 top-full mt-4 w-72 bg-surface-container-high/95 backdrop-blur-3xl rounded-[2rem] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-3 z-[110]"
                                    >
                                        <div className="p-5 flex items-center gap-4 border-b border-white/5 mb-2">
                                            <div className="w-14 h-14 rounded-full overflow-hidden flex items-center justify-center shrink-0 shadow-2xl border border-white/10">
                                                {user.avatar ? (
                                                    <img src={user.avatar} alt="User Avatar" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full editorial-gradient rounded-full flex items-center justify-center text-white text-2xl font-black">{user.name[0]}</div>
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="text-base font-black font-headline text-on-surface leading-none truncate tracking-tight">{user.name}</h4>
                                                <div className="flex flex-col gap-1 mt-2">
                                                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-primary flex items-center gap-2">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                                                        {user.role}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            {[
                                                { to: user.role === 'Admin' ? "/admin" : "/dashboard", icon: 'dashboard', label: 'Dashboard' },
                                                { to: "/profile", icon: 'person', label: 'Profile Settings' }
                                            ].map((item) => (
                                                <Link
                                                    key={item.label}
                                                    to={item.to}
                                                    onClick={() => setShowUserMenu(false)}
                                                    className="flex items-center gap-4 p-4 rounded-2xl hover:bg-primary/10 hover:translate-x-1 transition-all group"
                                                >
                                                    <span className="material-symbols-outlined text-primary/40 group-hover:text-primary transition-colors text-2xl">{item.icon}</span>
                                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant group-hover:text-on-surface">
                                                        {item.label}
                                                    </span>
                                                </Link>
                                            ))}
                                            <div className="h-px bg-white/5 my-2 mx-2" />
                                            <button
                                                onClick={handleLogout}
                                                className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-error/10 hover:translate-x-1 transition-all group text-left"
                                            >
                                                <span className="material-symbols-outlined text-error/40 group-hover:text-error transition-colors text-2xl">logout</span>
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant group-hover:text-error">
                                                    Logout
                                                </span>
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4">
                            <Link to="/login" className="font-headline text-sm font-semibold tracking-tight text-primary hover:opacity-80 active:scale-95 transition-all underline-offset-4 hover:underline">Login</Link>
                            <Link to="/register" className="editorial-gradient text-white px-8 py-3 rounded-xl font-headline text-sm font-bold tracking-tight shadow-xl shadow-primary/10 hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all">Join Now</Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Simplified Mobile Navigation Drawer */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[1998] md:hidden"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 40, stiffness: 450 }}
                            className="fixed top-0 right-0 w-[50vw] sm:w-[240px] h-screen bg-surface z-[2000] md:hidden flex flex-col p-5 border-l border-white/5 shadow-2xl"
                        >
                            <div className="flex justify-between items-center mb-8">
                                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-primary/40">Menu</span>
                                <button
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-on-surface"
                                >
                                    <span className="material-symbols-outlined text-xl">close</span>
                                </button>
                            </div>

                            <div className="flex flex-col gap-1.5 font-headline">
                                {(user?.role !== 'Admin' ? [
                                    { to: "/explore", label: "Explore", icon: 'search' },
                                    { to: "/leaderboard", label: "Leaderboard", icon: 'leaderboard' }
                                ] : []).map((link) => {
                                    const active = isActive(link.to);
                                    return (
                                        <Link
                                            key={link.to}
                                            to={link.to}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className={`relative flex items-center gap-2 p-3.5 rounded-2xl transition-all ${active ? 'bg-primary/10' : 'hover:bg-white/5'}`}
                                        >
                                            {active && (
                                                <motion.div
                                                    layoutId="mobile-sidebar-pill"
                                                    className="absolute inset-0 bg-primary/5 rounded-2xl border border-primary/20"
                                                />
                                            )}
                                            <div className="w-8 h-8 flex items-center justify-center shrink-0">
                                                <span className={`material-symbols-outlined text-xl ${active ? 'text-primary' : 'text-on-surface-variant/40'}`}>
                                                    {link.icon}
                                                </span>
                                            </div>
                                            <span className={`text-[11px] font-black uppercase tracking-[0.1em] ${active ? 'text-primary' : 'text-on-surface'}`}>
                                                {link.label}
                                            </span>
                                        </Link>
                                    );
                                })}
                            </div>

                            <div className="mt-auto pt-8 border-t border-white/5">
                                <Link to="/" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
                                    <div className="w-6 h-6 editorial-gradient rounded-full flex items-center justify-center font-black text-white text-[10px]">Q</div>
                                    <span className="text-sm font-black font-headline tracking-tighter text-on-surface">Quiz<span className="gradient-text">Master</span></span>
                                </Link>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
