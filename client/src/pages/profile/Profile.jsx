import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getProfileStatsApi } from '../../services/progress.api';
import { getContestHistoryApi } from '../../services/contest.api';
import Card from '../../components/ui/Card';
import LevelBadge from '../../components/ui/LevelBadge';
import CoinCounter from '../../components/ui/CoinCounter';
import RankBadge from '../../components/ui/RankBadge';
import XpProgressBar from '../../components/ui/XpProgressBar';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { GiEgyptianWalk, GiAchievement, GiScrollUnfurled, GiFire, GiTrophy, GiCompass } from 'react-icons/gi';
import { FaClock, FaTrophy, FaCalendarCheck } from 'react-icons/fa';
import { motion } from 'framer-motion';

const Profile = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [contestHistory, setContestHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [statsRes, historyRes] = await Promise.all([
                    getProfileStatsApi(),
                    getContestHistoryApi()
                ]);
                if (statsRes.success && statsRes.data) {
                    setStats(statsRes.data);
                }
                if (historyRes.success && historyRes.data) {
                    setContestHistory(historyRes.data);
                }
            } catch (err) {
                console.error('Failed to load profile stats:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const baseAchievements = [
        { id: 1, title: 'First Blood', description: 'Solved your first DSA trial in the Abyss.', badgeIcon: GiAchievement, rarity: 'Common' },
        { id: 2, title: 'Apprentice', description: 'Solved 10 DSA trials.', badgeIcon: GiAchievement, rarity: 'Common' },
        { id: 3, title: 'Adept', description: 'Solved 25 DSA trials.', badgeIcon: GiAchievement, rarity: 'Rare' },
        { id: 4, title: 'Master', description: 'Solved 50 DSA trials.', badgeIcon: GiAchievement, rarity: 'Epic' },
        { id: 5, title: 'World Conqueror', description: 'Fully conquered your first world realm.', badgeIcon: GiCompass, rarity: 'Epic' },
        { id: 6, title: '7-Day Streak', description: 'Maintained a consecutive solve streak of 7 days.', badgeIcon: GiFire, rarity: 'Rare' },
        { id: 7, title: '30-Day Streak', description: 'Maintained a consecutive solve streak of 30 days.', badgeIcon: GiTrophy, rarity: 'Legendary' }
    ];

    const displayAchievements = baseAchievements.map(ach => {
        const isUnlocked = stats?.achievements?.some(title => title.toLowerCase() === ach.title.toLowerCase());
        return {
            ...ach,
            unlockedAt: isUnlocked ? 'Unlocked' : null
        };
    });

    const rarityStyles = {
        Common: 'border-abyss-border/40 text-abyss-muted',
        Rare: 'border-cyan-500/30 text-cyan-400',
        Epic: 'border-purple-500/30 text-purple-400 shadow-glow-primary',
        Legendary: 'border-abyss-gold/40 text-abyss-gold shadow-glow-gold'
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 80, damping: 15 }}
            className="space-y-8"
        >
            {/* Header branding */}
            <div>
                <h1 className="font-fantasy text-3xl font-bold text-white tracking-widest uppercase">
                    Character Profile
                </h1>
                <p className="font-sans text-xs text-abyss-muted">
                    Inspect unlocked badges, stats, and chronological standings.
                </p>
            </div>

            {/* Profile Detail Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Status card details */}
                <Card className="flex flex-col items-center text-center space-y-4 lg:col-span-1">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-abyss-primary to-purple-500 flex items-center justify-center border-2 border-abyss-gold/30 shadow-glow-primary">
                        <GiEgyptianWalk className="text-white text-5xl animate-pulse" />
                    </div>
                    <div>
                        <h2 className="font-fantasy text-2xl font-bold text-white uppercase tracking-wider">
                            {stats?.username || user?.username || 'Unknown Knight'}
                        </h2>
                        <span className="text-xs text-purple-400 font-mono tracking-widest uppercase block mt-1">
                            {stats?.currentTitle || 'Void Walker'}
                        </span>
                    </div>
                    
                    <div className="flex justify-center w-full pt-1">
                        <RankBadge rank={stats?.rank || 'Novice'} />
                    </div>
                    
                    <div className="flex justify-around items-center w-full pt-4 border-t border-abyss-border/30">
                        <div className="text-center">
                            <span className="text-xs text-abyss-muted uppercase tracking-wider block">Treasury</span>
                            <CoinCounter coins={stats?.coins || 0} className="text-lg justify-center mt-1" />
                        </div>
                        <div className="text-center">
                            <span className="text-xs text-abyss-muted uppercase tracking-wider block">Crest</span>
                            <div className="flex justify-center mt-1 scale-75 origin-center">
                                <LevelBadge level={stats?.level || 1} size="sm" />
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Level parameters summary */}
                <Card className="lg:col-span-2 flex flex-col justify-between p-6">
                    <div className="space-y-4">
                        <h3 className="font-fantasy text-lg text-abyss-gold uppercase tracking-wider">
                            Tier Metrics
                        </h3>
                        <p className="font-sans text-sm text-abyss-muted leading-relaxed">
                            Accumulate experience from battles to advance levels. Each level increases your access to advanced dungeon coordinates.
                        </p>
                        <div className="pt-2">
                            <XpProgressBar current={stats?.xp || 0} max={Math.round(100 * Math.pow(stats?.level || 1, 1.5))} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-abyss-border/20 text-xs font-sans text-center">
                        <div className="bg-black/35 p-3 rounded-lg border border-abyss-border/40">
                            <span className="text-abyss-muted block uppercase text-[9px] tracking-wider">Total Solved</span>
                            <span className="text-white font-bold text-base mt-1 block">{stats?.totalSolved || 0}</span>
                        </div>
                        <div className="bg-black/35 p-3 rounded-lg border border-abyss-border/40">
                            <span className="text-abyss-muted block uppercase text-[9px] tracking-wider">Active Streak</span>
                            <span className="text-purple-400 font-bold text-base mt-1 block flex items-center justify-center space-x-1">
                                <GiFire />
                                <span>{stats?.currentStreak || 0} Days</span>
                            </span>
                        </div>
                        <div className="bg-black/35 p-3 rounded-lg border border-abyss-border/40">
                            <span className="text-abyss-muted block uppercase text-[9px] tracking-wider">Longest Streak</span>
                            <span className="text-abyss-gold font-bold text-base mt-1 block">{stats?.longestStreak || 0} Days</span>
                        </div>
                        <div className="bg-black/35 p-3 rounded-lg border border-abyss-border/40">
                            <span className="text-abyss-muted block uppercase text-[9px] tracking-wider">Achievements</span>
                            <span className="text-green-400 font-bold text-base mt-1 block">{stats?.achievements?.length || 0}</span>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Achievements row */}
            <div className="space-y-4">
                <h3 className="font-fantasy text-xl font-bold text-white tracking-widest uppercase">
                    Unlocked Achievements
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {displayAchievements.map((ach) => {
                        const isUnlocked = ach.unlockedAt !== null;
                        const RarityIcon = ach.badgeIcon;
                        return (
                            <Card 
                                key={ach.id} 
                                className={`relative border ${isUnlocked ? rarityStyles[ach.rarity] : 'border-abyss-border/20 bg-abyss-card/20'}`}
                            >
                                <div className="flex items-start space-x-3.5">
                                    <div className={`p-2.5 rounded-lg border bg-black/40 ${isUnlocked ? 'border-current' : 'border-abyss-border/20 text-abyss-muted/40'}`}>
                                        <RarityIcon className="text-xl" />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center space-x-2">
                                            <h4 className={`font-fantasy text-base font-bold uppercase tracking-wide ${isUnlocked ? 'text-white' : 'text-abyss-muted/50'}`}>
                                                {ach.title}
                                            </h4>
                                            {isUnlocked && (
                                                <span className="text-[8px] border border-current px-1.5 py-0.5 rounded tracking-widest uppercase font-fantasy">
                                                    {ach.rarity}
                                                </span>
                                            )}
                                        </div>
                                        <p className={`font-sans text-xs ${isUnlocked ? 'text-abyss-muted' : 'text-abyss-muted/30'}`}>
                                            {ach.description}
                                        </p>
                                        {isUnlocked ? (
                                            <span className="text-[9px] font-mono text-purple-400 block pt-1">Unlocked: {ach.unlockedAt}</span>
                                        ) : (
                                            <span className="text-[9px] font-mono text-abyss-muted/30 block pt-1">Locked</span>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            </div>

            {/* Contest History */}
            <div className="space-y-4">
                <h3 className="font-fantasy text-xl font-bold text-white tracking-widest uppercase">
                    Contest Chronicles
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-sans text-center">
                    <div className="bg-black/35 p-3 rounded-lg border border-abyss-border/40">
                        <span className="text-abyss-muted block uppercase text-[9px] tracking-wider">Contest Rating</span>
                        <span className="text-yellow-400 font-bold text-base mt-1 block font-fantasy">{user.contestRating || 1200}</span>
                    </div>
                    <div className="bg-black/35 p-3 rounded-lg border border-abyss-border/40">
                        <span className="text-abyss-muted block uppercase text-[9px] tracking-wider">Highest Rating</span>
                        <span className="text-abyss-gold font-bold text-base mt-1 block font-fantasy">{user.highestRating || 1200}</span>
                    </div>
                    <div className="bg-black/35 p-3 rounded-lg border border-abyss-border/40">
                        <span className="text-abyss-muted block uppercase text-[9px] tracking-wider">Played</span>
                        <span className="text-cyan-400 font-bold text-base mt-1 block font-mono">{user.contestsPlayed || 0}</span>
                    </div>
                    <div className="bg-black/35 p-3 rounded-lg border border-abyss-border/40">
                        <span className="text-abyss-muted block uppercase text-[9px] tracking-wider">Best Standing</span>
                        <span className="text-purple-400 font-bold text-base mt-1 block font-mono">#{user.bestRank || 'N/A'}</span>
                    </div>
                </div>

                {contestHistory.length > 0 ? (
                    <Card className="p-4 border-abyss-border/30 bg-black/40">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs font-sans">
                                <thead>
                                    <tr className="border-b border-abyss-border/20 text-abyss-gold font-fantasy uppercase tracking-wider font-bold">
                                        <th className="pb-2">Contest</th>
                                        <th className="pb-2">Type</th>
                                        <th className="pb-2 text-center">Rank</th>
                                        <th className="pb-2 text-center">Rating Progress</th>
                                        <th className="pb-2 text-right">Change</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-abyss-border/10 text-abyss-muted font-mono">
                                    {contestHistory.map((h) => (
                                        <tr key={h._id} className="hover:bg-white/2">
                                            <td className="py-2.5 text-white font-medium font-sans">{h.contest?.title}</td>
                                            <td className="py-2.5 font-fantasy uppercase text-[9px]">{h.contest?.type}</td>
                                            <td className="py-2.5 text-center text-white">#{h.rank}</td>
                                            <td className="py-2.5 text-center">{h.oldRating} → {h.newRating}</td>
                                            <td className={`py-2.5 text-right font-bold ${h.ratingChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                {h.ratingChange >= 0 ? `+${h.ratingChange}` : h.ratingChange}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                ) : (
                    <Card className="flex flex-col items-center justify-center py-8 text-center bg-black/10 border-dashed border-abyss-border/30">
                        <p className="font-fantasy text-xs text-abyss-gold uppercase tracking-wider">No Contest Chronicles Unfolded</p>
                        <span className="text-[10px] text-abyss-muted">Participate in rated championships to log rating history metrics.</span>
                    </Card>
                )}
            </div>

            {/* Solved Problems */}
            <div className="space-y-4">
                <h3 className="font-fantasy text-xl font-bold text-white tracking-widest uppercase">
                    Solved Dungeons History
                </h3>
                {stats?.completedProblems && stats.completedProblems.length > 0 ? (
                    <Card className="p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {stats.completedProblems.map((probId, idx) => (
                                <div key={probId} className="bg-black/35 border border-abyss-border/40 p-3 rounded-lg flex items-center justify-between">
                                    <span className="text-xs font-fantasy uppercase text-white truncate max-w-[150px]">
                                        Dungeon Trial #{idx + 1}
                                    </span>
                                    <span className="text-[9px] font-mono text-purple-400">ID: {probId.slice(-6)}</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                ) : (
                    <Card className="flex flex-col items-center justify-center py-12 text-center">
                        <GiScrollUnfurled className="text-abyss-muted text-4xl mb-3" />
                        <p className="font-fantasy text-xs text-abyss-gold uppercase tracking-wider">No completed trials logged.</p>
                    </Card>
                )}
            </div>
        </motion.div>
    );
};

export default Profile;
