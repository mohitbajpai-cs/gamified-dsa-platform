import React from 'react';

const XpProgressBar = ({ current, max, showValues = true }) => {
    const percentage = Math.min(100, Math.max(0, (current / max) * 100)) || 0;

    return (
        <div className="w-full">
            <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-fantasy uppercase text-abyss-gold tracking-widest">XP Progress</span>
                {showValues && (
                    <span className="font-mono text-abyss-muted">
                        {current} / {max} XP
                    </span>
                )}
            </div>
            <div className="h-2.5 bg-black/40 rounded-full border border-abyss-border/40 overflow-hidden p-0.5">
                <div
                    style={{ width: `${percentage}%` }}
                    className="h-full bg-gradient-to-r from-abyss-primary to-purple-400 rounded-full shadow-glow-primary transition-all duration-500 ease-out"
                ></div>
            </div>
        </div>
    );
};

export default XpProgressBar;
