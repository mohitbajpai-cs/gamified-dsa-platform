import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GiSwordsPower, GiSparkles, GiCoins, GiUpgrade, GiTrophy } from 'react-icons/gi';

const BossIntroOverlay = ({ isOpen, boss, worldName, onClose, onEngage }) => {
    if (!isOpen) return null;

    // Relics mapping matching the realm configs
    const relicsMap = {
        'Cave of Beginnings': { name: 'Crystal Rune', desc: 'A pulsating shard of solid energy code.' },
        'Ocean of Challenges': { name: 'Abyssal Pearl', desc: 'Deep-ocean node that glows with logic threads.' },
        'Volcano of Mastery': { name: 'Magma Chain', desc: 'Liquid metal link securing heap storage memory.' },
        'Forest of Recursion': { name: 'Elder Branch', desc: 'Branch of recursion tree that loops forever.' },
        'Frozen Kingdom': { name: 'Ice Scepter', desc: 'Flares freezing binary winds to cut search blocks.' },
        'Ancient Tree Sanctuary': { name: 'Sacred Bark', desc: 'Polished shield of the World Tree roots.' },
        'Sky Citadel': { name: 'Thunder Scale', desc: 'Static scale carrying high queue priority.' },
        'Shadow Labyrinth': { name: 'Reaper Sickle', desc: 'Scythe of graph nodes capable of severing cycles.' },
        'Void Dimension': { name: 'Void Eye', desc: 'Stares into overlapping dimensions of dynamic storage.' }
    };

    const activeRelic = relicsMap[worldName] || { name: 'Abyss Relic', desc: 'A legendary code artifact.' };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-6 bg-black/95 backdrop-blur-md overflow-y-auto">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.06),transparent)] pointer-events-none"></div>

                <motion.div
                    initial={{ scale: 0.85, opacity: 0, y: 50 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.85, opacity: 0, y: 50 }}
                    transition={{ type: 'spring', stiffness: 100, damping: 15 }}
                    className="relative max-w-lg w-full bg-gradient-to-b from-red-950/20 via-black to-black border-2 border-red-500/40 rounded-3xl p-8 text-center space-y-6 shadow-glow-danger/25"
                >
                    {/* Glowing header line */}
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-red-500 to-transparent"></div>

                    <div className="space-y-2">
                        <span className="text-[10px] uppercase tracking-[0.25em] font-fantasy px-3 py-1 rounded bg-red-500/10 border border-red-500/35 text-red-400 animate-pulse">
                            Boss Encounter
                        </span>
                        
                        <div className="py-4">
                            <div className="w-24 h-24 rounded-full border-2 border-red-500/30 bg-red-500/5 flex items-center justify-center mx-auto shadow-glow-danger relative">
                                <GiSwordsPower className="text-red-500 text-5xl animate-bounce" />
                                <div className="absolute inset-0 rounded-full border border-red-500/10 animate-ping"></div>
                            </div>
                        </div>

                        <h2 className="font-fantasy text-3xl font-bold tracking-widest text-white uppercase leading-none">
                            {boss.bossName}
                        </h2>
                        <span className="text-[9px] uppercase tracking-widest font-fantasy text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded inline-block">
                            Difficulty: Boss Rank ★★★
                        </span>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-black/40 border border-abyss-border/40 p-4 rounded-xl space-y-2 text-left">
                            <span className="text-[9px] uppercase tracking-widest text-abyss-muted block">Zone coordinates</span>
                            <h4 className="font-fantasy text-xs text-white uppercase tracking-wider">{worldName}</h4>
                            <p className="font-sans text-[11px] text-abyss-muted leading-relaxed">
                                The dimensional seals have failed. Tackle this algorithms beast by compiling a flawless javascript spell.
                            </p>
                        </div>

                        {/* Rewards previews */}
                        <div className="space-y-2">
                            <span className="text-[9px] uppercase tracking-widest text-abyss-muted block text-left pl-1">Victory drop preview</span>
                            <div className="grid grid-cols-3 gap-3 text-center">
                                <div className="bg-black/50 border border-abyss-border/30 p-2.5 rounded-lg">
                                    <GiUpgrade className="text-purple-400 text-lg mx-auto" />
                                    <span className="text-[8px] text-abyss-muted uppercase block">XP</span>
                                    <span className="font-mono text-xs text-purple-400 font-bold">+{boss.reward.xp}</span>
                                </div>
                                <div className="bg-black/50 border border-abyss-border/30 p-2.5 rounded-lg">
                                    <GiCoins className="text-abyss-gold text-lg mx-auto" />
                                    <span className="text-[8px] text-abyss-muted uppercase block">Gold</span>
                                    <span className="font-mono text-xs text-abyss-gold font-bold">+{boss.reward.coins}</span>
                                </div>
                                <div className="bg-black/50 border border-purple-500/25 p-2.5 rounded-lg shadow-glow-primary/5">
                                    <GiTrophy className="text-purple-400 text-lg mx-auto" />
                                    <span className="text-[8px] text-abyss-muted uppercase block">Relic</span>
                                    <span className="font-fantasy text-[9px] text-purple-300 font-bold block truncate">{activeRelic.name}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CTA Actions */}
                    <div className="grid grid-cols-2 gap-4 pt-2">
                        <button
                            onClick={onClose}
                            className="bg-black/55 border border-abyss-border hover:bg-abyss-hover text-white font-fantasy text-xs uppercase tracking-widest py-3 rounded-xl transition-all cursor-pointer"
                        >
                            Retreat
                        </button>
                        <button
                            onClick={onEngage}
                            className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white font-fantasy text-xs uppercase tracking-widest py-3 rounded-xl transition-all shadow-glow-danger/20 font-bold cursor-pointer"
                        >
                            Engage Battle
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default BossIntroOverlay;
