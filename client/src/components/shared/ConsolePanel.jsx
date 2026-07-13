import React from 'react';
import Card from '../ui/Card';

const ConsolePanel = () => {
    return (
        <Card className="bg-black/60 border-abyss-border p-4 flex flex-col justify-between">
            <h5 className="font-fantasy text-xs text-abyss-gold tracking-widest uppercase border-b border-abyss-border/40 pb-2 mb-3">
                Spell Output Console
            </h5>
            <div className="font-mono text-[11px] text-green-400 space-y-1.5 leading-relaxed">
                <p className="text-abyss-muted">&gt; Ready to execute spells...</p>
                <p>&gt; Status: Idle</p>
            </div>
        </Card>
    );
};

export default ConsolePanel;
