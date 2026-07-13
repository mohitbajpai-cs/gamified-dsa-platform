import React, { useState, useEffect } from 'react';
import { claimDailyLoginApi } from '../../services/quest.api';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { GiSparkles, GiCoins, GiUpgrade, GiTrophy } from 'react-icons/gi';
import { FaGift, FaBoxOpen } from 'react-icons/fa';

const DailyRewardModal = () => {
    const { user, refreshUser } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [chestState, setChestState] = useState('closed'); // 'closed', 'opening', 'opened'
    const [rewardData, setRewardData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Trigger modal only if user is logged in and hasn't claimed reward today
        if (user && user.dailyLogin && !user.dailyLogin.claimedToday) {
            setIsOpen(true);
        }
    }, [user]);

    const handleOpenChest = async () => {
        setLoading(true);
        setChestState('opening');
        try {
            const res = await claimDailyLoginApi();
            if (res.success && res.data) {
                setRewardData(res.data);
                setChestState('opened');
                if (refreshUser) await refreshUser();
            }
        } catch (err) {
            console.error('Failed to claim daily login rewards:', err);
            setChestState('closed');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    // Calculate next streak rewards preview
    const streak = user?.dailyLogin?.streak || 0;
    const currentStreakDay = (streak % 7) + 1;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.05),transparent)] pointer-events-none"></div>

                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 30 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 30 }}
                    className="relative max-w-md w-full bg-gradient-to-b from-abyss-card via-black to-black border-2 border-abyss-gold/40 rounded-3xl p-8 text-center space-y-6 shadow-glow-gold/25"
                >
                    {/* Top decoration */}
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-abyss-gold to-transparent"></div>

                    {chestState === 'closed' && (
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <span className="text-[9px] uppercase tracking-[0.2em] font-fantasy px-2 py-0.5 rounded bg-abyss-gold/10 border border-abyss-gold/30 text-abyss-gold">
                                    Streak Bonus: Day {currentStreakDay}
                                </span>
                                <h2 className="font-fantasy text-2xl font-bold tracking-widest text-white uppercase">
                                    Daily Reward Chest
                                </h2>
                                <p className="font-sans text-xs text-abyss-muted">
                                    Unlock your daily algorithm treasury. Maintain your login streak for higher multipliers!
                                </p>
                            </div>

                            {/* Streak map */}
                            <div className="flex justify-between items-center gap-1 bg-black/40 border border-abyss-border/40 p-3 rounded-xl font-mono text-[9px] uppercase tracking-wider text-abyss-muted">
                                {[1, 2, 3, 4, 5, 6, 7].map((day) => {
                                    const isCompleted = day < currentStreakDay;
                                    const isActive = day === currentStreakDay;
                                    return (
                                        <div 
                                            key={day} 
                                            className={`flex-1 p-1.5 rounded text-center border transition-all
                                                ${isCompleted ? 'bg-green-500/10 border-green-500/30 text-green-400' : ''}
                                                ${isActive ? 'bg-abyss-gold/25 border-abyss-gold text-abyss-gold scale-105 animate-pulse' : ''}
                                                ${!isCompleted && !isActive ? 'bg-black/60 border-abyss-border/20 text-abyss-muted/40' : ''}
                                            `}
                                        >
                                            Day {day}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Closed chest icon */}
                            <div className="py-6 flex items-center justify-center">
                                <motion.div
                                    animate={{ y: [0, -8, 0] }}
                                    transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                                    className="w-28 h-28 flex items-center justify-center bg-abyss-gold/5 rounded-full border border-abyss-gold/20 shadow-glow-gold/10 cursor-pointer"
                                    onClick={handleOpenChest}
                                >
                                    <FaGift className="text-abyss-gold text-6xl hover:scale-110 transition-transform duration-300" />
                                </motion.div>
                            </div>

                            <button
                                onClick={handleOpenChest}
                                className="w-full bg-gradient-to-r from-abyss-gold to-yellow-600 hover:from-yellow-600 hover:to-abyss-gold text-black font-fantasy text-xs uppercase tracking-widest py-3.5 rounded-xl transition-all shadow-glow-gold/20 cursor-pointer font-bold"
                            >
                                Open Chest
                            </button>
                        </div>
                    )}

                    {chestState === 'opening' && (
                        <div className="py-12 space-y-4">
                            <FaBoxOpen className="text-abyss-gold text-7xl mx-auto animate-bounce" />
                            <h3 className="font-fantasy text-lg font-bold tracking-widest text-white uppercase animate-pulse">
                                Opening Chest...
                            </h3>
                        </div>
                    )}

                    {chestState === 'opened' && rewardData && (
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <GiSparkles className="text-abyss-gold text-4xl mx-auto animate-pulse" />
                                <h2 className="font-fantasy text-2xl font-bold tracking-widest text-white uppercase">
                                    Loot Awarded!
                                </h2>
                                <p className="font-sans text-xs text-abyss-muted">
                                    Treasury coins and spell experience added to your standing credentials.
                                </p>
                            </div>

                            {/* Loot grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-black/45 border border-abyss-border/40 p-4 rounded-xl relative">
                                    <GiUpgrade className="text-purple-400 text-2xl mx-auto mb-1" />
                                    <span className="text-[9px] uppercase tracking-wider text-abyss-muted block">XP Gained</span>
                                    <span className="font-mono text-lg font-bold text-purple-400">+{rewardData.xpAwarded} XP</span>
                                </div>

                                <div className="bg-black/45 border border-abyss-border/40 p-4 rounded-xl relative">
                                    <GiCoins className="text-abyss-gold text-2xl mx-auto mb-1" />
                                    <span className="text-[9px] uppercase tracking-wider text-abyss-muted block">Gold Earned</span>
                                    <span className="font-mono text-lg font-bold text-abyss-gold">+{rewardData.coinsAwarded}</span>
                                </div>
                            </div>

                            {rewardData.isBonusChest && (
                                <div className="bg-purple-950/20 border border-purple-500/30 p-2.5 rounded-lg text-xs font-fantasy uppercase text-purple-300 flex items-center justify-center space-x-2 animate-pulse shadow-glow-primary/10">
                                    <GiTrophy className="text-sm text-purple-400" />
                                    <span>Unlocked 7-Day Streak Bonus Chest!</span>
                                </div>
                            )}

                            <div className="text-xs text-abyss-muted uppercase tracking-wider font-mono bg-black/45 py-2 rounded-lg border border-abyss-border/20">
                                Streak: {rewardData.streak} Days active
                            </div>

                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-full bg-abyss-card hover:bg-abyss-hover text-white border border-abyss-border/60 font-fantasy text-xs uppercase tracking-widest py-3.5 rounded-xl transition-all cursor-pointer"
                            >
                                Seal Portal
                            </button>
                        </div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default DailyRewardModal;
