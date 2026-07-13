import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GiTrophy, GiSparkles, GiCoins, GiUpgrade } from 'react-icons/gi';

const MASTER_ACHIEVEMENTS = {
    'First Blood': { title: 'First Blood', description: 'Solved your first challenge in the Abyss.', rarity: 'Common', xp: 100, coins: 20 },
    'Novice Solver': { title: 'Novice Solver', description: 'Solved 5 challenges.', rarity: 'Common', xp: 150, coins: 40 },
    'Array Master': { title: 'Array Master', description: 'Solved 10 Array problems.', rarity: 'Rare', xp: 250, coins: 80 },
    'String Mage': { title: 'String Mage', description: 'Solved 10 String problems.', rarity: 'Rare', xp: 250, coins: 80 },
    'Tree Guardian': { title: 'Tree Guardian', description: 'Solved 10 Tree problems.', rarity: 'Rare', xp: 250, coins: 80 },
    'Graph Explorer': { title: 'Graph Explorer', description: 'Solved 10 Graph problems.', rarity: 'Epic', xp: 400, coins: 150 },
    'DP Champion': { title: 'DP Champion', description: 'Solved 10 DP problems.', rarity: 'Epic', xp: 500, coins: 200 },
    'Speed Runner': { title: 'Speed Runner', description: 'Completed any challenge in under 2 minutes.', rarity: 'Rare', xp: 200, coins: 50 },
    'Boss Slayer': { title: 'Boss Slayer', description: 'Defeated a Boss Guardian.', rarity: 'Epic', xp: 500, coins: 150 },
    'Realm Conqueror': { title: 'Realm Conqueror', description: 'Fully conquered any Realm.', rarity: 'Epic', xp: 600, coins: 200 },
    'Abyss Legend': { title: 'Abyss Legend', description: 'Unlocked and conquered the final Abyss Throne.', rarity: 'Legendary', xp: 1000, coins: 500 }
};

const AchievementPopup = ({ achievements = [], onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (achievements && achievements.length > 0) {
            setIsOpen(true);
            setCurrentIndex(0);
            
            // Sound hook placeholder
            try {
                // Audio Hook: Play achievement unlock sound jingle
            } catch (err) {}
        } else {
            setIsOpen(false);
        }
    }, [achievements]);

    if (!isOpen || achievements.length === 0) return null;

    const currentTitle = achievements[currentIndex];
    const data = MASTER_ACHIEVEMENTS[currentTitle] || {
        title: currentTitle,
        description: 'Completed a milestone dungeon challenge.',
        rarity: 'Common',
        xp: 100,
        coins: 50
    };

    const handleNext = () => {
        if (currentIndex < achievements.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            setIsOpen(false);
            if (onClose) onClose();
        }
    };

    const rarityStyles = {
        Common: 'text-abyss-muted border-abyss-border/40 shadow-sm',
        Rare: 'text-cyan-400 border-cyan-500/30 shadow-glow-primary/10',
        Epic: 'text-purple-400 border-purple-500/30 shadow-glow-primary',
        Legendary: 'text-abyss-gold border-abyss-gold/40 shadow-glow-gold'
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
                    {/* Floating particle glows */}
                    <div className="absolute w-72 h-72 rounded-full bg-abyss-gold/5 blur-[80px] pointer-events-none animate-pulse-slow"></div>

                    <motion.div
                        initial={{ scale: 0.8, opacity: 0, rotateY: -90 }}
                        animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                        exit={{ scale: 0.8, opacity: 0, rotateY: 90 }}
                        transition={{ type: 'spring', stiffness: 100, damping: 15 }}
                        className="relative max-w-sm w-full bg-gradient-to-b from-abyss-card via-black to-black border-2 border-abyss-gold/50 rounded-3xl p-8 text-center space-y-6 shadow-glow-gold/30 overflow-hidden"
                    >
                        {/* Golden borders decoration */}
                        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-abyss-gold to-transparent"></div>

                        <div className="space-y-2">
                            <span className="text-[9px] uppercase tracking-[0.2em] font-fantasy px-2.5 py-0.5 rounded bg-abyss-gold/15 border border-abyss-gold/30 text-abyss-gold">
                                Achievement Unlocked!
                            </span>
                            <div className={`w-20 h-20 rounded-full bg-black/50 border-2 flex items-center justify-center mx-auto mt-4 ${rarityStyles[data.rarity] || rarityStyles.Common}`}>
                                <GiTrophy className="text-4xl animate-bounce" />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <h2 className="font-fantasy text-2xl font-bold tracking-widest text-white uppercase leading-none">
                                {data.title}
                            </h2>
                            <span className="text-[8px] uppercase tracking-widest px-2 py-0.5 rounded border border-current font-fantasy font-bold inline-block text-abyss-gold">
                                {data.rarity}
                            </span>
                            <p className="font-sans text-xs text-abyss-muted leading-relaxed px-2">
                                "{data.description}"
                            </p>
                        </div>

                        {/* Reward Loot box */}
                        <div className="grid grid-cols-2 gap-3 pt-2">
                            <div className="bg-black/45 border border-abyss-border/40 p-3.5 rounded-xl relative">
                                <GiUpgrade className="text-purple-400 text-xl mx-auto mb-0.5" />
                                <span className="text-[8px] uppercase tracking-wider text-abyss-muted block">XP Reward</span>
                                <span className="font-mono text-sm font-bold text-purple-400">+{data.xp} XP</span>
                            </div>

                            <div className="bg-black/45 border border-abyss-border/40 p-3.5 rounded-xl relative">
                                <GiCoins className="text-abyss-gold text-xl mx-auto mb-0.5" />
                                <span className="text-[8px] uppercase tracking-wider text-abyss-muted block">Coins Awarded</span>
                                <span className="font-mono text-sm font-bold text-abyss-gold">+{data.coins}</span>
                            </div>
                        </div>

                        <button
                            onClick={handleNext}
                            className="w-full bg-gradient-to-r from-abyss-gold to-yellow-600 hover:from-yellow-600 hover:to-abyss-gold text-black font-fantasy text-xs uppercase tracking-widest py-3.5 rounded-xl transition-all shadow-glow-gold/15 cursor-pointer font-bold relative overflow-hidden group"
                        >
                            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent transform -translateX-full group-hover:animate-shine pointer-events-none"></span>
                            <span>{currentIndex < achievements.length - 1 ? 'Acknowledge scroll (Next)' : 'Acknowledge scroll'}</span>
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default AchievementPopup;
