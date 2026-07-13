import React from 'react';
import Card from '../ui/Card';
import CoinCounter from '../ui/CoinCounter';

const CoinsCard = ({ coins = 0 }) => {
    return (
        <Card className="flex items-center justify-between">
            <div className="space-y-1">
                <p className="text-abyss-muted text-xs uppercase tracking-widest">Valthor Treasury</p>
                <p className="text-xs text-abyss-muted">Redeem items in the scroll shop</p>
            </div>
            <CoinCounter coins={coins} className="text-2xl" />
        </Card>
    );
};

export default CoinsCard;
