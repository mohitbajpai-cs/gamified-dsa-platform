import React from 'react';

const CardSkeleton = () => {
    return (
        <div className="bg-abyss-card border border-abyss-border rounded-lg p-6 space-y-4 animate-pulse">
            <div className="h-6 bg-abyss-border rounded w-1/3"></div>
            <div className="space-y-2">
                <div className="h-4 bg-abyss-border rounded w-full"></div>
                <div className="h-4 bg-abyss-border rounded w-5/6"></div>
            </div>
            <div className="flex justify-between items-center pt-2">
                <div className="h-8 bg-abyss-border rounded w-1/4"></div>
                <div className="h-8 bg-abyss-border rounded w-1/4"></div>
            </div>
        </div>
    );
};

export default CardSkeleton;
