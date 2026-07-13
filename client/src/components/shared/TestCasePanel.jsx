import React from 'react';
import Card from '../ui/Card';

const TestCasePanel = () => {
    return (
        <Card className="bg-abyss-card border-abyss-border p-4 flex flex-col justify-between">
            <h5 className="font-fantasy text-xs text-abyss-gold tracking-widest uppercase border-b border-abyss-border/40 pb-2 mb-3">
                Dungeon Test Cases
            </h5>
            <div className="space-y-3 font-sans text-xs">
                <div className="flex space-x-2">
                    <span className="px-2 py-0.5 rounded bg-abyss-bg border border-abyss-gold/20 text-abyss-gold font-mono">Case 1</span>
                    <span className="px-2 py-0.5 rounded bg-abyss-bg border border-abyss-border text-abyss-muted font-mono">Case 2</span>
                </div>
                <div className="space-y-2 bg-black/30 p-3 rounded border border-abyss-border/40">
                    <p className="font-mono text-[11px] text-abyss-muted">Input: <span className="text-white">[1, 2, 3]</span></p>
                    <p className="font-mono text-[11px] text-abyss-muted">Expected: <span className="text-white">[3, 2, 1]</span></p>
                </div>
            </div>
        </Card>
    );
};

export default TestCasePanel;
