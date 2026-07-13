import React from 'react';
import { motion } from 'framer-motion';
import { GiGothicCross, GiSparkles } from 'react-icons/gi';
import PrimaryButton from '../ui/PrimaryButton';

const RealmSidebar = ({ realm, playerLevel = 1, onEnter }) => {
    const {
        name,
        difficulty,
        completedProblems = 0,
        totalProblems = 9,
        xpReward = 500,
        coinReward = 100,
        unlockLevel = 1,
        isLocked = false,
        isCompleted = false,
        boss = 'Stone Golem',
        lore = 'Unlocks adventure.',
        color = 'text-purple-400',
        bg = 'from-purple-950/40 to-black',
        iconGlow = 'drop-shadow-[0_0_12px_rgba(168,85,247,0.5)]',
        icon: RealmIcon,
        topic = 'Algorithms',
        image = '/cave.jpg'
    } = realm;

    const locked = isLocked || playerLevel < unlockLevel;
    const pct = totalProblems > 0 ? Math.round((completedProblems / totalProblems) * 100) : 0;

    return (
        <div className="relative border-4 border-double border-abyss-gold/40 rounded-2xl bg-black/90 p-6 flex flex-col justify-between space-y-6 shadow-[0_8px_32px_rgba(0,0,0,0.8)] overflow-hidden">
            {/* Ambient Background Gold Glows */}
            <div className="absolute -right-16 -top-16 w-32 h-32 bg-abyss-gold/10 rounded-full blur-2xl pointer-events-none z-0"></div>
            <div className="absolute -left-16 -bottom-16 w-32 h-32 bg-abyss-primary/10 rounded-full blur-2xl pointer-events-none z-0"></div>

            {/* Corner Decorative Cross Brackets */}
            <div className="absolute top-2 left-2 text-abyss-gold/30 text-xs"><GiGothicCross /></div>
            <div className="absolute top-2 right-2 text-abyss-gold/30 text-xs"><GiGothicCross /></div>
            <div className="absolute bottom-2 left-2 text-abyss-gold/30 text-xs"><GiGothicCross /></div>
            <div className="absolute bottom-2 right-2 text-abyss-gold/30 text-xs"><GiGothicCross /></div>

            {/* 1. Animated Realm Banner Header */}
            <div className="relative h-40 rounded-xl overflow-hidden border border-abyss-border/40 z-10 group">
                <img 
                    src={image} 
                    alt={name} 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 filter contrast-[1.08] saturate-[1.12]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                
                {/* Floating particles inside banner */}
                <div className="absolute inset-0 flex items-center justify-around opacity-40">
                    <span className="w-1 h-1 bg-white rounded-full animate-ping"></span>
                    <span className="w-1.5 h-1.5 bg-abyss-gold rounded-full animate-ping [animation-delay:1s]"></span>
                </div>

                <div className="absolute bottom-3 left-4 flex items-center space-x-2.5">
                    {RealmIcon && (
                        <div className={`p-1.5 rounded-lg bg-black/60 border border-abyss-border/50 ${color} ${iconGlow}`}>
                            <RealmIcon className="text-xl" />
                        </div>
                    )}
                    <div>
                        <h4 className="font-fantasy text-sm font-bold text-white uppercase tracking-wider">{name}</h4>
                        <span className="text-[8px] font-mono uppercase text-abyss-gold">{difficulty}</span>
                    </div>
                </div>
            </div>

            {/* 2. Content Detail & Lore */}
            <div className="space-y-4 z-10 relative">
                <div>
                    <span className="text-[9px] font-fantasy uppercase tracking-widest text-abyss-gold block mb-1">Chronicles</span>
                    <p className="font-sans text-xs text-abyss-muted leading-relaxed italic">
                        "{lore}"
                    </p>
                </div>

                <div className="pt-3 border-t border-abyss-border/20 grid grid-cols-2 gap-4 text-xs font-mono text-abyss-muted uppercase">
                    <div>
                        <span className="block text-[8px] text-abyss-muted/60">Guardian</span>
                        <span className="text-red-400 font-bold block truncate">{boss}</span>
                    </div>
                    <div>
                        <span className="block text-[8px] text-abyss-muted/60">Focus Topic</span>
                        <span className="text-white font-bold block truncate">{topic}</span>
                    </div>
                </div>
            </div>

            {/* 3. Radial Progress Meter */}
            <div className="flex flex-col items-center justify-center p-4 bg-white/[0.01] border border-white/5 rounded-xl z-10 space-y-3">
                <span className="text-[9px] font-fantasy uppercase tracking-widest text-abyss-gold">Conquer Status</span>
                
                <div className="relative w-28 h-28 flex items-center justify-center">
                    {/* SVG Circle Progress */}
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle 
                            cx="50" cy="50" r="40" 
                            className="stroke-abyss-border/20 fill-none" 
                            strokeWidth="6"
                        />
                        <circle 
                            cx="50" cy="50" r="40" 
                            className="stroke-abyss-gold fill-none transition-all duration-1000" 
                            strokeWidth="6" 
                            strokeDasharray={251.2}
                            strokeDashoffset={251.2 - (251.2 * pct) / 100}
                            strokeLinecap="round"
                        />
                    </svg>
                    <div className="absolute text-center">
                        <span className="font-fantasy text-xl font-bold text-white block">{pct}%</span>
                        <span className="text-[8px] font-sans text-abyss-muted uppercase tracking-widest">{completedProblems}/{totalProblems} Solved</span>
                    </div>
                </div>
            </div>

            {/* 4. Bounty Rewards & CTA */}
            <div className="space-y-4 pt-3 border-t border-abyss-border/20 z-10">
                <div className="flex justify-between items-center text-xs">
                    <span className="text-abyss-muted font-sans uppercase tracking-wider">Completion Bounty</span>
                    <div className="flex items-center space-x-2 font-mono font-bold text-sm">
                        <span className="text-purple-400">+{xpReward} XP</span>
                        <span className="text-abyss-gold">+{coinReward} G</span>
                    </div>
                </div>

                <PrimaryButton
                    onClick={onEnter}
                    disabled={locked}
                    className="w-full text-center py-3 font-fantasy uppercase tracking-widest text-xs relative overflow-hidden group/btn cursor-pointer"
                >
                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/15 to-transparent transform -translateX-full group-hover/btn:animate-shine pointer-events-none"></span>
                    {isCompleted ? 'Cast Portal Spell' : locked ? 'Sanctuary Locked' : 'Conquer Realm'}
                </PrimaryButton>
            </div>
        </div>
    );
};

export default RealmSidebar;
