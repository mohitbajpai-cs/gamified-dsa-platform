import React from 'react';
import Card from '../ui/Card';

const SubmissionPanel = () => {
    return (
        <Card className="bg-abyss-card border-abyss-border p-4 flex flex-col justify-between">
            <h5 className="font-fantasy text-xs text-abyss-gold tracking-widest uppercase border-b border-abyss-border/40 pb-2 mb-3">
                Historical Castings
            </h5>
            <div className="space-y-2 text-xs font-sans">
                <div className="flex justify-between items-center p-2.5 rounded bg-abyss-bg/60 border border-abyss-border/30">
                    <span className="text-abyss-success font-semibold uppercase tracking-wider text-[10px]">Accepted</span>
                    <span className="text-abyss-muted font-mono text-[10px]">12ms</span>
                    <span className="text-abyss-muted font-mono text-[10px]">2 hours ago</span>
                </div>
                <div className="flex justify-between items-center p-2.5 rounded bg-abyss-bg/60 border border-abyss-border/30">
                    <span className="text-abyss-danger font-semibold uppercase tracking-wider text-[10px]">Wrong Answer</span>
                    <span className="text-abyss-muted font-mono text-[10px]">--</span>
                    <span className="text-abyss-muted font-mono text-[10px]">Yesterday</span>
                </div>
            </div>
        </Card>
    );
};

export default SubmissionPanel;
