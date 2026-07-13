import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GiLockedFortress } from 'react-icons/gi';
import { FaChevronRight } from 'react-icons/fa';
import RealmProgress from './RealmProgress';

const RealmCard = ({ realm, index = 0, playerLevel = 1, onEnter, isSelected = false }) => {
    const { 
        name, 
        difficulty, 
        completedProblems = 0, 
        totalProblems = 9, 
        xpReward = 500, 
        unlockLevel = 1, 
        isLocked = false, 
        isCompleted = false,
        lore = 'Unlocks adventure.',
        color = 'text-purple-400',
        borderColor = 'border-purple-500/25',
        themeGlow = 'shadow-[0_0_20px_rgba(168,85,247,0.15)]',
        iconGlow = 'drop-shadow-[0_0_12px_rgba(168,85,247,0.5)]',
        border = 'hover:border-purple-500/40',
        icon: RealmIcon,
        image = '/cave.jpg'
    } = realm;
    
    const locked = isLocked || playerLevel < unlockLevel;
    const [isEntering, setIsEntering] = useState(false);

    const handleEnterPortal = (e) => {
        e.stopPropagation();
        if (locked) return;
        setIsEntering(true);
        setTimeout(() => {
            onEnter();
        }, 1100);
    };

    // Render unique ambient elements (lightweight particles/shimmer)
    const renderAmbientEffects = () => {
        const lowerName = name.toLowerCase();
        if (lowerName.includes('beginnings')) {
            return (
                <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
                    <div className="absolute inset-0 bg-purple-500/5 mix-blend-color-dodge animate-[valthor-shimmer_4s_ease-in-out_infinite]"></div>
                    <div className="absolute inset-0 flex items-center justify-around opacity-40">
                        <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-[valthor-float-up_6s_linear_infinite]"></span>
                        <span className="w-1 h-1 bg-indigo-400 rounded-full animate-[valthor-float-up_4s_linear_infinite_1.5s]"></span>
                    </div>
                </div>
            );
        }
        if (lowerName.includes('challenges')) {
            return (
                <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
                    <div className="absolute inset-0 bg-[linear-gradient(115deg,transparent_40%,rgba(34,211,238,0.1)_50%,transparent_60%)] bg-[length:200%_100%] animate-shine"></div>
                    <div className="absolute bottom-0 inset-x-0 h-16 flex justify-around opacity-40">
                        <span className="w-1 h-1 bg-cyan-300 rounded-full animate-ping [animation-delay:0.2s]"></span>
                        <span className="w-1.5 h-1.5 bg-blue-300 rounded-full animate-ping [animation-delay:0.8s]"></span>
                    </div>
                </div>
            );
        }
        if (lowerName.includes('mastery')) {
            return (
                <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
                    <div className="absolute bottom-0 inset-x-0 h-8 bg-gradient-to-t from-red-500/25 to-transparent blur-md"></div>
                    <div className="absolute bottom-2 inset-x-0 h-24 flex justify-around opacity-50">
                        <span className="w-1 h-1 bg-red-400 rounded-full animate-[valthor-float-up_3s_linear_infinite]"></span>
                        <span className="w-1 h-1 bg-orange-400 rounded-full animate-[valthor-float-up_5s_linear_infinite_1s]"></span>
                    </div>
                </div>
            );
        }
        if (lowerName.includes('recursion')) {
            return (
                <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.1),transparent_60%)]"></div>
                    <div className="absolute inset-0 flex justify-around items-center opacity-40">
                        <span className="w-1 h-1 bg-emerald-400 rounded-full animate-pulse [animation-delay:0.2s] translate-x-4"></span>
                        <span className="w-1 h-1 bg-green-300 rounded-full animate-pulse [animation-delay:0.6s] -translate-x-8"></span>
                    </div>
                </div>
            );
        }
        if (lowerName.includes('frozen') || lowerName.includes('peaks') || lowerName.includes('kingdom')) {
            return (
                <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
                    <div className="absolute inset-0 flex justify-around items-center opacity-50">
                        <span className="w-1 h-1 bg-blue-200 rounded-full animate-[valthor-snowflake_7s_linear_infinite]"></span>
                        <span className="w-1 h-1 bg-white rounded-full animate-[valthor-snowflake_5s_linear_infinite_2s]"></span>
                    </div>
                </div>
            );
        }
        if (lowerName.includes('sanctuary') || lowerName.includes('golden')) {
            return (
                <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
                    <div className="absolute inset-0 flex justify-around items-center opacity-40">
                        <span className="w-1 h-1 bg-yellow-300 rounded-full animate-pulse [animation-delay:0.3s]"></span>
                        <span className="w-1 h-1 bg-amber-400 rounded-full animate-pulse [animation-delay:0.9s] translate-y-4"></span>
                    </div>
                </div>
            );
        }
        if (lowerName.includes('citadel')) {
            return (
                <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(45,212,191,0.1),transparent_50%)]"></div>
                </div>
            );
        }
        if (lowerName.includes('labyrinth')) {
            return (
                <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.1),transparent_60%)] animate-pulse-slow"></div>
                </div>
            );
        }
        if (lowerName.includes('void') || lowerName.includes('nexus') || lowerName.includes('dimension')) {
            return (
                <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(244,114,182,0.1),transparent_60%)] animate-pulse-slow"></div>
                    <div className="absolute inset-0 flex justify-around items-center opacity-40">
                        <span className="w-1 h-1 bg-pink-300 rounded-full animate-ping [animation-delay:0.2s]"></span>
                        <span className="w-1 h-1 bg-purple-300 rounded-full animate-ping [animation-delay:0.8s] translate-y-8"></span>
                    </div>
                </div>
            );
        }
        return null;
    };

    const pct = totalProblems > 0 ? Math.round((completedProblems / totalProblems) * 100) : 0;

    return (
        <>
            {/* Inline Keyframes styles block to keep animations fully hardware-accelerated */}
            <style>{`
                @keyframes valthor-float-up {
                    0% { transform: translateY(105%) translateX(0); opacity: 0; }
                    50% { opacity: 0.6; }
                    100% { transform: translateY(-10%) translateX(8px); opacity: 0; }
                }
                @keyframes valthor-snowflake {
                    0% { transform: translateY(-10%) translateX(0); opacity: 0; }
                    50% { opacity: 0.8; }
                    100% { transform: translateY(110%) translateX(-15px); opacity: 0; }
                }
                @keyframes valthor-shimmer {
                    0% { filter: brightness(1); }
                    50% { filter: brightness(1.1); }
                    100% { filter: brightness(1); }
                }
            `}</style>

            {/* Full-viewport Teleportation Portal Transition Overlay */}
            <AnimatePresence>
                {isEntering && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/95 backdrop-blur-xl"
                    >
                        <motion.div 
                            initial={{ scale: 0.1, opacity: 1, borderWidth: "2px" }}
                            animate={{ scale: 25, opacity: 0, borderWidth: "8px" }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className={`w-24 h-24 rounded-full border-double ${color} border-current absolute bg-transparent filter blur-sm`}
                        />
                        <motion.div 
                            initial={{ scale: 0.1, opacity: 0.8 }}
                            animate={{ scale: 18, opacity: 0 }}
                            transition={{ duration: 1.2, delay: 0.15, ease: "easeOut" }}
                            className={`w-24 h-24 rounded-full border-dashed ${color} border-current absolute bg-transparent filter blur-[1px]`}
                        />
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                            className={`w-32 h-32 rounded-full border border-dotted ${color} border-current flex items-center justify-center opacity-30`}
                        />
                        <motion.div 
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: [1, 1.3, 1], opacity: 1 }}
                            transition={{ duration: 0.8, repeat: Infinity }}
                            className="relative z-10 text-center space-y-4"
                        >
                            {RealmIcon && (
                                <RealmIcon className={`${color} text-6xl mx-auto filter ${iconGlow} animate-spin`} />
                            )}
                            <h3 className="font-fantasy text-xl font-bold tracking-[0.3em] uppercase text-white animate-pulse">
                                Aligning Leylines...
                            </h3>
                            <p className="font-sans text-[10px] text-abyss-muted tracking-wider uppercase">
                                Teleporting to {name} Dungeon
                            </p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div 
                className={`relative rounded-2xl flex flex-col lg:flex-row border border-white/10 hover:border-abyss-gold/45 overflow-hidden group transition-all duration-500 shadow-[0_4px_30px_rgba(0,0,0,0.6)] ${locked ? '' : border} ${isSelected ? 'border-abyss-gold/70 shadow-[0_0_20px_rgba(212,175,55,0.25)]' : ''}`}
            >
                {/* 1. LEFT SECTION (60% width): Large Cinematic Artwork & Info Banner */}
                <div className="relative lg:w-[60%] w-full h-[240px] overflow-hidden flex-shrink-0 z-0">
                    <img 
                        src={image} 
                        alt={name} 
                        className={`absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 filter contrast-[1.12] saturate-[1.20] ${locked ? 'brightness-[0.9] saturate-[1.05]' : 'brightness-100 saturate-100'}`}
                    />
                    
                    {/* Unique Ambient Overlay Effects */}
                    {renderAmbientEffects()}

                    {/* Gradient shading overlay for text legibility */}
                    <div className="absolute inset-0 bg-black/10 z-10"></div>
                    <div className="absolute inset-x-0 bottom-0 h-full bg-gradient-to-r from-black/90 via-black/45 to-transparent z-10 pointer-events-none"></div>

                    {/* Left text overlaid directly on top of the environment artwork */}
                    <div className="absolute inset-y-0 left-0 p-8 flex flex-col justify-center space-y-3.5 z-20 max-w-sm">
                        <div className="space-y-1">
                            <h3 className={`font-fantasy text-xl font-bold tracking-wide uppercase leading-tight ${color}`}>
                                {name}
                            </h3>
                            <span className={`text-[8px] font-sans font-bold uppercase tracking-[0.2em] px-2 py-0.5 rounded border ${borderColor} bg-black/45 w-fit block`}>
                                {difficulty}
                            </span>
                        </div>
                        <p className="text-[10px] text-white/80 leading-relaxed font-sans font-medium line-clamp-3">
                            {lore}
                        </p>
                    </div>

                    {/* Locked Golden Chains & Runes Seal overlay */}
                    {locked && (
                        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/20 pointer-events-none">
                            {/* Magical Rune Circle */}
                            <div className="absolute w-32 h-32 border border-dashed border-abyss-gold/25 rounded-full animate-[spin_20s_linear_infinite]"></div>
                            <div className="absolute w-24 h-24 border border-dotted border-abyss-gold/20 rounded-full animate-[spin_15s_linear_infinite_reverse]"></div>
                            
                            {/* Golden Chains */}
                            <svg className="absolute inset-0 w-full h-full text-abyss-gold/30 stroke-current stroke-2 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                                <line x1="0" y1="0" x2="100%" y2="100%" strokeDasharray="6,6" className="animate-pulse" />
                                <line x1="100%" y1="0" x2="0" y2="100%" strokeDasharray="6,6" className="animate-pulse" />
                            </svg>

                            {/* Floating Lock Seal */}
                            <div className="w-10 h-10 rounded-full bg-black/80 border border-abyss-gold/40 flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.3)] animate-pulse">
                                <GiLockedFortress className="text-abyss-gold text-base" />
                            </div>
                            <span className="mt-2 text-[9px] uppercase font-mono tracking-widest text-white bg-black/75 px-2 py-0.5 rounded border border-abyss-gold/20">
                                REQUIRED LVL {unlockLevel}
                            </span>
                        </div>
                    )}
                </div>

                {/* 2. CENTER SECTION (25% width): Progress details & ENTER button */}
                <div className="lg:w-[25%] w-full p-6 bg-[#0d111d]/90 border-t lg:border-t-0 lg:border-x border-white/5 flex flex-col justify-between z-10 relative">
                    <div className="space-y-4">
                        {/* Progress */}
                        <div className="space-y-1">
                            <div className="flex justify-between text-[9px] text-abyss-muted uppercase tracking-wider font-bold">
                                <span>PROGRESS</span>
                                <span className="text-white font-bold">{pct}%</span>
                            </div>
                            <RealmProgress completed={completedProblems} total={totalProblems} />
                        </div>

                        {/* Levels Completed */}
                        <div className="flex flex-col space-y-0.5 text-left">
                            <span className="text-[7px] text-abyss-muted uppercase tracking-widest font-bold font-sans">
                                LEVELS COMPLETED
                            </span>
                            <span className="font-fantasy text-sm font-bold text-white block">
                                {completedProblems} / {totalProblems}
                            </span>
                        </div>
                    </div>

                    <div className="pt-4">
                        {!locked ? (
                            <button
                                onClick={handleEnterPortal}
                                className="w-full relative z-10 py-3.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-[9px] font-fantasy uppercase tracking-widest text-white hover:text-abyss-gold transition-all cursor-pointer font-bold flex items-center justify-center gap-1.5 shadow-[0_4px_12px_rgba(0,0,0,0.3)]"
                            >
                                <span>ENTER REALM</span>
                                <FaChevronRight className="text-[7px] text-abyss-gold group-hover:translate-x-0.5 transition-transform" />
                            </button>
                        ) : (
                            <span className="w-full block text-center relative z-10 text-[9px] font-fantasy uppercase tracking-widest text-abyss-muted bg-white/5 border border-white/10 py-3 rounded">
                                SEALED PORTAL
                            </span>
                        )}
                    </div>
                </div>

                {/* 3. RIGHT SECTION (15% width): Dedicated Animated Vertical Fantasy Panel */}
                <div className="lg:w-[15%] w-full bg-gradient-to-b from-black/95 to-black/98 p-4 flex flex-col items-center justify-center border-t lg:border-t-0 lg:border-l-4 lg:border-double border-abyss-gold/30 min-h-[190px] lg:min-h-0 z-10 relative overflow-hidden text-center">
                    {/* Ambient Glows & Moving Particles */}
                    <div className={`absolute inset-0 bg-gradient-to-b ${color.includes('purple') ? 'from-purple-500/10' : color.includes('blue') ? 'from-blue-500/10' : 'from-red-500/10'} via-transparent to-transparent opacity-60 z-0`}></div>
                    <div className="absolute inset-0 flex items-center justify-around opacity-30 pointer-events-none z-0">
                        <span className="w-1 h-1 bg-white rounded-full animate-ping"></span>
                        <span className="w-0.5 h-0.5 bg-abyss-gold rounded-full animate-ping [animation-delay:1.5s]"></span>
                    </div>

                    {/* Top: Magical Ribbon Banner */}
                    <div className="absolute top-0 w-8 h-4 bg-abyss-gold/15 border-b border-x border-abyss-gold/30 rounded-b-md z-0 flex items-center justify-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-abyss-gold animate-pulse"></span>
                    </div>

                    {/* Center: Animated Sigil & Progress Ring */}
                    <div className="relative w-20 h-20 flex items-center justify-center z-10">
                        <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                            <circle 
                                cx="50" cy="50" r="42" 
                                className="stroke-white/5 fill-none" 
                                strokeWidth="4"
                            />
                            <circle 
                                cx="50" cy="50" r="42" 
                                className="stroke-abyss-gold fill-none transition-all duration-1000" 
                                strokeWidth="4" 
                                strokeDasharray={263.8}
                                strokeDashoffset={263.8 - (263.8 * pct) / 100}
                                strokeLinecap="round"
                            />
                        </svg>

                        {RealmIcon && (
                            <motion.div
                                animate={locked ? {} : { rotate: [0, 5, -5, 0] }}
                                transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
                                className="relative z-10"
                            >
                                <div className={`w-12 h-12 rounded-full bg-black/60 border border-white/10 flex items-center justify-center shadow-[0_0_10px_rgba(255,255,255,0.02)] group-hover:border-abyss-gold/40 group-hover:shadow-[0_0_15px_rgba(212,175,55,0.15)] transition-all duration-500`}>
                                    <RealmIcon className={`${color} text-xl filter ${iconGlow}`} />
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Bottom: Completion % & Title */}
                    <div className="mt-3.5 space-y-0.5 z-10">
                        <span className="font-fantasy text-xs font-bold text-white block">
                            {pct}%
                        </span>
                        <span className="text-[7px] font-sans uppercase tracking-widest text-abyss-muted block">
                            Conquered
                        </span>
                    </div>
                </div>
            </div>
        </>
    );
};

export default RealmCard;
