import React from 'react';
import { motion as m } from 'framer-motion';
import LevelBadge from '../ui/LevelBadge';
import CoinCounter from '../ui/CoinCounter';
import RankBadge from '../ui/RankBadge';
import { GiGothicCross, GiEgyptianWalk, GiSwordsPower, GiUpgrade, GiTrophy } from 'react-icons/gi';

const loreQuotes = [
    "The spatial coordinates of the Abyss are bound by Array matrices.",
    "Solve the link list loop or be locked in the loop of eternity.",
    "Heed the recursion branches, for the tree of life grows from the void.",
    "Only a true architect can balance the Binary Search Trees of the protocol.",
    "Dynamic programming mends the shattered timelines of the Abyss."
];

const HeroSection = ({ progress, user }) => {
    const totalXp = progress?.totalXP ?? user?.xp ?? 0;
    const currentLevel = progress?.currentLevel ?? user?.level ?? 1;
    const nextLevelXp = progress?.nextLevelXP ?? 100;
    const totalCoins = progress?.totalCoins ?? user?.coins ?? 0;
    const completedProblems = progress?.completedProblems || [];
    const currentWorld = progress?.currentWorld;
    const currentStreak = progress?.currentStreak ?? 0;
    const currentTitle = user?.currentTitle || 'Void Walker';

    const quoteIndex = (user?.username?.length || 0) % loreQuotes.length;
    const quote = loreQuotes[quoteIndex];

    const xpPercentage = Math.min(100, Math.max(0, (totalXp / nextLevelXp) * 100)) || 0;

    return (
        <m.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-abyss-card to-black border border-abyss-gold/20 p-8 shadow-card"
        >
            {/* Visual Overlays */}
            <div className="absolute right-0 top-0 w-92 h-full bg-gradient-to-l from-abyss-primary/10 to-transparent pointer-events-none"></div>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.05),transparent)] pointer-events-none"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 bg-abyss-primary/10 rounded-full blur-[70px] pointer-events-none animate-pulse-slow"></div>

            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                {/* Left block (Greetings and Quote) */}
                <div className="space-y-3 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="text-[10px] uppercase tracking-[0.2em] font-fantasy px-2 py-0.5 rounded bg-abyss-gold/10 border border-abyss-gold/30 text-abyss-gold">
                            Protocol Breached
                        </span>
                        <span className="text-xs font-mono text-purple-400 font-semibold">{currentTitle}</span>
                    </div>
                    <h2 className="font-fantasy text-3xl sm:text-4xl font-bold tracking-widest text-white uppercase leading-none">
                        Welcome, {user?.username || 'Unknown Knight'}
                    </h2>
                    <p className="font-fantasy text-xs italic text-abyss-muted text-shadow-glow">
                        "{quote}"
                    </p>
                </div>

                {/* Right stats overview bar */}
                <div className="flex flex-wrap gap-4 items-center">
                    {/* Level */}
                    <div className="flex items-center space-x-2 bg-black/40 border border-abyss-border/40 px-4 py-2.5 rounded-lg shadow-inner">
                        <LevelBadge level={currentLevel} size="sm" />
                        <div>
                            <span className="text-[9px] uppercase tracking-widest text-abyss-muted block">Active Tier</span>
                            <span className="font-fantasy text-xs font-bold text-abyss-gold">LVL {currentLevel}</span>
                        </div>
                    </div>

                    {/* Streak */}
                    <div className="flex items-center space-x-2.5 bg-black/40 border border-abyss-border/40 px-4 py-2.5 rounded-lg shadow-inner">
                        <GiTrophy className="text-abyss-gold text-2xl filter drop-shadow-[0_0_5px_rgba(212,175,55,0.4)]" />
                        <div>
                            <span className="text-[9px] uppercase tracking-widest text-abyss-muted block">Day Streak</span>
                            <span className="font-mono text-sm font-bold text-white">{currentStreak} Days</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Progression Bar */}
            <div className="mt-8 pt-6 border-t border-abyss-border/20 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                {/* XP Bar */}
                <div className="md:col-span-2">
                    <div className="flex justify-between items-center text-xs mb-1.5 font-mono">
                        <span className="text-purple-400 uppercase font-fantasy tracking-wider">Experience Points</span>
                        <span className="text-abyss-muted">{totalXp} / {nextLevelXp} XP</span>
                    </div>
                    <div className="h-2 bg-black/50 rounded-full border border-abyss-border/30 overflow-hidden">
                        <m.div
                            initial={{ width: 0 }}
                            animate={{ width: `${xpPercentage}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="h-full bg-gradient-to-r from-abyss-primary to-purple-400 rounded-full shadow-glow-primary"
                        ></m.div>
                    </div>
                </div>

                {/* Micro Stats */}
                <div className="flex justify-between md:justify-around text-xs font-sans">
                    <div className="text-center">
                        <span className="text-abyss-muted block text-[10px] uppercase tracking-wider">Active Realm</span>
                        <span className="text-white font-fantasy font-semibold uppercase">{currentWorld?.name || 'Arrays'}</span>
                    </div>
                    <div className="text-center">
                        <span className="text-abyss-muted block text-[10px] uppercase tracking-wider">Solved Trials</span>
                        <span className="text-white font-mono font-semibold">{completedProblems.length} Tasks</span>
                    </div>
                    <div className="text-center">
                        <span className="text-abyss-muted block text-[10px] uppercase tracking-wider">Gold Coins</span>
                        <span className="text-abyss-gold font-mono font-bold">+{totalCoins}</span>
                    </div>
                </div>
            </div>
        </m.div>
    );
};

export default HeroSection;
