import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

import BorderGlow from '../components/animations/BorderGlow';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const result = await login(email, password);
        if (result.success) {
            navigate(result.user.role === 'Admin' ? '/admin' : '/dashboard');
        } else {
            setError(result.message);
        }
    };

    return (
        <div className="min-h-screen bg-surface flex items-center justify-center p-6 sm:p-12 lg:p-24 relative overflow-hidden pt-24 sm:pt-32">
            {/* Background Decor */}
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10 animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-primary-container/10 rounded-full blur-[100px] -z-10 animate-pulse delay-1000"></div>

            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="w-full max-w-xl relative shrink-0"
            >
                <BorderGlow borderRadius={64} backgroundColor="rgba(10, 10, 12, 0.4)" colors={['#c084fc', '#f472b6', '#38bdf8']} glowIntensity={1}>
                    <div className="bg-surface-container/70 backdrop-blur-3xl p-8 sm:p-12 md:p-16 space-y-8 sm:space-y-12 relative z-10 rounded-[inherit]">
                        <div className="text-center space-y-4">
                            <div className="w-20 h-20 editorial-gradient rounded-3xl mx-auto flex items-center justify-center shadow-2xl mb-8 -rotate-6">
                                <span className="material-symbols-outlined text-white text-4xl">fingerprint</span>
                            </div>
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-headline tracking-tighter text-on-surface leading-none uppercase">Login.</h2>
                            <p className="text-on-surface-variant font-medium text-base sm:text-lg">Welcome back! Please enter your details to sign in.</p>
                        </div>

                        {error && (
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-error/5 border border-error/20 text-error p-6 rounded-2xl text-center text-xs font-black uppercase tracking-widest leading-none">
                                {error}
                            </motion.div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-8 sm:space-y-12">
                            <div className="space-y-6">
                                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.3em] font-headline ml-1">Email Address</label>
                                <div className="group relative">
                                    <span className="absolute left-6 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant group-focus-within:text-primary transition-colors">alternate_email</span>
                                    <input
                                        type="email"
                                        required
                                        className="w-full bg-surface-container-high border-none rounded-3xl py-6 pl-16 pr-6 focus:ring-4 focus:ring-primary/10 transition-all font-headline text-sm font-semibold outline-none shadow-sm placeholder:text-on-surface-variant/30 text-on-surface"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-6">
                                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.3em] font-headline ml-1">Password</label>
                                <div className="group relative">
                                    <span className="absolute left-6 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant group-focus-within:text-primary transition-colors">key</span>
                                    <input
                                        type="password"
                                        required
                                        className="w-full bg-surface-container-high border-none rounded-3xl py-6 pl-16 pr-6 focus:ring-4 focus:ring-primary/10 transition-all font-headline text-sm font-semibold outline-none shadow-sm placeholder:text-on-surface-variant/30 text-on-surface"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full editorial-gradient py-6 rounded-3xl font-headline font-black text-lg tracking-tight text-white shadow-2xl shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                            >
                                Sign In <span className="material-symbols-outlined">login</span>
                            </button>
                        </form>

                        <div className="text-center pt-8 border-t border-white/5">
                            <p className="text-on-surface-variant font-bold text-sm tracking-tight flex items-center justify-center gap-2">
                                New user? <Link to="/register" className="text-primary hover:underline underline-offset-4 font-black uppercase tracking-widest text-xs">Create an account</Link>
                            </p>
                        </div>
                    </div>
                </BorderGlow>
            </motion.div>
        </div>
    );
};

export default Login;
