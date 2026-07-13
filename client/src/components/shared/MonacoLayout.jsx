import React from 'react';
import Card from '../ui/Card';
import PrimaryButton from '../ui/PrimaryButton';
import SecondaryButton from '../ui/SecondaryButton';
import { GiScrollUnfurled } from 'react-icons/gi';

const MonacoLayout = () => {
    return (
        <Card className="h-[500px] flex flex-col justify-between border-abyss-primary/30">
            {/* Header controls bar */}
            <div className="flex items-center justify-between border-b border-abyss-border/40 pb-3 mb-4">
                <div className="flex items-center space-x-2">
                    <GiScrollUnfurled className="text-abyss-gold text-lg" />
                    <span className="font-fantasy text-xs uppercase tracking-widest text-abyss-gold font-bold">
                        Spells Editor (JavaScript)
                    </span>
                </div>
                <div className="flex items-center space-x-3">
                    <SecondaryButton className="px-3 py-1 text-xs">Run Tests</SecondaryButton>
                    <PrimaryButton className="px-3 py-1 text-xs">Submit Spell</PrimaryButton>
                </div>
            </div>

            {/* Code Lines Canvas (Mock Editor) */}
            <div className="flex-1 font-mono text-xs text-purple-300 bg-black/40 border border-abyss-border/30 rounded-lg p-4 space-y-2 overflow-y-auto leading-relaxed select-none">
                <p className="text-abyss-muted">// Cast your solution spell inside the signature void</p>
                <p><span className="text-purple-400">function</span> <span className="text-abyss-gold">solve</span>(input) &#123;</p>
                <p>&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-abyss-muted">// Write your logic here</span></p>
                <p>&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-purple-400">const</span> result = input;</p>
                <p>&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-purple-400">return</span> result;</p>
                <p>&#125;</p>
            </div>

            {/* Footer status bar */}
            <div className="flex justify-between items-center text-[10px] text-abyss-muted font-mono pt-3 border-t border-abyss-border/20 mt-4">
                <span>Tab Size: 4 Spaces</span>
                <span>Language: JS</span>
            </div>
        </Card>
    );
};

export default MonacoLayout;
