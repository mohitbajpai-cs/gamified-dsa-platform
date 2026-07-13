import React from 'react';

const RealmProgress = ({ completed = 0, total = 9 }) => {
    const percentage = Math.min(100, Math.max(0, (completed / total) * 100)) || 0;

    return (
        <div className="w-full">
            <div className="flex justify-between items-center text-xs mb-1 font-sans">
                <span className="text-abyss-muted">Realm Progress</span>
                <span className="font-mono text-abyss-gold font-semibold">{completed}/{total} Solved</span>
            </div>
            <div className="h-1.5 bg-black/40 rounded-full border border-abyss-border/40 overflow-hidden">
                <div
                    style={{ width: `${percentage}%` }}
                    className="h-full bg-gradient-to-r from-abyss-gold to-yellow-500 rounded-full shadow-glow-gold transition-all duration-500 ease-out"
                ></div>
            </div>
        </div>
    );
};

export default RealmProgress;
