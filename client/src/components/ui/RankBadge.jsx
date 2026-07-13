import React from 'react';
import { GiAngelWings, GiSpikedShield, GiFencer, GiBroadsword } from 'react-icons/gi';

const RankBadge = ({ rank = 'Novice' }) => {
    const getRankDetails = (title) => {
        const details = {
            Novice: { icon: GiFencer, color: 'text-abyss-muted border-abyss-border/60 bg-abyss-bg/60' },
            Apprentice: { icon: GiSpikedShield, color: 'text-purple-400 border-purple-500/30 bg-purple-950/20' },
            Warrior: { icon: GiBroadsword, color: 'text-cyan-400 border-cyan-500/30 bg-cyan-950/20' },
            Overlord: { icon: GiAngelWings, color: 'text-abyss-gold border-abyss-gold/40 bg-abyss-gold/10' }
        };
        return details[title] || details.Novice;
    };

    const { icon: Icon, color } = getRankDetails(rank);

    return (
        <div className={`
            flex items-center space-x-1.5 px-3 py-1 rounded border text-xs font-fantasy tracking-wider uppercase
            ${color}
        `}>
            <Icon className="text-sm" />
            <span>{rank}</span>
        </div>
    );
};

export default RankBadge;
