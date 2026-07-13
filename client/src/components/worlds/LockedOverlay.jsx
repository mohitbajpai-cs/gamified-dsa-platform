import React from 'react';
import { GiLockedFortress, GiChainMail, GiSparkles } from 'react-icons/gi';
import { motion } from 'framer-motion';

const LockedOverlay = ({ unlockLevel = 1 }) => {
    return (
        <div className="absolute inset-0 bg-slate-950/10 z-20 flex flex-col items-center justify-center text-center p-6 rounded-2xl transition-all duration-500 border border-abyss-gold/20 group-hover:border-abyss-gold/45 group-hover:bg-slate-950/5 overflow-hidden select-none">
            {/* Pulsating magic barrier glow */}
            <div className="absolute w-44 h-44 rounded-full border border-abyss-gold/5 bg-abyss-gold/5 blur-lg animate-pulse-slow"></div>

            {/* Glowing magic runes overlay decoration */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.08),transparent)] pointer-events-none"></div>

            {/* Floating Rune Circles (spinning in opposite directions) */}
            <div className="absolute w-40 h-40 border border-dashed border-abyss-gold/20 rounded-full animate-[spin_20s_linear_infinite] pointer-events-none group-hover:border-abyss-gold/45 group-hover:scale-105 transition-all duration-700"></div>
            <div className="absolute w-32 h-32 border border-dotted border-abyss-gold/15 rounded-full animate-[spin_15s_linear_infinite_reverse] pointer-events-none group-hover:border-abyss-gold/30"></div>

            {/* Cross chains design on the corners */}
            <div className="absolute top-4 left-4 text-abyss-gold/20 text-xl rotate-45">
                <GiChainMail />
            </div>
            <div className="absolute bottom-4 right-4 text-abyss-gold/20 text-xl rotate-45">
                <GiChainMail />
            </div>
            <div className="absolute top-4 right-4 text-abyss-gold/20 text-xl -rotate-45">
                <GiChainMail />
            </div>
            <div className="absolute bottom-4 left-4 text-abyss-gold/20 text-xl -rotate-45">
                <GiChainMail />
            </div>

            {/* Animated locks icon with pulse hover */}
            <motion.div
                animate={{ scale: [1, 1.04, 1] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                className="relative z-10"
            >
                <div className="w-14 h-14 rounded-full bg-black/60 border border-abyss-gold/35 flex items-center justify-center mx-auto shadow-glow-gold/20 group-hover:shadow-glow-gold/40 group-hover:border-abyss-gold/60 transition-all duration-300 mb-3">
                    <GiLockedFortress className="text-abyss-gold text-2xl filter drop-shadow-[0_0_6px_rgba(212,175,55,0.4)] animate-pulse" />
                </div>
            </motion.div>

            <h4 className="font-fantasy text-xs text-abyss-gold tracking-[0.25em] uppercase mb-1.5 relative z-10 font-bold">
                Sealed Realm
            </h4>
            
            <span className="font-mono text-[10px] font-bold text-white bg-black/50 border border-abyss-gold/20 px-2 py-0.5 rounded mb-2 relative z-10">
                REQUIRED LVL {unlockLevel}
            </span>

            <p className="font-sans text-[10px] text-abyss-muted max-w-[190px] leading-normal relative z-10">
                Align compiler leylines to break the protective barrier.
            </p>

            {/* Tooltip on hover */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/90 border border-abyss-gold/45 text-abyss-gold font-fantasy text-[9px] uppercase tracking-widest px-3 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap shadow-glow-gold/15 flex items-center space-x-1.5 z-30">
                <GiSparkles className="animate-spin text-[10px]" />
                <span>Reach Level {unlockLevel} to unlock this Realm.</span>
            </div>
        </div>
    );
};

export default LockedOverlay;
