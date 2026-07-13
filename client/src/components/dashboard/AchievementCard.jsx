import React, { useState, useEffect } from 'react';
import { getAchievementsApi } from '../../services/quest.api';
import Card from '../ui/Card';
import { GiGothicCross, GiLockSpy } from 'react-icons/gi';

const AchievementCard = () => {
    const [achievements, setAchievements] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAchievements = async () => {
            try {
                const res = await getAchievementsApi();
                if (res.success && res.data) {
                    setAchievements(res.data);
                }
            } catch (err) {
                console.error('Failed to load achievements:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchAchievements();
    }, []);

    // Get latest unlocked achievement
    const unlockedList = achievements.filter(a => a.unlocked);
    const latestAch = unlockedList.length > 0 ? unlockedList[unlockedList.length - 1] : null;

    // Get next locked achievement as preview
    const nextAch = achievements.find(a => !a.unlocked);

    const rarityColors = {
        common: 'text-abyss-muted border-abyss-border/40',
        rare: 'text-cyan-400 border-cyan-500/30',
        epic: 'text-purple-400 border-purple-500/30 shadow-glow-primary',
        legendary: 'text-abyss-gold border-abyss-gold/40 shadow-glow-gold'
    };

    if (loading) {
        return (
            <Card className="bg-black/60 border border-abyss-border/40 p-6 rounded-2xl animate-pulse">
                <div className="h-4 bg-abyss-border/30 rounded w-1/3 mb-4"></div>
                <div className="space-y-2">
                    <div className="h-3 bg-abyss-border/20 rounded w-full"></div>
                    <div className="h-3 bg-abyss-border/20 rounded w-5/6"></div>
                </div>
            </Card>
        );
    }

    return (
        <Card className="relative overflow-hidden border-abyss-border bg-black/60 backdrop-blur-md p-6 h-full flex flex-col justify-between space-y-6">
            {/* 1. Recent Achievement */}
            <div className="space-y-3">
                <h4 className="font-fantasy text-xs text-abyss-gold tracking-widest uppercase pb-2 border-b border-abyss-border/20">
                    Recent Achievement
                </h4>
                
                {latestAch ? (
                    <div className="flex items-start space-x-3.5 group">
                        <div className={`p-2.5 rounded-lg border bg-black/40 ${rarityColors[latestAch.rarity.toLowerCase()] || rarityColors.common}`}>
                            <GiGothicCross className="text-xl" />
                        </div>
                        
                        <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                                <h3 className="font-fantasy text-sm font-bold text-white uppercase tracking-wide group-hover:text-abyss-gold transition-colors">
                                    {latestAch.title}
                                </h3>
                                <span className="text-[8px] uppercase font-fantasy border border-abyss-border px-1.5 py-0.5 rounded tracking-widest text-abyss-muted">
                                    {latestAch.rarity}
                                </span>
                            </div>
                            <p className="font-sans text-[11px] text-abyss-muted leading-relaxed">
                                {latestAch.description}
                            </p>
                        </div>
                    </div>
                ) : (
                    <p className="font-sans text-xs text-abyss-muted italic">No milestones unlocked yet. Solve challenges to claim achievements!</p>
                )}
            </div>

            {/* 2. Next Unlock Preview */}
            {nextAch && (
                <div className="pt-4 border-t border-abyss-border/20 space-y-3">
                    <h4 className="font-fantasy text-xs text-purple-400 tracking-widest uppercase">
                        Next Milestone Preview
                    </h4>
                    
                    <div className="flex items-start space-x-3.5 opacity-60">
                        <div className="p-2.5 rounded-lg border border-abyss-border/30 bg-black/50 text-abyss-muted/40">
                            <GiLockSpy className="text-xl animate-pulse" />
                        </div>
                        
                        <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                                <h3 className="font-fantasy text-xs font-bold text-white uppercase tracking-wide">
                                    {nextAch.title}
                                </h3>
                                <span className="text-[8px] uppercase font-fantasy border border-abyss-border/30 px-1.5 py-0.5 rounded tracking-widest text-abyss-muted">
                                    {nextAch.rarity}
                                </span>
                            </div>
                            <p className="font-sans text-[10px] text-abyss-muted leading-tight">
                                {nextAch.description}
                            </p>
                            <div className="flex space-x-3 font-mono text-[9px] pt-1">
                                <span className="text-purple-400">Reward: +{nextAch.xpReward} XP</span>
                                <span className="text-abyss-gold">+{nextAch.coinReward} Coins</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Card>
    );
};

export default AchievementCard;
