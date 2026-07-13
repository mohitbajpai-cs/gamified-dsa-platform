import React from 'react';
import { GiCoins } from 'react-icons/gi';

const CoinCounter = ({ coins, className = '' }) => {
    return (
        <div className={`flex items-center space-x-1.5 text-abyss-gold ${className}`}>
            <GiCoins className="text-xl filter drop-shadow-[0_0_5px_rgba(212,175,55,0.5)]" />
            <span className="font-mono font-bold">{coins}</span>
        </div>
    );
};

export default CoinCounter;
