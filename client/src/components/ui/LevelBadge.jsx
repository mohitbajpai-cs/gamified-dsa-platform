import React from 'react';

const LevelBadge = ({ level, size = 'md' }) => {
    const sizeClasses = {
        sm: 'w-10 h-10 text-sm border-2',
        md: 'w-16 h-16 text-lg border-2',
        lg: 'w-24 h-24 text-2xl border-4'
    };

    return (
        <div className={`
            flex items-center justify-center rounded-full font-fantasy font-bold
            bg-gradient-to-b from-abyss-card to-black
            border-abyss-gold text-abyss-gold shadow-glow-gold
            ${sizeClasses[size] || sizeClasses.md}
        `}>
            {level}
        </div>
    );
};

export default LevelBadge;
