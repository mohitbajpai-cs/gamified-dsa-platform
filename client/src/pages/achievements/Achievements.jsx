import React, { useState, useEffect } from 'react';
import { getAchievementsApi } from '../../services/quest.api';
import Card from '../../components/ui/Card';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { GiAchievement, GiLockSpy, GiTrophy, GiSparkles } from 'react-icons/gi';
import { motion, AnimatePresence } from 'framer-motion';

const Achievements = () => {
    const [achievements, setAchievements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('All');

    useEffect(() => {
        const fetchAchievements = async () => {
            try {
                const res = await getAchievementsApi();
                if (res.success && res.data) {
                    setAchievements(res.data);
                }
            } catch (err) {
                console.error('Failed to load achievements:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchAchievements();
    }, []);

    const filterOptions = ['All', 'Unlocked', 'Locked', 'Common', 'Rare', 'Epic', 'Legendary'];

    const filteredAchievements = achievements.filter(ach => {
        if (activeFilter === 'All') return true;
        if (activeFilter === 'Unlocked') return ach.unlocked;
        if (activeFilter === 'Locked') return !ach.unlocked;
        return ach.rarity.toLowerCase() === activeFilter.toLowerCase();
    });

    const rarityColors = {
        common: 'border-abyss-border/40 text-abyss-muted from-zinc-900/60 to-black',
        rare: 'border-cyan-500/30 text-cyan-400 from-cyan-950/20 to-black',
        epic: 'border-purple-500/30 text-purple-400 from-purple-950/20 to-black shadow-glow-primary/10',
        legendary: 'border-abyss-gold/40 text-abyss-gold from-yellow-950/20 to-black shadow-glow-gold/15'
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 80, damping: 15 }}
            className="space-y-8 pb-24"
        >
            {/* Header branding */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="font-fantasy text-3xl font-bold text-white tracking-widest uppercase flex items-center space-x-3">
                        <GiTrophy className="text-abyss-gold text-3xl animate-bounce" />
                        <span>Abyss Gallery</span>
                    </h1>
                    <p className="font-sans text-xs text-abyss-muted">
                        Behold the legendary scrolls and milestones unlocked during your programming trials.
                    </p>
                </div>
            </div>

            {/* Filter buttons */}
            <div className="flex flex-wrap gap-2.5 border-b border-abyss-border/20 pb-4">
                {filterOptions.map(opt => (
                    <button
                        key={opt}
                        onClick={() => setActiveFilter(opt)}
                        className={`px-4 py-1.5 rounded-lg font-fantasy text-xs uppercase tracking-wider transition-all cursor-pointer border
                            ${activeFilter === opt 
                                ? 'bg-abyss-gold/15 border-abyss-gold text-abyss-gold shadow-glow-gold/10' 
                                : 'bg-black/40 border-abyss-border/40 text-abyss-muted hover:text-white hover:border-abyss-border'
                            }
                        `}
                    >
                        {opt}
                    </button>
                ))}
            </div>

            {/* Achievements Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                    {filteredAchievements.map((ach) => {
                        const styleClass = rarityColors[ach.rarity.toLowerCase()] || rarityColors.common;
                        
                        return (
                            <motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.3 }}
                                key={ach.title}
                                className="relative"
                            >
                                <Card 
                                    className={`h-full border bg-gradient-to-b ${styleClass} p-6 flex flex-col justify-between relative overflow-hidden group hover:shadow-lg transition-all duration-300`}
                                >
                                    {/* Locked shimmer mask overlay */}
                                    {!ach.unlocked && (
                                        <div className="absolute inset-0 bg-black/60 z-10 pointer-events-none rounded-2xl flex items-center justify-center opacity-85">
                                            <GiLockSpy className="text-abyss-muted text-4xl opacity-45" />
                                        </div>
                                    )}

                                    <div className="space-y-4">
                                        <div className="flex items-start justify-between">
                                            <div className={`p-3 rounded-xl border bg-black/50 ${ach.unlocked ? 'border-current text-inherit' : 'border-abyss-border/25 text-abyss-muted/40'}`}>
                                                <GiAchievement className="text-2xl" />
                                            </div>
                                            <span className="text-[8px] uppercase tracking-widest border border-current px-2 py-0.5 rounded font-fantasy font-bold">
                                                {ach.rarity}
                                            </span>
                                        </div>

                                        <div className="space-y-1">
                                            <h3 className={`font-fantasy text-lg font-bold uppercase tracking-wider transition-colors ${ach.unlocked ? 'text-white group-hover:text-abyss-gold' : 'text-abyss-muted/50'}`}>
                                                {ach.title}
                                            </h3>
                                            <p className={`font-sans text-xs ${ach.unlocked ? 'text-abyss-muted' : 'text-abyss-muted/30'}`}>
                                                {ach.description}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-6 pt-4 border-t border-abyss-border/20 flex justify-between items-center text-[10px]">
                                        <div className="flex space-x-3 font-mono font-bold">
                                            <span className="text-purple-400">+{ach.xpReward} XP</span>
                                            <span className="text-abyss-gold">+{ach.coinReward} Coins</span>
                                        </div>
                                        {ach.unlocked ? (
                                            <span className="font-mono text-green-400 text-[9px] flex items-center space-x-1 uppercase">
                                                <GiSparkles className="animate-spin text-xs" />
                                                <span>Unlocked</span>
                                            </span>
                                        ) : (
                                            <span className="font-mono text-abyss-muted/40 uppercase">Locked</span>
                                        )}
                                    </div>
                                </Card>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>

                {filteredAchievements.length === 0 && (
                    <div className="col-span-full text-center py-12">
                        <p className="font-fantasy text-sm text-abyss-muted uppercase tracking-widest">No scrolls match these parameters.</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default Achievements;
