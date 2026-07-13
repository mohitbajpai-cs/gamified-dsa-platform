import React from 'react';
import Card from '../ui/Card';
import { GiBrain, GiTrophy, GiCoins, GiUpgrade, GiGlobe, GiGothicCross, GiSwordsPower } from 'react-icons/gi';
import { FaSkull } from 'react-icons/fa';

const StatsCard = ({ stats }) => {
    const data = stats || {
        totalXp: 0,
        coins: 0,
        problemsSolved: 0,
        completedWorlds: 0,
        achievements: 0,
        currentStreak: 0,
        realmCompletionPct: 0,
        bossesDefeated: 0,
        currentBoss: 'None',
        latestTrophy: 'None'
    };

    const metrics = [
        { label: 'Total XP', value: `${data.totalXp} XP`, icon: GiUpgrade, color: 'text-purple-400 border-purple-500/20' },
        { label: 'Gold Coins', value: `${data.coins}`, icon: GiCoins, color: 'text-abyss-gold border-abyss-gold/20' },
        { label: 'Solved Tasks', value: `${data.problemsSolved}`, icon: GiBrain, color: 'text-cyan-400 border-cyan-500/20' },
        { label: 'Completed Worlds', value: `${data.completedWorlds}`, icon: GiGlobe, color: 'text-green-400 border-green-500/20' },
        { label: 'Active Streak', value: `${data.currentStreak} Days`, icon: GiTrophy, color: 'text-yellow-400 border-yellow-500/20' },
        { label: 'Realm Progress', value: `${data.realmCompletionPct ?? 0}%`, icon: GiGlobe, color: 'text-emerald-400 border-emerald-500/20' },
        { label: 'Bosses Slain', value: `${data.bossesDefeated ?? 0}`, icon: GiSwordsPower, color: 'text-red-400 border-red-500/20 shadow-glow-danger/5' },
        { label: 'Active Boss', value: `${data.currentBoss || 'None'}`, icon: FaSkull, color: 'text-rose-500 border-rose-500/20' },
        { label: 'Latest Trophy', value: `${data.latestTrophy || 'None'}`, icon: GiTrophy, color: 'text-yellow-500 border-yellow-500/20' }
    ];

    return (
        <Card className="flex flex-col justify-between h-full border-abyss-border">
            <h4 className="font-fantasy text-xs text-abyss-gold tracking-widest uppercase mb-4">Trial Statistics</h4>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 text-center flex-1">
                {metrics.map((m) => (
                    <div 
                        key={m.label}
                        className={`flex flex-col items-center justify-center p-3 rounded-lg bg-black/35 border ${m.color}`}
                    >
                        <m.icon className="text-xl mb-1.5" />
                        <span className="font-mono text-base font-bold text-white leading-none mb-1">
                            {m.value}
                        </span>
                        <span className="text-[9px] uppercase tracking-wider text-abyss-muted">
                            {m.label}
                        </span>
                    </div>
                ))}
            </div>
        </Card>
    );
};

export default StatsCard;
