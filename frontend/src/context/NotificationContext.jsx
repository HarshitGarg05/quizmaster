import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);

    const showNotification = useCallback((message, type = 'success') => {
        const id = Date.now();
        setNotifications(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, 5000);
    }, []);

    const removeNotification = useCallback((id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    return (
        <NotificationContext.Provider value={{ showNotification }}>
            {children}
            <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-3 max-w-[90vw] pointer-events-none">
                <AnimatePresence>
                    {notifications.map(n => (
                        <motion.div
                            key={n.id}
                            initial={{ opacity: 0, x: 20, scale: 0.95 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 20, scale: 0.95 }}
                            className={`pointer-events-auto flex items-center justify-between gap-4 p-4 pr-3 rounded-2xl border shadow-3xl backdrop-blur-3xl min-w-[300px] 
                                ${n.type === 'success'
                                    ? 'bg-primary/10 border-primary/20 text-primary'
                                    : 'bg-error/10 border-error/20 text-error'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined shrink-0 text-xl">
                                    {n.type === 'success' ? 'check_circle' : 'error'}
                                </span>
                                <p className="text-xs font-black uppercase tracking-widest font-headline leading-tight">
                                    {n.message}
                                </p>
                            </div>
                            <button
                                onClick={() => removeNotification(n.id)}
                                className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <span className="material-symbols-outlined text-sm">close</span>
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </NotificationContext.Provider>
    );
};
