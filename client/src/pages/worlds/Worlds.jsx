import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getWorldsApi } from '../../services/world.api';
import { getProgressApi } from '../../services/progress.api';
import RealmCard from '../../components/worlds/RealmCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { FANTASY_REALMS } from '../../constants/realmsData';
import api from '../../services/api';
import { motion } from 'framer-motion';
import { GiCastle, GiTrophy, GiScrollUnfurled, GiAchievement, GiShield } from 'react-icons/gi';
import { FaChevronRight } from 'react-icons/fa';

const Worlds = () => {
    const navigate = useNavigate();
    const { user, progress, refreshProgress } = useAuth();
    const playerLevel = user?.level || 1;
    const [realms, setRealms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showSplash, setShowSplash] = useState(!sessionStorage.getItem('valthor_splash_shown'));

    useEffect(() => {
        if (showSplash) {
            const timer = setTimeout(() => {
                setShowSplash(false);
                sessionStorage.setItem('valthor_splash_shown', 'true');
            }, 1800);
            return () => clearTimeout(timer);
        }
    }, [showSplash]);

    useEffect(() => {
        const fetchRealmsData = async () => {
            try {
                const [worldsRes, progressRes] = await Promise.all([
                    getWorldsApi(),
                    getProgressApi()
                ]);

                if (worldsRes.success && worldsRes.data) {
                    const worldsList = worldsRes.data;
                    const progData = progressRes.success ? progressRes.data : null;

                    const mapped = worldsList.map((w, index) => {
                        const isFirst = index === 0;
                        const isUnlocked = progData?.unlockedWorlds?.some(
                            uw => String(uw._id) === String(w._id)
                        ) || isFirst;

                        const fantasyInfo = FANTASY_REALMS[index] || {};
                        
                        const isWorldCompleted = user?.completedWorlds?.includes(w._id.toString()) || 
                            (progData?.completedProblems && w.totalProblems > 0 && 
                             progData.completedProblems.filter(p => String(w._id) === String(p.world)).length >= w.totalProblems);

                        return {
                            ...w,
                            ...fantasyInfo,
                            isCompleted: isWorldCompleted,
                            isLocked: !isUnlocked,
                            bossUnlocked: progData ? (String(progData.currentWorld?._id) === String(w._id) && progData.bossUnlocked) : false,
                            completedProblems: progData?.completedProblems?.filter(
                                pId => {
                                    const pWorldId = pId.world?._id || pId.world || '';
                                    return String(pWorldId) === String(w._id);
                                }
                            ).length || 0
                        };
                    });

                    const allPrecedingCompleted = mapped.every(r => r.isCompleted || r.completedProblems >= r.totalProblems);
                    
                    const abyssThroneNode = {
                        _id: 'abyss-throne-node-id',
                        name: 'Abyss Throne',
                        difficulty: 'legendary',
                        completedProblems: allPrecedingCompleted ? 1 : 0,
                        totalProblems: 1,
                        isLocked: !allPrecedingCompleted,
                        isCompleted: false,
                        bossUnlocked: allPrecedingCompleted,
                        xpReward: 1000,
                        coinReward: 200,
                        unlockLevel: 5,
                        ...FANTASY_REALMS[9]
                    };

                    const finalRealmsList = [...mapped, abyssThroneNode];
                    setRealms(finalRealmsList);
                }
            } catch (err) {
                console.error("Error loading realms data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchRealmsData();
    }, [user, progress]);

    const handleEnterRealm = async (realm) => {
        if (!realm) return;
        if (realm._id === 'abyss-throne-node-id') {
            try {
                const dpWorld = realms[8];
                if (dpWorld) {
                    const topicsRes = await api.get(`/topics/world/${dpWorld._id}`);
                    if (topicsRes.data?.success && topicsRes.data?.data?.length > 0) {
                        const topicId = topicsRes.data.data[0]._id;
                        const problemsRes = await api.get(`/problems/${topicId}`);
                        if (problemsRes.data?.success && problemsRes.data?.data?.length > 0) {
                            const bossProb = problemsRes.data.data.find(p => p.bossLevel);
                            if (bossProb) {
                                navigate(`/arena/${bossProb._id}`);
                                return;
                            }
                        }
                    }
                }
            } catch (err) {
                console.error('Failed to locate final boss:', err);
            }
           navigate('/realms');
        } else {
         navigate(`/realms/${realm._id}`);
        }
    };

    if (showSplash) {
        return (
            <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#0B0F19]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.12),transparent_60%)] animate-pulse-slow"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(212,175,55,0.06),transparent_40%)]"></div>
                <div className="absolute w-[280px] h-[280px] border border-double border-abyss-gold/20 rounded-full animate-[spin_12s_linear_infinite] opacity-35"></div>
                
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="text-center space-y-4 relative z-10"
                >
                    <span className="font-fantasy text-[10px] uppercase tracking-[0.3em] text-abyss-gold bg-abyss-gold/5 border border-abyss-gold/20 px-3.5 py-1.5 rounded-full block w-fit mx-auto animate-pulse">
                        Awakening Cycle
                    </span>
                    <h1 className="font-fantasy text-6xl font-extrabold text-white tracking-[0.35em] uppercase filter drop-shadow-[0_0_15px_rgba(255,255,255,0.15)]">
                        Valthor
                    </h1>
                    <div className="h-[1px] w-36 bg-gradient-to-r from-transparent via-abyss-gold to-transparent mx-auto"></div>
                    <p className="font-fantasy text-[11px] text-abyss-muted tracking-[0.25em] uppercase">
                        Forge Your Legacy
                    </p>
                </motion.div>
            </div>
        );
    }

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
            className="pb-24 relative w-full px-6 lg:px-8 flex flex-col xl:flex-row gap-8 items-start justify-between z-10"
        >
            {/* Left/Center Column (74% width) */}
            <div className="w-full xl:w-[74%] space-y-10">
                
                {/* Top Cinematic Hero Section */}
                <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black/60 p-8 flex flex-col xl:flex-row justify-between items-center shadow-[0_8px_32px_rgba(0,0,0,0.7)] space-y-6 xl:space-y-0 min-h-[220px] w-full">
                    {/* Ambient lights & fog */}
                    <div className="absolute inset-0 bg-gradient-to-r from-abyss-primary/15 via-transparent to-abyss-gold/10 pointer-events-none z-0"></div>
                    <div className="absolute -inset-1/2 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.01),transparent_50%)] animate-pulse-slow pointer-events-none z-0"></div>
                    <div className="absolute inset-0 bg-black/50 z-0"></div>

                    {/* Left Column: Greeting, Name, Title, Quote */}
                    <div className="relative z-10 space-y-3 text-center xl:text-left max-w-sm">
                        <span className="font-fantasy text-[9px] uppercase tracking-[0.25em] text-abyss-gold font-bold bg-abyss-gold/10 border border-abyss-gold/20 px-3.5 py-1 rounded-full w-fit mx-auto xl:mx-0 block">
                            WELCOME BACK,
                        </span>
                        <div>
                            <h2 className="font-fantasy text-3xl font-extrabold text-white tracking-wider uppercase leading-none">
                                {user?.username || 'MOHIT'}
                            </h2>
                            <span className="text-[10px] font-sans font-bold text-abyss-gold uppercase tracking-widest block mt-1">
                                {user?.currentTitle || 'THE ASPIRING WARRIOR'}
                            </span>
                        </div>
                        <p className="font-sans text-[10px] text-abyss-muted leading-relaxed italic max-w-xs mx-auto xl:mx-0">
                            "In Valthor, only the persistent conquer the impossible."
                        </p>
                    </div>

                    {/* Center Column: Large Level Crest */}
                    <div className="relative z-10 flex flex-col items-center justify-center space-y-2 px-6 xl:border-x border-white/5">
                        <div className="relative w-24 h-24 flex flex-col items-center justify-center">
                            <svg className="absolute inset-0 w-full h-full text-abyss-gold filter drop-shadow-[0_0_12px_rgba(212,175,55,0.35)]" viewBox="0 0 100 100" fill="currentColor">
                                <path d="M50 5 L85 20 L85 55 C85 75 68 90 50 95 C32 90 15 75 15 55 L15 20 Z" className="fill-black/80 stroke-abyss-gold stroke-2" />
                            </svg>
                            <div className="relative z-10 text-center">
                                <span className="font-fantasy text-3xl font-extrabold text-white leading-none">{user?.level || 24}</span>
                                <span className="block text-[7px] font-sans text-abyss-muted uppercase tracking-widest font-semibold mt-0.5">LEVEL</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: XP Progress bar & Streaks details */}
                    <div className="relative z-10 flex flex-col space-y-4 max-w-md w-full xl:w-auto">
                        {/* XP Progress Bar */}
                        <div className="w-full xl:w-56 space-y-1.5 font-mono text-[9px] text-abyss-muted uppercase tracking-widest">
                            <div className="flex justify-between px-1">
                                <span>XP PROGRESS</span>
                                <span className="text-white font-bold">{user?.xp || 2480} / {progress?.nextLevelXP || 4000} XP</span>
                            </div>
                            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/5 p-0.5">
                                <div 
                                    className="bg-gradient-to-r from-abyss-primary to-purple-500 h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(124,58,237,0.5)]" 
                                    style={{ width: `${Math.min(100, Math.round(((user?.xp || 2480) / (progress?.nextLevelXP || 4000)) * 100))}%` }}
                                />
                            </div>
                        </div>

                        {/* Horizontal statistics stats list */}
                        <div className="flex justify-between items-center text-[9px] font-mono text-abyss-muted uppercase tracking-wider gap-4">
                            <div className="flex items-center space-x-1.5">
                                <span className="text-orange-400">🔥</span>
                                <div>
                                    <span className="text-white font-bold block leading-none">{user?.streak || 9}</span>
                                    <span className="text-[7px] text-abyss-muted/70 block uppercase">DAY STREAK</span>
                                </div>
                            </div>
                            <div className="flex items-center space-x-1.5">
                                <span className="text-abyss-gold">🪙</span>
                                <div>
                                    <span className="text-white font-bold block leading-none">{user?.coins || 0}</span>
                                    <span className="text-[7px] text-abyss-muted/70 block uppercase">COINS</span>
                                </div>
                            </div>
                            <div className="flex items-center space-x-1.5">
                                <span className="text-abyss-gold">👑</span>
                                <div>
                                    <span className="text-white font-bold block leading-none">{user?.xp || 2480}</span>
                                    <span className="text-[7px] text-abyss-muted/70 block uppercase">TOTAL XP</span>
                                </div>
                            </div>
                            <div className="flex items-center space-x-1.5">
                                <span className="text-purple-400">⚔️</span>
                                <div>
                                    <span className="text-white font-bold block leading-none">{user?.completedProblems?.length || 128}</span>
                                    <span className="text-[7px] text-abyss-muted/70 block uppercase">PROBLEMS SOLVED</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Choose Your Realm Title Header */}
                <div className="text-center xl:text-left space-y-1.5 pt-4 border-t border-white/5 w-full">
                    <h2 className="font-fantasy text-lg font-bold uppercase tracking-[0.25em] text-abyss-gold flex items-center justify-center xl:justify-start gap-1">
                        CHOOSE YOUR REALM <span className="text-sm font-sans">➔</span>
                    </h2>
                </div>

                {/* Uniform wide banners list */}
                <div className="flex flex-col space-y-6 w-full">
                    {realms.map((realm, idx) => (
                        <div key={realm._id} className="w-full">
                            <RealmCard 
                                realm={realm}
                                index={idx}
                                playerLevel={playerLevel}
                                onEnter={() => handleEnterRealm(realm)}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Side Column Panel (24% width) */}
            <div className="w-full xl:w-[24%] space-y-6 lg:sticky lg:top-24">
                
                {/* 1. YOUR RANK */}
                <div className="border border-white/10 rounded-2xl bg-black/80 p-5 space-y-4 shadow-[0_4px_20px_rgba(0,0,0,0.5)] text-center relative overflow-hidden">
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
                    <span className="font-fantasy text-[9px] uppercase tracking-widest text-abyss-gold block text-left">YOUR RANK</span>
                    
                    {/* Rank Crest Emblem */}
                    <div className="w-20 h-20 mx-auto rounded-full bg-purple-950/20 border border-purple-500/20 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.15)] animate-pulse">
                        <GiShield className="text-purple-400 text-4xl filter drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
                    </div>

                    <div className="space-y-1">
                        <h4 className="font-fantasy text-sm font-bold text-white uppercase tracking-wider">
                            {user?.rank || 'SHADOW INITIATE'}
                        </h4>
                        <p className="text-[9px] font-sans text-abyss-muted uppercase tracking-wider">
                            Top 28% of Warriors
                        </p>
                    </div>

                    <button 
                        onClick={() => navigate('/leaderboard')}
                        className="w-full py-2.5 rounded bg-purple-950/30 hover:bg-purple-900/40 border border-purple-500/30 hover:border-purple-500/60 text-[9px] font-fantasy uppercase tracking-widest text-purple-400 hover:text-white transition-all flex items-center justify-center space-x-2 font-bold cursor-pointer"
                    >
                        <span>VIEW LEADERBOARD</span>
                        <FaChevronRight className="text-[7px]" />
                    </button>
                </div>

                {/* 2. RECENT ACHIEVEMENT */}
                <div className="border border-white/10 rounded-2xl bg-black/80 p-5 space-y-4 shadow-[0_4px_20px_rgba(0,0,0,0.5)] relative overflow-hidden">
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-abyss-gold to-transparent"></div>
                    <span className="font-fantasy text-[9px] uppercase tracking-widest text-abyss-gold block">RECENT ACHIEVEMENT</span>

                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-xl bg-abyss-gold/15 border border-abyss-gold/30 flex items-center justify-center flex-shrink-0 shadow-[0_0_10px_rgba(212,175,55,0.15)]">
                            <GiAchievement className="text-abyss-gold text-2xl" />
                        </div>
                        <div className="space-y-0.5 overflow-hidden">
                            <h4 className="font-fantasy text-xs font-bold text-white uppercase tracking-wider truncate">
                                FIRST BLOOD
                            </h4>
                            <p className="text-[9px] text-abyss-muted leading-tight truncate">
                                Solved your first problem
                            </p>
                            <span className="text-[8px] font-mono text-green-400 font-bold block mt-1">+10 XP</span>
                        </div>
                    </div>
                </div>

                {/* 3. STATS OVERVIEW */}
                <div className="border border-white/10 rounded-2xl bg-black/80 p-5 space-y-4 shadow-[0_4px_20px_rgba(0,0,0,0.5)] relative overflow-hidden">
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent"></div>
                    <span className="font-fantasy text-[9px] uppercase tracking-widest text-abyss-gold block">STATS OVERVIEW</span>

                    <div className="space-y-3 text-[10px] font-mono uppercase tracking-wider text-abyss-muted">
                        <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                            <span className="flex items-center gap-1.5">👑 Total XP</span>
                            <span className="text-white font-bold">{user?.xp || 2480}</span>
                        </div>
                        <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                            <span className="flex items-center gap-1.5">⚔️ Problems Solved</span>
                            <span className="text-white font-bold">{user?.completedProblems?.length || 128}</span>
                        </div>
                        <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                            <span className="flex items-center gap-1.5">🛡️ Realms Conquered</span>
                            <span className="text-white font-bold">{Math.max(1, user?.completedWorlds?.length || 1)}</span>
                        </div>
                        <div className="flex justify-between items-center py-1.5">
                            <span className="flex items-center gap-1.5">🏆 Grandmaster Trials</span>
                            <span className="text-white font-bold">0</span>
                        </div>
                    </div>

                    <button 
                        onClick={() => navigate('/command-center')}
                        className="w-full py-2.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-[9px] font-fantasy uppercase tracking-widest text-white transition-all flex items-center justify-center space-x-2 font-bold cursor-pointer"
                    >
                        <span>VIEW DETAILED STATS</span>
                        <FaChevronRight className="text-[7px]" />
                    </button>
                </div>

                {/* 4. DAILY QUEST */}
                <div className="border border-white/10 rounded-2xl bg-black/80 p-5 space-y-4 shadow-[0_4px_20px_rgba(0,0,0,0.5)] relative overflow-hidden">
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent"></div>
                    <span className="font-fantasy text-[9px] uppercase tracking-widest text-abyss-gold block">DAILY QUEST</span>

                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-xl bg-orange-950/20 border border-orange-500/20 flex items-center justify-center flex-shrink-0">
                            <GiScrollUnfurled className="text-orange-400 text-2xl" />
                        </div>
                        <div className="space-y-1.5 flex-1 min-w-0">
                            <h4 className="font-fantasy text-xs font-bold text-white uppercase tracking-wider truncate">
                                Solve 3 problems today
                            </h4>
                            {/* Quest Progress */}
                            <div className="space-y-1">
                                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                                    <div 
                                        className="bg-orange-500 h-full rounded-full transition-all duration-500" 
                                        style={{ width: `${Math.round(((user?.completedProblems?.length || 0) % 3) / 3 * 100)}%` }}
                                    />
                                </div>
                                <div className="flex justify-between text-[8px] text-abyss-muted font-mono">
                                    <span>{(user?.completedProblems?.length || 0) % 3} / 3</span>
                                    <span className="text-orange-400 font-bold">+30 XP</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </motion.div>
    );
};

export default Worlds;
