import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getLeaderboardApi } from '../../services/progress.api';
import Card from '../../components/ui/Card';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import LevelBadge from '../../components/ui/LevelBadge';
import { GiTrophy, GiFire, GiUpgrade, GiCoins, GiRibbon } from 'react-icons/gi';
import { motion } from 'framer-motion';

const Leaderboard = () => {
    const { user } = useAuth();
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const res = await getLeaderboardApi();
                if (res.success && res.data) {
                    setLeaderboard(res.data);
                }
            } catch (err) {
                console.error('Failed to load leaderboard data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, []);

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
                    Hall of Legends
                </h1>
                <p className="font-sans text-xs text-abyss-muted">
                    Compare your algorithms spellcraft status against other Knights traversing the Protocol.
                </p>
            </div>

            {/* Leaderboard Board */}
            <Card className="p-0 border-abyss-border/40 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse font-sans text-xs">
                        <thead>
                            <tr className="border-b border-abyss-border/40 bg-black/40 text-[9px] uppercase tracking-wider text-abyss-muted select-none">
                                <th className="py-4 px-6 text-center w-16">Rank</th>
                                <th className="py-4 px-6">Knight</th>
                                <th className="py-4 px-6 text-center">Level</th>
                                <th className="py-4 px-6 text-center">XP</th>
                                <th className="py-4 px-6 text-center">Gold</th>
                                <th className="py-4 px-6 text-center">Solved</th>
                                <th className="py-4 px-6 text-center">Streak</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-abyss-border/20">
                            {leaderboard.map((player) => {
                                const isActiveUser = String(player.username).toLowerCase() === String(user?.username).toLowerCase();
                                
                                return (
                                    <tr 
                                        key={player.username}
                                        className={`transition-colors hover:bg-abyss-hover/10
                                            ${isActiveUser ? 'bg-abyss-primary/10 border-l-2 border-l-abyss-gold' : ''}
                                        `}
                                    >
                                        {/* Rank Column */}
                                        <td className="py-4 px-6 text-center font-fantasy font-bold">
                                            {player.rank === 1 ? (
                                                <GiTrophy className="text-abyss-gold text-lg mx-auto filter drop-shadow-[0_0_4px_rgba(212,175,55,0.4)]" />
                                            ) : player.rank === 2 ? (
                                                <GiRibbon className="text-gray-400 text-lg mx-auto" />
                                            ) : player.rank === 3 ? (
                                                <GiRibbon className="text-amber-600 text-lg mx-auto" />
                                            ) : (
                                                <span className="text-abyss-muted">{player.rank}</span>
                                            )}
                                        </td>

                                        {/* Username/Title Column */}
                                        <td className="py-4 px-6">
                                            <div className="flex flex-col">
                                                <span className={`font-fantasy text-sm font-bold tracking-wide ${isActiveUser ? 'text-abyss-gold' : 'text-white'}`}>
                                                    {player.username}
                                                </span>
                                                <span className="text-[9px] text-abyss-muted uppercase font-mono mt-0.5">
                                                    {player.currentTitle || 'Beginner Knight'}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Level Column */}
                                        <td className="py-4 px-6 text-center">
                                            <div className="flex justify-center scale-75 origin-center">
                                                <LevelBadge level={player.level} size="sm" />
                                            </div>
                                        </td>

                                        {/* XP Column */}
                                        <td className="py-4 px-6 text-center font-mono font-bold text-purple-400">
                                            {player.xp}
                                        </td>

                                        {/* Coins Column */}
                                        <td className="py-4 px-6 text-center font-mono font-bold text-abyss-gold">
                                            {player.coins}
                                        </td>

                                        {/* Solved Problems Column */}
                                        <td className="py-4 px-6 text-center font-mono font-bold text-white">
                                            {player.totalSolved}
                                        </td>

                                        {/* Streak Column */}
                                        <td className="py-4 px-6 text-center">
                                            {player.currentStreak > 0 ? (
                                                <div className="flex items-center justify-center space-x-1 font-mono font-bold text-orange-400 text-xs">
                                                    <GiFire className="text-sm animate-pulse" />
                                                    <span>{player.currentStreak}</span>
                                                </div>
                                            ) : (
                                                <span className="text-abyss-muted/40 font-mono">-</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </Card>
        </motion.div>
    );
};

export default Leaderboard;
