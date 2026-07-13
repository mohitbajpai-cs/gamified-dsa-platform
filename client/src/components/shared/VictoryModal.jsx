import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PrimaryButton from '../ui/PrimaryButton';
import LevelBadge from '../ui/LevelBadge';
import { GiTrophy, GiCoins, GiUpgrade, GiCheckMark, GiSwordsPower, GiMedal, GiGothicCross, GiSpellBook } from 'react-icons/gi';

const VictoryModal = ({ isOpen, onClose, rewards = {}, onNext }) => {
    const { 
        xpGained = rewards.xp || 0, 
        coinsGained = rewards.coins || 0, 
        currentLevel = 1, 
        isFirstSolve = true,
        levelIncreased = false,
        topicCompleted = false,
        worldCompleted = false,
        newlyUnlockedAchievements = [],
        relic = rewards.relic || null,
        title = rewards.title || null,
        trophy = rewards.trophy || null
    } = rewards;

    const [xpCount, setXpCount] = useState(0);
    const [coinsCount, setCoinsCount] = useState(0);
    const [showContent, setShowContent] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setShowContent(true);
            
            // Count up animations
            let xpTimer = setTimeout(() => {
                let currentXp = 0;
                const xpInterval = setInterval(() => {
                    if (currentXp < xpGained) {
                        currentXp += Math.ceil(xpGained / 20);
                        setXpCount(Math.min(currentXp, xpGained));
                    } else {
                        clearInterval(xpInterval);
                    }
                }, 30);
            }, 500);

            let coinsTimer = setTimeout(() => {
                let currentCoins = 0;
                const coinsInterval = setInterval(() => {
                    if (currentCoins < coinsGained) {
                        currentCoins += Math.ceil(coinsGained / 20);
                        setCoinsCount(Math.min(currentCoins, coinsGained));
                    } else {
                        clearInterval(coinsInterval);
                    }
                }, 30);
            }, 900);

            return () => {
                clearTimeout(xpTimer);
                clearTimeout(coinsTimer);
            };
        } else {
            setShowContent(false);
            setXpCount(0);
            setCoinsCount(0);
        }
    }, [isOpen, xpGained, coinsGained]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
                    {/* Floating particle glows */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-abyss-primary/20 rounded-full blur-[100px] pointer-events-none animate-pulse-slow"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-abyss-gold/10 rounded-full blur-[80px] pointer-events-none"></div>

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 30 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 30 }}
                        transition={{ type: 'spring', stiffness: 100, damping: 15 }}
                        className={`relative max-w-md w-full bg-gradient-to-b ${relic ? 'from-red-950/20 via-black to-black border-2 border-red-500/50 shadow-glow-danger/25' : 'from-abyss-card via-black to-black border-2 border-abyss-gold/40 shadow-glow-gold/30'} rounded-2xl p-8 text-center space-y-5 overflow-hidden z-10 my-8`}
                    >
                        {/* Shimmer line */}
                        <div className={`absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent ${relic ? 'via-red-500' : 'via-abyss-gold'} to-transparent`}></div>

                        <div className="space-y-2">
                            {relic ? (
                                <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto shadow-glow-danger animate-bounce">
                                    <GiSwordsPower className="text-red-500 text-3xl" />
                                </div>
                            ) : (
                                <div className="w-16 h-16 rounded-full bg-abyss-gold/10 border border-abyss-gold/30 flex items-center justify-center mx-auto shadow-glow-gold/25 animate-bounce">
                                    <GiTrophy className="text-abyss-gold text-3xl" />
                                </div>
                            )}
                            <h2 className="font-fantasy text-2xl font-bold tracking-widest text-white uppercase">
                                {relic ? 'Guardian Defeated!' : 'Gate Sealed!'}
                            </h2>
                            <p className="font-sans text-xs text-abyss-muted">
                                {relic ? 'You have breached the protective seal, liberating this realm of the Abyss.' : 'You successfully cast the verification spell and conquered this challenge dungeon.'}
                            </p>
                        </div>

                        {/* Special Milestone Alerts */}
                        <AnimatePresence>
                            {(levelIncreased || topicCompleted || worldCompleted || newlyUnlockedAchievements.length > 0) && (
                                <motion.div 
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-2 py-2"
                                >
                                    {levelIncreased && (
                                        <div className="bg-purple-950/20 border border-purple-500/30 p-2.5 rounded-lg text-xs font-fantasy uppercase text-purple-300 flex items-center justify-center space-x-2 animate-pulse">
                                            <GiUpgrade className="text-sm text-purple-400" />
                                            <span>Character Tier Level Up!</span>
                                        </div>
                                    )}

                                    {topicCompleted && (
                                        <div className="bg-blue-950/20 border border-blue-500/30 p-2.5 rounded-lg text-xs font-fantasy uppercase text-blue-300 flex items-center justify-center space-x-2">
                                            <GiSpellBook className="text-sm text-blue-400" />
                                            <span>Topic Trial Fully Conquered!</span>
                                        </div>
                                    )}

                                    {worldCompleted && (
                                        <div className="bg-red-950/20 border border-red-500/30 p-2.5 rounded-lg text-xs font-fantasy uppercase text-red-300 flex items-center justify-center space-x-2 shadow-glow-danger/20">
                                            <GiGothicCross className="text-sm text-red-400" />
                                            <span>Realm Completely Liberated!</span>
                                        </div>
                                    )}

                                    {newlyUnlockedAchievements.map((ach) => (
                                        <div key={ach} className="bg-yellow-950/20 border border-yellow-500/30 p-2.5 rounded-lg text-xs font-fantasy uppercase text-yellow-300 flex items-center justify-center space-x-2">
                                            <GiMedal className="text-sm text-yellow-400 animate-spin" />
                                            <span>Unlocked: {ach}</span>
                                        </div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {relic && (
                            <div className="bg-red-950/20 border border-red-500/30 p-4 rounded-xl text-left space-y-2 relative shadow-glow-danger/10">
                                <div className="absolute top-0 left-0 w-8 h-[1px] bg-gradient-to-r from-transparent via-red-500 to-transparent"></div>
                                <span className="text-[8px] uppercase tracking-widest text-red-400 block font-bold font-fantasy">Relic Secured</span>
                                <div className="flex items-center space-x-2 text-white font-fantasy text-sm uppercase">
                                    <GiMedal className="text-red-500 text-lg animate-pulse" />
                                    <span>{relic}</span>
                                </div>
                                {title && (
                                    <>
                                        <div className="h-[1px] bg-red-500/10"></div>
                                        <span className="text-[8px] uppercase tracking-widest text-red-400 block font-bold font-fantasy">Legendary Title Claimed</span>
                                        <div className="text-abyss-gold font-fantasy text-xs uppercase tracking-wider">
                                            "{title}"
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Counts grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-black/45 border border-abyss-border/40 p-4 rounded-xl relative group">
                                <div className="absolute top-0 left-0 w-8 h-[1px] bg-gradient-to-r from-transparent via-purple-400 to-transparent"></div>
                                <GiUpgrade className="text-purple-400 text-2xl mx-auto mb-1" />
                                <span className="text-[9px] uppercase tracking-wider text-abyss-muted block">XP Accrued</span>
                                <span className="font-mono text-xl font-bold text-purple-400">+{xpCount} XP</span>
                            </div>

                            <div className="bg-black/45 border border-abyss-border/40 p-4 rounded-xl relative group">
                                <div className="absolute top-0 left-0 w-8 h-[1px] bg-gradient-to-r from-transparent via-abyss-gold to-transparent"></div>
                                <GiCoins className="text-abyss-gold text-2xl mx-auto mb-1" />
                                <span className="text-[9px] uppercase tracking-wider text-abyss-muted block">Gold Earned</span>
                                <span className="font-mono text-xl font-bold text-abyss-gold">+{coinsCount}</span>
                            </div>
                        </div>

                        {/* First solved indicator */}
                        {isFirstSolve ? (
                            <div className="flex items-center justify-center space-x-2 text-xs text-green-400 font-sans border border-green-500/20 bg-green-500/5 py-2 rounded-lg">
                                <GiCheckMark className="text-xs" />
                                <span>First Completion Rewards Disbursed!</span>
                            </div>
                        ) : (
                            <div className="text-[10px] text-abyss-muted font-sans italic">
                                Sibling re-execution logged (no duplicate XP awarded).
                            </div>
                        )}

                        {/* Dynamic Current Tier */}
                        <div className="border-t border-abyss-border/20 pt-4 flex items-center justify-center space-x-3">
                            <LevelBadge level={currentLevel} size="sm" />
                            <div className="text-left">
                                <span className="text-[9px] uppercase tracking-wider text-abyss-muted block">Character Tier</span>
                                <span className="font-fantasy text-xs text-abyss-gold">LVL {currentLevel} Standing</span>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="pt-4 flex flex-col gap-3">
                            {onNext && (
                                <PrimaryButton
                                    onClick={onNext}
                                    className="w-full text-center py-3"
                                >
                                    Next Trial Coordinates
                                </PrimaryButton>
                            )}

                            <button
                                onClick={onClose}
                                className="font-fantasy text-xs uppercase text-abyss-muted hover:text-white tracking-widest transition-colors cursor-pointer block text-center"
                            >
                                Dismiss Portal
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default VictoryModal;
