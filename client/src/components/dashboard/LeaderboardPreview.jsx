import React from 'react';
import Card from '../ui/Card';
import LevelBadge from '../ui/LevelBadge';
import RankBadge from '../ui/RankBadge';
import { GiCrownedSkull, GiTrophy, GiEgyptianWalk } from 'react-icons/gi';

const LeaderboardPreview = ({ currentUser }) => {
    // Standard mock list of top fantasy players
    const mockPlayers = [
        { username: 'AbyssOverlord', level: 12, rank: 'Overlord', xp: 5400, avatar: 'avatar_1' },
        { username: 'VoidKnight', level: 9, rank: 'Warrior', xp: 3200, avatar: 'avatar_2' },
        { username: 'SorcererSupreme', level: 8, rank: 'Warrior', xp: 2900, avatar: 'avatar_3' },
        { username: 'Algorithmic Lich', level: 6, rank: 'Apprentice', xp: 1800, avatar: 'avatar_4' },
        { username: 'StackSentinel', level: 5, rank: 'Apprentice', xp: 1400, avatar: 'avatar_5' }
    ];

    // Check if current user is already in top 5. If not, append them at the bottom.
    const isCurrentUserInTop = mockPlayers.some(p => p.username.toLowerCase() === currentUser?.username?.toLowerCase());
    
    const displayPlayers = [...mockPlayers];
    if (!isCurrentUserInTop && currentUser) {
        displayPlayers.push({
            username: currentUser.username,
            level: currentUser.level || 1,
            rank: currentUser.rank || 'Novice',
            xp: currentUser.xp || 0,
            isSelf: true
        });
    }

    return (
        <Card className="flex flex-col justify-between border-abyss-border">
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h4 className="font-fantasy text-xs text-abyss-gold tracking-widest uppercase">Leaderboard Standing</h4>
                    <GiTrophy className="text-abyss-gold text-lg" />
                </div>

                <div className="space-y-2.5">
                    {displayPlayers.slice(0, 5).map((player, index) => {
                        const isSelf = player.isSelf || (currentUser && player.username.toLowerCase() === currentUser.username.toLowerCase());
                        const isTopThree = index < 3;

                        return (
                            <div 
                                key={player.username}
                                className={`
                                    flex items-center justify-between p-2.5 rounded-lg border transition-all duration-200
                                    ${isSelf 
                                        ? 'bg-abyss-primary/20 border-abyss-gold/40 shadow-glow-primary' 
                                        : 'bg-black/20 border-abyss-border/40 hover:border-abyss-border'
                                    }
                                `}
                            >
                                <div className="flex items-center space-x-3">
                                    {/* Rank Medal Index */}
                                    <span className={`font-fantasy text-xs font-bold w-4 text-center ${isTopThree ? 'text-abyss-gold' : 'text-abyss-muted'}`}>
                                        {index + 1}
                                    </span>

                                    {/* Avatar Shield */}
                                    <div className="w-8 h-8 rounded bg-gradient-to-tr from-abyss-card to-black border border-abyss-border flex items-center justify-center">
                                        {index === 0 ? (
                                            <GiCrownedSkull className="text-abyss-gold text-lg" />
                                        ) : (
                                            <GiEgyptianWalk className="text-white text-sm" />
                                        )}
                                    </div>

                                    {/* Profile Name & Fantasy Rank */}
                                    <div className="text-left">
                                        <p className={`text-xs font-fantasy uppercase tracking-wider ${isSelf ? 'text-abyss-gold font-bold' : 'text-white'}`}>
                                            {player.username}
                                        </p>
                                        <span className="text-[9px] text-abyss-muted font-mono uppercase">
                                            {player.rank} Class
                                        </span>
                                    </div>
                                </div>

                                <div className="text-right flex items-center space-x-2">
                                    <span className="text-[10px] font-mono text-purple-400">+{player.xp} XP</span>
                                    <span className="text-[10px] font-fantasy font-bold text-abyss-gold border border-abyss-gold/20 px-1.5 py-0.5 rounded bg-abyss-gold/5">
                                        LVL {player.level}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </Card>
    );
};

export default LeaderboardPreview;
