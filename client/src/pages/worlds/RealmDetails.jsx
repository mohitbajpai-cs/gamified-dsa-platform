import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getWorldByIdApi, getTopicsByWorldApi, getProblemsByTopicApi } from '../../services/world.api';
import { getProgressApi } from '../../services/progress.api';
import Card from '../../components/ui/Card';
import PrimaryButton from '../../components/ui/PrimaryButton';
import SecondaryButton from '../../components/ui/SecondaryButton';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import RealmProgress from '../../components/worlds/RealmProgress';
import BossBadge from '../../components/worlds/BossBadge';
import { FANTASY_REALMS } from '../../constants/realmsData';
import { motion, AnimatePresence } from 'framer-motion';
import { GiGothicCross, GiSwordsPower, GiScrollUnfurled, GiCastle, GiFlame, GiWaterDrop, GiPortal } from 'react-icons/gi';
import { FaChevronRight, FaLock, FaSkull, FaTrophy, FaCalendarCheck } from 'react-icons/fa';
import { ROUTES } from '../../constants/routes';
import { getBossByRealmIdApi } from '../../services/boss.api';
import BossIntroOverlay from '../../components/worlds/BossIntroOverlay';

const RealmDetails = () => {
    const { worldId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [world, setWorld] = useState(null);
    const [topics, setTopics] = useState([]);
    const [allProblems, setAllProblems] = useState([]);
    const [progress, setProgress] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEntering, setIsEntering] = useState(false);
    const [bossDetails, setBossDetails] = useState(null);
    const [bossIntroOpen, setBossIntroOpen] = useState(false);

    useEffect(() => {
        const fetchRealmDetails = async () => {
            try {
                const [worldRes, topicsRes, progressRes] = await Promise.all([
                    getWorldByIdApi(worldId),
                    getTopicsByWorldApi(worldId),
                    getProgressApi()
                ]);

                if (worldRes.success && worldRes.data) {
                    setWorld(worldRes.data);
                }

                const progressData = progressRes.success ? progressRes.data : null;
                setProgress(progressData);

                if (topicsRes.success && topicsRes.data) {
                    const topicsList = topicsRes.data;

                    // Query problems under each topic to resolve real-time progress percentages
                    const problemsPromises = topicsList.map(t => getProblemsByTopicApi(t._id));
                    const problemsResults = await Promise.all(problemsPromises);

                    // Flatten list of all problems inside this world
                    const flatProbs = [];
                    problemsResults.forEach(res => {
                        if (res.success && res.data) {
                            flatProbs.push(...res.data);
                        }
                    });
                    setAllProblems(flatProbs);

                    const mappedTopics = topicsList.map((t, index) => {
                        const problemsInTopic = problemsResults[index].success ? problemsResults[index].data : [];
                        const solvedProblems = problemsInTopic.filter(
                            p => progressData?.completedProblems?.some(cpId => String(cpId) === String(p._id))
                        );

                        const totalCount = problemsInTopic.length;
                        const solvedCount = solvedProblems.length;
                        const pct = totalCount > 0 ? Math.round((solvedCount / totalCount) * 100) : 0;

                        // Lock logic
                        const isFirst = index === 0;
                        const previousTopicCompleted = index > 0 && 
                            (Math.round((problemsResults[index - 1].data?.filter(
                                p => progressData?.completedProblems?.some(cpId => String(cpId) === String(p._id))
                            ).length / problemsResults[index - 1].data?.length) * 100) >= 100);
                        
                        const locked = !isFirst && !previousTopicCompleted && (user?.level || 1) < (worldRes.data?.unlockLevel || 1);

                        return {
                            ...t,
                            problemsCount: totalCount,
                            solvedCount,
                            completionPct: pct,
                            locked
                        };
                    });

                    setTopics(mappedTopics);
                }

                // Load boss details
                const bossRes = await getBossByRealmIdApi(worldId);
                if (bossRes.success && bossRes.data) {
                    setBossDetails(bossRes.data);
                }
            } catch (err) {
                console.error('Failed to load realm details:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchRealmDetails();
    }, [worldId, user?.level]);

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (!world) {
        return (
            <div className="text-center py-12">
                <p className="text-abyss-danger font-fantasy uppercase text-lg">Realm coordinates lost in the void.</p>
                <Link to={ROUTES.WORLDS} className="text-abyss-gold underline mt-4 inline-block font-fantasy uppercase text-xs">Return to Worlds Map</Link>
            </div>
        );
    }

    // Map database order to fantasy elements mapping
    const fantasyRealm = FANTASY_REALMS[world.order] || FANTASY_REALMS[0];
    const RealmIcon = fantasyRealm.icon;

    // Calculate dynamic stats
    const totalWorldProblems = allProblems.length;
    const solvedWorldProblems = allProblems.filter(p => progress?.completedProblems?.some(cpId => String(cpId) === String(p._id))).length;
    const normalProblems = allProblems.filter(p => !p.bossLevel);
    const completedNormals = normalProblems.filter(prob => progress?.completedProblems?.some(cpId => String(cpId) === String(prob._id)));
    const remainingCount = Math.max(0, normalProblems.length - completedNormals.length);
    const isBossUnlocked = remainingCount === 0 && (user?.level >= world.unlockLevel);
    const isBossDefeated = bossDetails ? bossDetails.defeated : false;
    const completionPercentage = totalWorldProblems > 0 ? Math.round((solvedWorldProblems / totalWorldProblems) * 100) : 0;
    const bossUnlocked = progress?.currentWorld?._id === world._id && progress?.bossUnlocked;

    const handleEnterRealmJourney = () => {
        setIsEntering(true);
        setTimeout(() => {
            // Navigate to first unsolved problem, or first topic explore list
            if (topics.length > 0) {
                navigate(`/topics/${topics[0]._id}`);
            } else {
                navigate(ROUTES.WORLDS);
            }
        }, 1100);
    };

    // Ambient particles generation
    const renderAmbientParticles = () => {
        const particlesCount = 15;
        const particles = [];
        
        // Define styles depending on fantasy name mapping
        let colorClass = 'bg-purple-500/25';
        if (fantasyRealm.name.includes('Volcano')) colorClass = 'bg-red-500/40 shadow-glow-danger';
        else if (fantasyRealm.name.includes('Ocean')) colorClass = 'bg-cyan-400/25 shadow-glow-primary';
        else if (fantasyRealm.name.includes('Forest') || fantasyRealm.name.includes('Sanctuary')) colorClass = 'bg-emerald-400/30';
        else if (fantasyRealm.name.includes('Frozen')) colorClass = 'bg-blue-200/40';
        else if (fantasyRealm.name.includes('Void')) colorClass = 'bg-pink-400/35';

        for (let i = 0; i < particlesCount; i++) {
            const randomDelay = Math.random() * 5;
            const randomDuration = 4 + Math.random() * 6;
            const randomSize = 4 + Math.random() * 8;
            const leftOffset = Math.random() * 100;
            const topOffset = Math.random() * 100;
            
            particles.push(
                <div 
                    key={i}
                    style={{
                        animationDelay: `${randomDelay}s`,
                        animationDuration: `${randomDuration}s`,
                        width: `${randomSize}px`,
                        height: `${randomSize}px`,
                        left: `${leftOffset}%`,
                        top: `${topOffset}%`
                    }}
                    className={`absolute rounded-full pointer-events-none animate-float opacity-30 blur-[1px] ${colorClass}`}
                />
            );
        }
        return particles;
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-12 pb-24 relative"
        >
            {/* Full-viewport Teleportation Portal Transition Overlay */}
            <AnimatePresence>
                {isEntering && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/95 backdrop-blur-xl"
                    >
                        <motion.div 
                            initial={{ scale: 0.1, opacity: 1 }}
                            animate={{ scale: 25, opacity: 0 }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className={`w-24 h-24 rounded-full border-double ${fantasyRealm.color} border-current absolute bg-transparent filter blur-sm`}
                        />
                        <motion.div 
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                            className={`w-32 h-32 rounded-full border border-dotted ${fantasyRealm.color} border-current opacity-30`}
                        />
                        <motion.div className="relative z-10 text-center space-y-4">
                            {RealmIcon && (
                                <RealmIcon className={`${fantasyRealm.color} text-6xl mx-auto animate-spin`} />
                            )}
                            <h3 className="font-fantasy text-xl font-bold tracking-[0.3em] uppercase text-white animate-pulse">
                                Anchoring Portal Spells...
                            </h3>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Breadcrumbs */}
            <div className="flex items-center space-x-2 text-xs font-fantasy uppercase tracking-wider text-abyss-muted">
                <Link to={ROUTES.WORLDS} className="hover:text-abyss-gold transition-colors">Realms Map</Link>
                <FaChevronRight className="text-[10px]" />
                <span className="text-white">{fantasyRealm.name} details</span>
            </div>

            {/* AAA Cinematic Realm Hero Section */}
            <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-b ${fantasyRealm.bg} border-2 border-abyss-border/60 p-8 md:p-12 shadow-2xl`}>
                {/* Lightrays & Gradients overlays */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.04),transparent)] animate-pulse-slow"></div>
                <div className="absolute -inset-1/2 bg-[conic-gradient(from_0deg,transparent,rgba(255,255,255,0.01),transparent)] animate-fog pointer-events-none"></div>
                <div className="absolute inset-0 bg-black/40 z-0"></div>

                {/* Render dynamic floating elements inside hero banner background */}
                {renderAmbientParticles()}

                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-stretch gap-10">
                    <div className="space-y-6 max-w-3xl flex flex-col justify-center">
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="text-[10px] uppercase tracking-[0.2em] font-fantasy px-3 py-1 rounded bg-black/80 border border-abyss-border/40 text-abyss-gold shadow-sm">
                                Difficulty: {world.difficulty}
                            </span>
                            <span className="text-xs font-mono text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 rounded-md">
                                Requisite Standing: Level {world.unlockLevel}
                            </span>
                        </div>
                        
                        <div className="space-y-2">
                            <h1 className="font-fantasy text-4xl sm:text-5xl font-bold tracking-widest text-white uppercase leading-none filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                                {fantasyRealm.name}
                            </h1>
                            <p className={`font-fantasy italic text-sm tracking-wide ${fantasyRealm.color}`}>
                                "{fantasyRealm.lore}"
                            </p>
                        </div>

                        <p className="font-sans text-xs text-abyss-muted leading-relaxed max-w-2xl bg-black/25 p-4 rounded-xl border border-abyss-border/20 backdrop-blur-sm">
                            {world.description || 'Cast coding verification algorithms to overcome normal and boss coordinate chambers in this zone.'}
                        </p>

                        <div className="pt-2 flex flex-wrap gap-4">
                            <PrimaryButton 
                                onClick={handleEnterRealmJourney}
                                className="px-8 py-3 text-sm font-fantasy tracking-widest uppercase relative overflow-hidden group/hero"
                            >
                                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent transform -translateX-full group-hover/hero:animate-shine pointer-events-none"></span>
                                Continue Journey
                            </PrimaryButton>
                            
                            <Link to={ROUTES.WORLDS} className="px-6 py-3 border border-abyss-border/60 rounded-lg text-xs font-fantasy tracking-widest uppercase text-abyss-muted hover:text-white hover:border-white transition-all flex items-center justify-center bg-black/40">
                                Leave Coordinates
                            </Link>
                        </div>
                    </div>

                    {/* Quick Stats side block */}
                    <div className="flex flex-col gap-4 lg:w-[280px] justify-center">
                        <div className="bg-black/85 border border-abyss-border/40 p-5 rounded-2xl flex flex-col justify-between backdrop-blur-md relative group">
                            <div className={`absolute top-0 left-0 w-8 h-[1px] bg-gradient-to-r from-transparent via-abyss-gold to-transparent`}></div>
                            <span className="text-[9px] uppercase tracking-widest text-abyss-muted block">Estimated Rewards</span>
                            <div className="mt-2 space-y-1">
                                <span className="font-fantasy text-sm text-purple-400 block font-semibold">+{world.unlockLevel * 500} Spell XP</span>
                                <span className="font-fantasy text-sm text-abyss-gold block font-semibold">+{world.unlockLevel * 100} Treasury Gold</span>
                            </div>
                        </div>
                        
                        <div className="bg-black/85 border border-abyss-border/40 p-5 rounded-2xl flex items-center justify-between backdrop-blur-md relative">
                            <div>
                                <span className="text-[9px] uppercase tracking-widest text-abyss-muted block">Completion Rate</span>
                                <span className="font-mono text-xl font-bold text-white block mt-1">
                                    {completionPercentage}%
                                </span>
                            </div>
                            <div className={`w-12 h-12 rounded-full border border-abyss-border flex items-center justify-center ${fantasyRealm.color} bg-black/60 shadow-glow-primary`}>
                                {RealmIcon && <RealmIcon className="text-xl" />}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Progress bar overlay banner */}
                <div className="mt-10 pt-6 border-t border-abyss-border/20 relative z-10">
                    <RealmProgress completed={solvedWorldProblems} total={totalWorldProblems || 9} />
                </div>
            </div>

            {/* Split layout: Topic Explorer (Left) & RPG objective board / Boss Panel (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Topic Explorer list */}
                <div className="lg:col-span-2 space-y-6">
                    <div>
                        <h3 className="font-fantasy text-xl font-bold text-white uppercase tracking-widest">Topic Trials</h3>
                        <p className="font-sans text-xs text-abyss-muted">Select an algorithmic trial block to inspect coordinates.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {topics.map((topic) => (
                            <div key={topic._id} className="relative group">
                                {topic.locked && (
                                    <div className="absolute inset-0 bg-black/85 backdrop-blur-[2px] rounded-2xl z-20 flex flex-col items-center justify-center border border-abyss-border/45">
                                        <FaLock className="text-abyss-gold text-2xl animate-pulse mb-1.5" />
                                        <span className="font-fantasy text-[9px] uppercase tracking-widest text-abyss-gold">Topic Locked</span>
                                    </div>
                                )}

                                <Card className="flex flex-col justify-between h-full border-abyss-border/40 group-hover:border-abyss-primary/45 transition-all duration-300 bg-black/45 backdrop-blur-md rounded-2xl p-6">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-fantasy text-base font-bold text-white uppercase tracking-wide group-hover:text-abyss-gold transition-colors">
                                                {topic.name}
                                            </h4>
                                            <span className="text-[10px] font-mono text-purple-400 bg-purple-500/10 border border-purple-500/25 px-2 py-0.5 rounded">
                                                {topic.problemsCount} Trials
                                            </span>
                                        </div>
                                        <p className="font-sans text-xs text-abyss-muted leading-relaxed line-clamp-2">
                                            {topic.description || 'Tackle problems inside this topic to unlock subsequent challenges.'}
                                        </p>
                                    </div>

                                    <div className="mt-6 pt-4 border-t border-abyss-border/20 flex justify-between items-center">
                                        <div>
                                            <span className="text-[9px] uppercase text-abyss-muted block">Completion</span>
                                            <span className="font-mono text-xs font-bold text-white">{topic.completionPct}%</span>
                                        </div>

                                        <SecondaryButton
                                            onClick={() => navigate(`/topics/${topic._id}`)}
                                            disabled={topic.locked}
                                            className="py-1.5 px-4 text-[10px] flex items-center space-x-1.5 uppercase font-fantasy tracking-wider"
                                        >
                                            <span>Explore</span>
                                            <FaChevronRight className="text-[8px]" />
                                        </SecondaryButton>
                                    </div>
                                </Card>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right RPG Panels */}
                <div className="space-y-8 lg:col-span-1">
                    {/* Premium Guardian Panel */}
                    <div className="space-y-4">
                        <h3 className="font-fantasy text-xl font-bold text-white uppercase tracking-widest">Zone Guardian</h3>
                        <Card className="bg-gradient-to-b from-red-950/20 via-black/80 to-black border-2 border-red-500/20 p-6 rounded-2xl relative overflow-hidden text-center space-y-4">
                            {/* Flame overlay animation inside card */}
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.03),transparent)] animate-pulse-slow"></div>
                            
                            <div className="w-16 h-16 rounded-full bg-red-500/10 border-2 border-red-500/30 flex items-center justify-center mx-auto shadow-glow-danger">
                                <FaSkull className="text-red-500 text-3xl animate-bounce" />
                            </div>

                            <div className="space-y-1">
                                <h4 className="font-fantasy text-lg font-bold text-white uppercase tracking-wider">
                                    {fantasyRealm.boss}
                                </h4>
                                <span className="text-[9px] font-fantasy uppercase tracking-widest text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded">
                                    Difficulty: Hard ★★
                                </span>
                            </div>

                            <div className="divide-y divide-abyss-border/20 text-xs font-sans">
                                <div className="py-2 flex justify-between">
                                    <span className="text-abyss-muted uppercase text-[9px] tracking-wider">Completed Trials</span>
                                    <span className="text-white font-bold font-mono">{completedNormals.length} / {normalProblems.length}</span>
                                </div>
                                <div className="py-2 flex justify-between">
                                    <span className="text-abyss-muted uppercase text-[9px] tracking-wider">Remaining Trials</span>
                                    <span className="text-white font-bold font-mono">{remainingCount}</span>
                                </div>
                                <div className="py-2 flex justify-between">
                                    <span className="text-abyss-muted uppercase text-[9px] tracking-wider">Required Level</span>
                                    <span className="text-white font-bold font-mono">LVL {world.unlockLevel}</span>
                                </div>
                                <div className="py-2 flex justify-between">
                                    <span className="text-abyss-muted uppercase text-[9px] tracking-wider">Victory Bounty</span>
                                    <span className="text-abyss-gold font-bold font-mono">+{bossDetails?.reward?.xp || 500} XP / +{bossDetails?.reward?.coins || 150} G</span>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-abyss-border/20">
                                {isBossDefeated ? (
                                    <button disabled={true} className="w-full text-center py-2.5 bg-green-500/10 border border-green-500/30 text-green-400 font-fantasy text-xs uppercase tracking-wider rounded-xl">
                                        Guardian Slain
                                    </button>
                                ) : isBossUnlocked ? (
                                    <PrimaryButton onClick={() => setBossIntroOpen(true)} className="w-full text-center py-2.5 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 border border-red-500/30 text-white font-fantasy text-xs uppercase tracking-widest font-bold shadow-glow-danger/25">
                                        Breach Seal (Fight!)
                                    </PrimaryButton>
                                ) : (
                                    <button disabled={true} className="w-full text-center py-2.5 bg-black/60 border border-abyss-border/40 text-abyss-muted font-fantasy text-[9px] uppercase tracking-wider leading-none rounded-xl">
                                        Seal Locked (Solve {remainingCount} trials)
                                    </button>
                                )}
                            </div>
                        </Card>
                    </div>

                    {/* RPG Objectives Progression Panel */}
                    <div className="space-y-4">
                        <h3 className="font-fantasy text-xl font-bold text-white uppercase tracking-widest">Journey Progress</h3>
                        <Card className="bg-black/60 border border-abyss-border/40 p-6 rounded-2xl space-y-4">
                            <span className="text-[9px] uppercase tracking-widest text-abyss-muted block">Trial Checkpoints</span>
                            
                            <div className="space-y-3 font-sans text-xs">
                                {allProblems.map((prob) => {
                                    const isSolved = progress?.completedProblems?.some(cpId => String(cpId) === String(prob._id));
                                    
                                    return (
                                        <div key={prob._id} className="flex items-center justify-between py-1 border-b border-abyss-border/10 last:border-0">
                                            <span className={`font-medium ${isSolved ? 'text-green-400 line-through' : 'text-white'}`}>
                                                {prob.title}
                                            </span>
                                            {isSolved ? (
                                                <span className="text-[9px] font-fantasy uppercase text-green-400 bg-green-500/10 border border-green-500/20 px-1.5 py-0.5 rounded">
                                                    Conquered
                                                </span>
                                            ) : (
                                                <span className="text-[9px] font-fantasy uppercase text-abyss-muted bg-black/40 border border-abyss-border/40 px-1.5 py-0.5 rounded">
                                                    Pending
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="pt-4 border-t border-abyss-border/20 flex justify-between items-center text-[10px]">
                                <span className="text-abyss-muted uppercase tracking-wider">Estimated completion time</span>
                                <span className="text-white font-mono">{allProblems.length * 20} Mins</span>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Boss Battle Entrance Portal */}
            {bossDetails && (
                <BossIntroOverlay 
                    isOpen={bossIntroOpen}
                    boss={bossDetails}
                    worldName={world.name}
                    onClose={() => setBossIntroOpen(false)}
                    onEngage={() => {
                        setBossIntroOpen(false);
                        if (bossDetails && bossDetails.problemId) {
                            navigate(`/arena/${bossDetails.problemId._id || bossDetails.problemId}`);
                        }
                    }}
                />
            )}
        </motion.div>
    );
};

export default RealmDetails;
