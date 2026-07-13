import React from 'react';
import { GiScrollUnfurled } from 'react-icons/gi';

const EmptyState = ({ title = 'No Scrolls Found', description = 'The library of the abyss remains void of records.' }) => {
    return (
        <div className="flex flex-col items-center justify-center text-center p-8 bg-abyss-card/30 border border-dashed border-abyss-border rounded-xl">
            <GiScrollUnfurled className="text-abyss-muted text-5xl mb-4" />
            <h4 className="font-fantasy text-lg text-abyss-gold tracking-wide uppercase mb-1">{title}</h4>
            <p className="font-sans text-xs text-abyss-muted max-w-xs leading-relaxed">{description}</p>
        </div>
    );
};

export default EmptyState;
