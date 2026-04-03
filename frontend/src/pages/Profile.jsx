import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import ConfirmModal from '../components/ConfirmModal';
import { motion } from 'framer-motion';
import axios from 'axios';

import BorderGlow from '../components/animations/BorderGlow';
import SoftAurora from '../components/animations/SoftAurora';
import ImageCropper from '../components/ImageCropper';
import { getRankDetails, getRankByXP } from '../utils/xpUtils';

const Profile = () => {
    const { user, updateUser, deleteAccount } = useAuth();
    const { showNotification } = useNotification();
    const [name, setName] = useState(user?.name || '');
    const [password, setPassword] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [preview, setPreview] = useState(user?.avatar || null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // Cropping States
    const [imageToCrop, setImageToCrop] = useState(null);
    const [isCropping, setIsCropping] = useState(false);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImageToCrop(reader.result);
                setIsCropping(true);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCropComplete = (croppedImage) => {
        setPreview(croppedImage);
        setIsCropping(false);
        setImageToCrop(null);
    };

    const handleCropCancel = () => {
        setIsCropping(false);
        setImageToCrop(null);
    };

    const handleSave = async (e) => {
        if (e) e.preventDefault();
        setIsSaving(true);
        try {
            // Send both name and the avatar preview to the backend
            const res = await axios.put('/api/auth/profile', {
                name,
                avatar: preview,
                password: password || undefined
            });
            updateUser(res.data.user);
            setPassword(''); // Clear password field after save
            showNotification('Profile synchronized successfully!');
        } catch (err) {
            console.error(err);
            showNotification(err.response?.data?.message || 'Failed to sync identity profile.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteAccount = async () => {
        const res = await deleteAccount();
        if (res.success) {
            showNotification('Account archived successfully.', 'success');
        } else {
            showNotification(res.message, 'error');
        }
    };

    return (
        <div className="min-h-screen bg-surface pt-24 sm:pt-32 pb-12 sm:pb-20 px-4 sm:px-8 lg:px-24 relative overflow-hidden">
            {/* Soft Aurora Background */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <SoftAurora
                    speed={0.6}
                    scale={1.5}
                    brightness={1}
                    color1="#f7f7f7"
                    color2="#e100ff"
                    noiseFrequency={2.5}
                    noiseAmplitude={1}
                    bandHeight={0.5}
                    bandSpread={1}
                    octaveDecay={0.1}
                    layerOffset={0}
                    colorSpeed={1}
                    enableMouseInteraction={true}
                    mouseInfluence={0.25}
                />
            </div>

            <div className="max-w-5xl mx-auto space-y-10 sm:space-y-16 relative z-10 pointer-events-none [&>*]:pointer-events-auto">
                {/* Header */}
                <header className="w-full flex flex-col items-center justify-center gap-10 text-center">
                    <div className="flex flex-col items-center space-y-4">
                        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
                            <span className="w-8 h-[2px] bg-primary"></span>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant">Profile Settings</span>
                        </motion.div>
                        <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl md:text-6xl font-black font-headline text-on-surface leading-[0.95] uppercase pb-4 text-center">
                            Your <br /><span className="gradient-text italic whitespace-nowrap inline-block px-2">Identity</span>.
                        </motion.h2>
                        <p className="text-on-surface-variant font-medium text-base md:text-lg max-w-xl">Manage your personal information and account preferences here.</p>
                    </div>
                </header>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="grid grid-cols-1 lg:grid-cols-3 gap-12"
                >
                    {/* Profile Card */}
                    <div className="lg:col-span-1">
                        <BorderGlow borderRadius={64} backgroundColor="rgba(10, 10, 12, 0.4)" colors={['#c084fc', '#f472b6', '#38bdf8']} glowIntensity={1}>
                            <div className="p-8 sm:p-10 text-center space-y-6 sm:space-y-8 relative overflow-hidden group flex flex-col items-center">
                                <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl group-hover:scale-150 transition-transform"></div>

                                <div className="relative group/avatar cursor-pointer mx-auto w-fit">
                                    <input type="file" id="profile-upload" className="hidden" accept="image/*" onChange={handleFileChange} />
                                    <label htmlFor="profile-upload" className="cursor-pointer block relative">
                                        <div className="w-40 h-40 mx-auto editorial-gradient rounded-full flex items-center justify-center text-white text-6xl font-black shadow-2xl transition-all duration-700 group-hover/avatar:scale-[1.02] overflow-hidden border-8 border-surface-container">
                                            {preview ? (
                                                <img src={preview} alt="Avatar Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                user?.name[0]
                                            )}
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 w-12 h-12 bg-surface-container rounded-full shadow-2xl flex items-center justify-center text-primary hover:scale-110 transition-transform border-4 border-white/10 z-10">
                                            <span className="material-symbols-outlined text-[24px]">photo_camera</span>
                                        </div>
                                        {/* Hover Overlay for 'Change' */}
                                        <div className="absolute inset-0 bg-black/20 rounded-full opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center z-10">
                                            <span className="text-white text-[10px] font-black uppercase tracking-widest bg-black/40 px-3 py-1 rounded-full backdrop-blur-md">Change</span>
                                        </div>
                                    </label>
                                </div>

                                <div className="space-y-3 flex flex-col items-center">
                                    <h3 className="text-3xl font-black font-headline text-on-surface leading-none uppercase tracking-wide">{user?.name}</h3>
                                    <div className="py-2 px-6 bg-white/5 rounded-full border border-white/10 hover:bg-white/10 transition-all group/role">
                                        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-primary group-hover/role:scale-105 transition-transform">{user?.role}</p>
                                    </div>
                                </div>
                            </div>
                        </BorderGlow>
                    </div>

                    {/* Settings Form */}
                    <div className="lg:col-span-2">
                        <BorderGlow borderRadius={64} backgroundColor="rgba(10, 10, 12, 0.4)" colors={['#c084fc', '#f472b6', '#38bdf8']} glowIntensity={1}>
                            <div className="p-8 sm:p-12 md:p-16 space-y-8 sm:space-y-12">
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-8 border-b border-white/5 pb-8">
                                    <h3 className="text-2xl sm:text-3xl font-black font-headline tracking-tighter text-on-surface uppercase leading-none border-l-4 border-primary pl-6">Personal Details</h3>
                                    <button
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="w-full sm:w-auto px-8 py-3 bg-white/10 text-white rounded-full text-[10px] font-black tracking-widest uppercase hover:bg-primary transition-all shadow-lg active:scale-95 disabled:opacity-50"
                                    >
                                        {isSaving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>

                                <form className="space-y-10" onSubmit={handleSave}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <div className="space-y-6">
                                            <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.3em] font-headline ml-1">Full Name</label>
                                            <div className="group relative">
                                                <span className="absolute left-6 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant group-focus-within:text-primary transition-colors">badge</span>
                                                <input
                                                    type="text"
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    className="w-full bg-surface-container-high border-none rounded-2xl py-6 pl-16 pr-6 focus:ring-4 focus:ring-primary/10 transition-all font-headline text-sm font-bold outline-none shadow-sm text-on-surface"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-6">
                                            <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.3em] font-headline ml-1">Email Address</label>
                                            <div className="group relative">
                                                <span className="absolute left-6 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant group-focus-within:text-primary transition-colors">alternate_email</span>
                                                <input
                                                    type="email"
                                                    disabled
                                                    defaultValue={user?.email}
                                                    className="w-full bg-surface-container-high/50 border-none rounded-2xl py-6 pl-16 pr-6 font-headline text-sm font-bold outline-none shadow-sm text-on-surface-variant cursor-not-allowed"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.3em] font-headline ml-1">Update Password</label>
                                        <div className="group relative">
                                            <span className="absolute left-6 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant group-focus-within:text-primary transition-colors">lock</span>
                                            <input
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="Enter new password"
                                                className="w-full bg-surface-container-high border-none rounded-2xl py-6 pl-16 pr-6 focus:ring-4 focus:ring-primary/10 transition-all font-headline text-sm font-bold outline-none shadow-sm text-on-surface"
                                            />
                                        </div>
                                    </div>
                                </form>

                                <div className="space-y-6 border-t border-white/5 pt-10 mt-10">
                                    <h4 className="text-xl font-black font-headline text-error uppercase tracking-tighter">Danger Zone</h4>
                                    <p className="text-sm font-medium text-on-surface-variant max-w-lg">
                                        Once you delete your account, there is no going back. Please be certain.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => setIsDeleteModalOpen(true)}
                                        className="px-8 py-3 bg-error/10 text-error rounded-full text-[10px] font-black tracking-widest uppercase hover:bg-error hover:text-white transition-all shadow-sm active:scale-95"
                                    >
                                        Delete Account
                                    </button>
                                </div>
                            </div>
                        </BorderGlow>
                    </div>
                </motion.div>
            </div>

            {isCropping && (
                <ImageCropper
                    image={imageToCrop}
                    onCropComplete={handleCropComplete}
                    onCancel={handleCropCancel}
                />
            )}

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteAccount}
                title="Archiving Identity"
                message="Once you archive your account, all progress and data will be permanently purged. This action is irreversible."
                confirmText="Archive Account"
            />
        </div>
    );
};

export default Profile;
