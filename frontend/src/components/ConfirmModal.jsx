import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Delete', type = 'danger' }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[210] flex items-center justify-center p-6">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-surface/80 backdrop-blur-3xl"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative bg-surface-container/95 border border-white/5 rounded-[2.5rem] sm:rounded-[4rem] shadow-3xl max-w-lg w-full p-8 sm:p-12 md:p-16 text-center space-y-10"
                    >
                        <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl ${type === 'danger' ? 'bg-error/10 text-error' : 'bg-primary/10 text-primary'}`}>
                            <span className="material-symbols-outlined text-4xl">{type === 'danger' ? 'warning' : 'info'}</span>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-3xl md:text-5xl font-black font-headline tracking-tighter text-on-surface leading-none uppercase pt-6">
                                {title}
                            </h3>
                            <p className="text-on-surface-variant font-medium text-base md:text-lg opacity-80 leading-relaxed">
                                {message}
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-6 pt-6">
                            <button
                                onClick={onClose}
                                className="w-full px-8 py-4 bg-white/5 border border-white/5 text-on-surface font-black uppercase text-[10px] tracking-widest rounded-full hover:bg-white/10 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    onConfirm();
                                    onClose();
                                }}
                                className={`w-full px-8 py-4 font-black uppercase text-[10px] tracking-widest rounded-full shadow-2xl transition-all ${type === 'danger' ? 'bg-error text-white hover:shadow-error/30' : 'editorial-gradient text-white hover:shadow-primary/30'}`}
                            >
                                {confirmText}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ConfirmModal;
