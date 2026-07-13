import React from 'react';
import Card from '../ui/Card';
import RankBadge from '../ui/RankBadge';
import { GiEgyptianWalk } from 'react-icons/gi';

const CharacterCard = ({ user, currentWorldName }) => {
    const { username = 'Unknown Knight', email = 'knight@valthor.com', rank = 'Novice', currentTitle = 'Void Walker', createdAt } = user || {};

    const joinedDate = createdAt 
        ? new Date(createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
        : 'Genesis Cycle';

    return (
        <Card className="relative overflow-hidden bg-gradient-to-br from-abyss-card to-black border-abyss-gold/20 flex flex-col justify-between h-full">
            {/* Ambient background glow */}
            <div className="absolute -right-16 -top-16 w-36 h-36 bg-abyss-primary/10 rounded-full blur-2xl pointer-events-none"></div>
            
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-5 mb-4">
                {/* Avatar Shield */}
                <div className="w-20 h-20 rounded-xl bg-gradient-to-tr from-abyss-primary to-purple-500 border border-abyss-gold/30 flex items-center justify-center shadow-glow-primary flex-shrink-0 animate-pulse">
                    <GiEgyptianWalk className="text-white text-4xl" />
                </div>
                
                {/* Details */}
                <div className="text-center sm:text-left space-y-1.5 flex-1 min-w-0">
                    <div>
                        <h2 className="font-fantasy text-xl font-bold text-abyss-gold tracking-wider uppercase leading-none truncate">
                            {username}
                        </h2>
                        <span className="text-xs text-purple-400 font-mono tracking-wide">{currentTitle}</span>
                    </div>
                    <div className="flex justify-center sm:justify-start">
                        <RankBadge rank={rank} />
                    </div>
                </div>
            </div>

            {/* Metadatas */}
            <div className="border-t border-abyss-border/30 pt-3 space-y-1.5 text-xs font-sans">
                <div className="flex justify-between">
                    <span className="text-abyss-muted">Active Realm:</span>
                    <span className="text-white font-fantasy font-semibold uppercase">{currentWorldName || 'Arrays'}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-abyss-muted">Awakened Cycle:</span>
                    <span className="text-white font-mono">{joinedDate}</span>
                </div>
            </div>
        </Card>
    );
};

export default CharacterCard;
