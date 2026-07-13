import React from 'react';
import Card from '../ui/Card';
import LevelBadge from '../ui/LevelBadge';

const LevelCard = ({ level = 1 }) => {
    return (
        <Card className="flex items-center justify-between">
            <div className="space-y-1">
                <p className="text-abyss-muted text-xs uppercase tracking-widest">Level Status</p>
                <h3 className="font-fantasy text-xl font-bold text-abyss-gold tracking-wider">
                    Ascendant Tier
                </h3>
            </div>
            <LevelBadge level={level} size="sm" />
        </Card>
    );
};

export default LevelCard;
