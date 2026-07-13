import React from 'react';
import { GiGargoyle } from 'react-icons/gi';

const BossBadge = ({ unlocked = false }) => {
    return (
        <div className={`
            flex items-center space-x-1 px-2.5 py-0.5 rounded border text-[10px] font-fantasy uppercase tracking-wider
            ${unlocked 
                ? 'text-abyss-danger border-abyss-danger/40 bg-abyss-danger/10 shadow-glow-danger' 
                : 'text-abyss-muted border-abyss-border/40 bg-abyss-card/50'
            }
        `}>
            <GiGargoyle className={unlocked ? 'animate-pulse' : ''} />
            <span>{unlocked ? 'Boss Unlocked' : 'Boss Locked'}</span>
        </div>
    );
};

export default BossBadge;
