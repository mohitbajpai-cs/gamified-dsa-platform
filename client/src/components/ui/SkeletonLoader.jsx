import React from 'react';

const SkeletonLoader = ({ type = 'card', count = 1 }) => {
    const renders = Array.from({ length: count });

    const renderSkeleton = () => {
        if (type === 'list') {
            return (
                <div className="space-y-3 animate-pulse">
                    <div className="h-8 bg-abyss-border rounded w-full"></div>
                    <div className="h-8 bg-abyss-border rounded w-full"></div>
                    <div className="h-8 bg-abyss-border rounded w-full"></div>
                </div>
            );
        }

        return (
            <div className="bg-abyss-card border border-abyss-border rounded-xl p-6 space-y-4 animate-pulse">
                <div className="h-6 bg-abyss-border rounded w-1/3"></div>
                <div className="h-4 bg-abyss-border rounded w-full"></div>
                <div className="h-4 bg-abyss-border rounded w-5/6"></div>
            </div>
        );
    };

    return (
        <div className="grid gap-6">
            {renders.map((_, i) => (
                <React.Fragment key={i}>
                    {renderSkeleton()}
                </React.Fragment>
            ))}
        </div>
    );
};

export default SkeletonLoader;
