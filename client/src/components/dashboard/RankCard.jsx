import React from 'react';
import Card from '../ui/Card';
import RankBadge from '../ui/RankBadge';

const RankCard = ({ rank = 'Novice' }) => {
    return (
        <Card className="flex items-center justify-between">
            <div className="space-y-1">
                <p className="text-abyss-muted text-xs uppercase tracking-widest">Protocol Standing</p>
                <h3 className="font-fantasy text-base font-bold text-white tracking-wider">
                    Abyss Class
                </h3>
            </div>
            <RankBadge rank={rank} />
        </Card>
    );
};

export default RankCard;
