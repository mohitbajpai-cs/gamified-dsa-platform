import React from 'react';

const RealmBanner = ({ name, difficulty, description }) => {
    return (
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-abyss-card to-black border border-abyss-border p-8 mb-8 shadow-card">
            {/* Visual glow overlay */}
            <div className="absolute right-0 top-0 w-64 h-full bg-gradient-to-l from-abyss-primary/10 to-transparent pointer-events-none"></div>
            
            <div className="relative z-10 space-y-2 max-w-2xl">
                <div className="flex flex-wrap items-center gap-3">
                    <h1 className="font-fantasy text-3xl font-bold text-abyss-gold tracking-wider uppercase">
                        {name} Realm
                    </h1>
                    <span className="px-2.5 py-0.5 rounded text-[10px] uppercase font-fantasy tracking-wider border border-abyss-gold/20 text-abyss-gold bg-abyss-gold/5">
                        {difficulty}
                    </span>
                </div>
                <p className="font-sans text-sm text-abyss-muted leading-relaxed">
                    {description}
                </p>
            </div>
        </div>
    );
};

export default RealmBanner;
