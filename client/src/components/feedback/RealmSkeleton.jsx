import React from 'react';

const RealmSkeleton = () => {
    return (
        <div className="bg-abyss-card border border-abyss-border rounded-xl overflow-hidden animate-pulse">
            <div className="h-48 bg-abyss-border w-full"></div>
            <div className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                    <div className="h-6 bg-abyss-border rounded w-1/2"></div>
                    <div className="h-4 bg-abyss-border rounded w-1/4"></div>
                </div>
                <div className="space-y-2">
                    <div className="h-4 bg-abyss-border rounded w-full"></div>
                    <div className="h-3 bg-abyss-border rounded w-4/5"></div>
                </div>
                <div className="pt-2">
                    <div className="h-2 bg-abyss-border rounded-full w-full mb-1"></div>
                    <div className="h-3 bg-abyss-border rounded w-1/3"></div>
                </div>
                <div className="h-10 bg-abyss-border rounded w-full pt-4"></div>
            </div>
        </div>
    );
};

export default RealmSkeleton;
