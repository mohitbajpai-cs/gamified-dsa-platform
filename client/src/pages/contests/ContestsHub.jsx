import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Card from '../../components/ui/Card';
import PrimaryButton from '../../components/ui/PrimaryButton';
import SecondaryButton from '../../components/ui/SecondaryButton';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import { getContestsApi, registerContestApi } from '../../services/contest.api';
import { motion } from 'framer-motion';
import { GiTrophy, GiUpgrade, GiCoins, GiShield } from 'react-icons/gi';
import { FaClock, FaUsers, FaLock, FaCalendarCheck } from 'react-icons/fa';

const ContestsHub = () => {
    const navigate = useNavigate();
    const [contests, setContests] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadContests = async () => {
        setLoading(true);
        try {
            const res = await getContestsApi();
            if (res.success && res.data) {
                setContests(res.data);
            }
        } catch (err) {
            console.error('Failed to load contests:', err);
            toast.error('Failed to sync contest calendars');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadContests();
    }, []);

    const handleRegister = async (contestId) => {
        try {
            const res = await registerContestApi(contestId);
            if (res.success) {
                toast.success('Lobby coordinates registered! Prepare for trials.');
                loadContests();
            }
        } catch (err) {
            toast.error(err.message || 'Registration failed');
        }
    };

    const getDifficultyBadge = (diff) => {
        const colors = {
            Easy: 'text-green-400 border-green-500/20 bg-green-500/5',
            Medium: 'text-blue-400 border-blue-500/20 bg-blue-500/5',
            Hard: 'text-purple-400 border-purple-500/20 bg-purple-500/5',
            Mixed: 'text-yellow-400 border-yellow-500/20 bg-yellow-500/5'
        };
        return colors[diff] || colors.Mixed;
    };

    // Filter statuses
    const live = contests.filter(c => c.status === 'live');
    const upcoming = contests.filter(c => c.status === 'upcoming');
    const completed = contests.filter(c => c.status === 'completed');

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
        >
            {/* Header */}
            <div>
                <h1 className="font-fantasy text-3xl font-bold text-white tracking-widest uppercase">Algorithmic Arenas</h1>
                <p className="font-sans text-xs text-abyss-muted">Conquer timed championships, accumulate rating points, and earn trophies.</p>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <LoadingSpinner size="lg" />
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Live & Upcoming Contests */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Live Arenas */}
                        <div className="space-y-4">
                            <h3 className="font-fantasy text-lg font-bold text-red-400 tracking-wider uppercase flex items-center space-x-2">
                                <GiShield className="animate-pulse" />
                                <span>Live Championships</span>
                            </h3>
                            {live.length === 0 ? (
                                <p className="text-xs text-abyss-muted italic">No live contest gates are open at this interval.</p>
                            ) : (
                                <div className="grid grid-cols-1 gap-4">
                                    {live.map(c => (
                                        <Card key={c._id} className="border-red-500/35 bg-gradient-to-r from-red-950/20 via-black to-black p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
                                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.02),transparent)] pointer-events-none"></div>
                                            <div className="space-y-2 z-10">
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-[8px] uppercase tracking-widest text-red-500 font-bold border border-red-500/30 px-1.5 py-0.5 rounded bg-red-500/10 font-fantasy">LIVE</span>
                                                    <span className={`text-[9px] uppercase tracking-widest font-fantasy border px-2 py-0.5 rounded ${getDifficultyBadge(c.difficulty)}`}>{c.difficulty}</span>
                                                </div>
                                                <h4 className="font-fantasy text-base font-bold text-white uppercase tracking-wider">{c.title}</h4>
                                                <p className="text-xs text-abyss-muted leading-relaxed">{c.description}</p>
                                                <div className="flex items-center space-x-4 text-[10px] text-abyss-muted font-mono">
                                                    <span className="flex items-center space-x-1"><FaClock /> <span>{c.duration} Mins</span></span>
                                                    <span className="flex items-center space-x-1"><FaUsers /> <span>{c.problems?.length || 0} Trials</span></span>
                                                </div>
                                            </div>
                                            <div className="z-10 w-full md:w-auto">
                                                <PrimaryButton onClick={() => navigate(`/contests/${c._id}`)} className="w-full text-center px-6 bg-gradient-to-r from-red-600 to-red-800 border-red-500/40">
                                                    Enter Arena
                                                </PrimaryButton>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Upcoming Arenas */}
                        <div className="space-y-4">
                            <h3 className="font-fantasy text-lg font-bold text-white tracking-wider uppercase">Upcoming Chronicles</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {upcoming.map(c => (
                                    <Card key={c._id} className="p-5 border-abyss-border/40 hover:border-abyss-gold/20 transition-all flex flex-col justify-between h-48">
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className={`text-[9px] uppercase tracking-widest font-fantasy border px-2 py-0.5 rounded ${getDifficultyBadge(c.difficulty)}`}>{c.difficulty}</span>
                                                <span className="text-[10px] font-mono text-abyss-muted">{new Date(c.startTime).toLocaleDateString()}</span>
                                            </div>
                                            <h4 className="font-fantasy text-sm font-bold text-white uppercase tracking-wider line-clamp-1">{c.title}</h4>
                                            <p className="text-xs text-abyss-muted line-clamp-2 leading-relaxed">{c.description}</p>
                                        </div>
                                        <div className="pt-4 border-t border-abyss-border/10 flex justify-between items-center">
                                            <span className="text-[10px] font-mono text-abyss-gold tracking-wider">+{c.rewards?.xp || 500} XP / +{c.rewards?.coins || 100} G</span>
                                            <PrimaryButton onClick={() => handleRegister(c._id)} className="py-1 px-4 text-[10px]">
                                                Register
                                            </PrimaryButton>
                                        </div>
                                    </Card>
                                ))}
                                {upcoming.length === 0 && (
                                    <p className="text-xs text-abyss-muted italic">No upcoming championships mapped inside calendar logs.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right side: Calendar & Completed */}
                    <div className="space-y-6">
                        {/* Interactive simple Calendar widget */}
                        <Card className="p-5 border-abyss-border/30 space-y-4 bg-black/40">
                            <h3 className="font-fantasy text-sm font-bold text-abyss-gold tracking-widest uppercase flex items-center space-x-2">
                                <FaCalendarCheck />
                                <span>Championship Calendar</span>
                            </h3>
                            
                            <div className="grid grid-cols-7 gap-1 text-center font-mono text-[9px] text-abyss-muted border-b border-abyss-border/10 pb-2">
                                <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
                            </div>
                            <div className="grid grid-cols-7 gap-1 text-center font-mono text-xs text-white">
                                {Array.from({ length: 31 }, (_, i) => {
                                    const day = i + 1;
                                    const hasContest = day === 15 || day === 22 || day === 28;
                                    return (
                                        <span 
                                            key={day} 
                                            className={`py-1 rounded cursor-pointer ${hasContest ? 'bg-abyss-gold/20 border border-abyss-gold text-abyss-gold shadow-glow-gold/10' : 'hover:bg-white/5'}`}
                                        >
                                            {day}
                                        </span>
                                    );
                                })}
                            </div>
                        </Card>

                        {/* Completed Contests */}
                        <div className="space-y-4">
                            <h3 className="font-fantasy text-lg font-bold text-abyss-muted tracking-wider uppercase">Archived Chronicles</h3>
                            <div className="space-y-3">
                                {completed.map(c => (
                                    <Card key={c._id} className="p-4 border-abyss-border/20 bg-black/60 flex justify-between items-center text-xs">
                                        <div className="space-y-1">
                                            <h5 className="font-fantasy font-bold text-white uppercase tracking-wider">{c.title}</h5>
                                            <span className="text-[10px] font-mono text-abyss-muted">Concluded {new Date(c.endTime).toLocaleDateString()}</span>
                                        </div>
                                        <Link to={`/contests/${c._id}`} className="font-fantasy text-[10px] text-abyss-gold uppercase hover:underline">Leaderboard</Link>
                                    </Card>
                                ))}
                                {completed.length === 0 && (
                                    <p className="text-xs text-abyss-muted italic">No archived contest logs resolved.</p>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            )}
        </motion.div>
    );
};

export default ContestsHub;
