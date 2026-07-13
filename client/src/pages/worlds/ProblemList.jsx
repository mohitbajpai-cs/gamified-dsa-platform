import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getProblemsByTopicApi, getTopicsByWorldApi } from '../../services/world.api';
import { getProgressApi } from '../../services/progress.api';
import Card from '../../components/ui/Card';
import SecondaryButton from '../../components/ui/SecondaryButton';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import BossBadge from '../../components/worlds/BossBadge';
import { motion } from 'framer-motion';
import { GiGothicCross, GiBrain, GiCheckMark } from 'react-icons/gi';
import { FaChevronRight, FaLock } from 'react-icons/fa';
import { ROUTES } from '../../constants/routes';

const ProblemList = () => {
    const { topicId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [problems, setProblems] = useState([]);
    const [topicName, setTopicName] = useState('Topic Trials');
    const [worldId, setWorldId] = useState(null);
    const [progress, setProgress] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProblemsData = async () => {
            try {
                const [problemsRes, progressRes] = await Promise.all([
                    getProblemsByTopicApi(topicId),
                    getProgressApi()
                ]);

                const progressData = progressRes.success ? progressRes.data : null;
                setProgress(progressData);

                if (problemsRes.success && problemsRes.data) {
                    const problemsList = problemsRes.data;
                    setProblems(problemsList);

                    if (problemsList.length > 0) {
                        const firstProb = problemsList[0];
                        setWorldId(firstProb.world);

                        // Lookup parent topic name using parent world topics API
                        const topicsRes = await getTopicsByWorldApi(firstProb.world);
                        if (topicsRes.success && topicsRes.data) {
                            const match = topicsRes.data.find(t => String(t._id) === String(topicId));
                            if (match) setTopicName(match.name);
                        }
                    }
                }
            } catch (err) {
                console.error('Failed to load problems:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProblemsData();
    }, [topicId]);

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    // Lock/status helper mapping
    const getProblemStatus = (problem) => {
        const isSolved = progress?.completedProblems?.some(cpId => String(cpId) === String(problem._id));
        if (isSolved) return 'solved';
        
        // Locked if boss level and user hasn't unlocked boss in this world yet
        if (problem.bossLevel && progress?.currentWorld?._id === problem.world && !progress?.bossUnlocked) {
            return 'locked';
        }
        return 'unsolved';
    };

    const difficultyColors = {
        easy: 'border-green-500/30 text-green-400',
        medium: 'border-blue-500/30 text-blue-400',
        hard: 'border-purple-500/30 text-purple-400 shadow-glow-primary',
        boss: 'border-abyss-danger/30 text-abyss-danger shadow-glow-danger'
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 80, damping: 15 }}
            className="space-y-8"
        >
            {/* Breadcrumbs */}
            <div className="flex items-center space-x-2 text-xs font-fantasy uppercase tracking-wider text-abyss-muted">
                <Link to={ROUTES.WORLDS} className="hover:text-white transition-colors">Realms Map</Link>
                <FaChevronRight />
                {worldId && (
                    <>
                        <Link to={`/realms/${worldId}`} className="hover:text-white transition-colors">Realm Details</Link>
                        <FaChevronRight />
                    </>
                )}
                <span className="text-white">{topicName}</span>
            </div>

            {/* Header info */}
            <div>
                <h1 className="font-fantasy text-3xl font-bold text-white tracking-widest uppercase">
                    {topicName} Trials
                </h1>
                <p className="font-sans text-xs text-abyss-muted">
                    Conquer the challenge dungeons listed below to earn spell experience and treasury coins.
                </p>
            </div>

            {problems.length === 0 ? (
                <Card className="text-center py-12 flex flex-col items-center justify-center">
                    <GiBrain className="text-abyss-muted text-4xl mb-3" />
                    <p className="font-fantasy text-xs text-abyss-gold uppercase tracking-wider">No trial challenges exist inside these coordinates.</p>
                </Card>
            ) : (
                /* Problem Cards list */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {problems.map((prob) => {
                        const status = getProblemStatus(prob);
                        const isSolved = status === 'solved';
                        const isLocked = status === 'locked';

                        return (
                            <div key={prob._id} className="relative group">
                                {isLocked && (
                                    <div className="absolute inset-0 bg-black/70 backdrop-blur-[2.5px] rounded-2xl z-20 flex flex-col items-center justify-center border border-abyss-border/40">
                                        <FaLock className="text-abyss-danger text-3xl animate-pulse mb-1.5" />
                                        <span className="font-fantasy text-xs uppercase tracking-widest text-abyss-danger">Boss Gate Sealed</span>
                                        <span className="text-[10px] text-abyss-muted mt-1 font-sans">Solve all normal dungeons to break the seal</span>
                                    </div>
                                )}

                                <Card className={`flex flex-col justify-between h-full border-abyss-border/40 transition-all ${isSolved ? 'border-green-500/20 hover:border-green-500/40 bg-green-950/5' : 'hover:border-abyss-primary/40'}`}>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center space-x-2">
                                                <h3 className="font-fantasy text-lg font-bold text-white uppercase tracking-wide group-hover:text-abyss-gold transition-colors">
                                                    {prob.title}
                                                </h3>
                                                {isSolved && <GiCheckMark className="text-green-400 text-sm" />}
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                {prob.bossLevel && <BossBadge unlocked={true} />}
                                                <span className={`text-[9px] uppercase font-fantasy tracking-wider px-2 py-0.5 rounded border bg-black/45 ${difficultyColors[prob.difficulty] || difficultyColors.easy}`}>
                                                    {prob.difficulty}
                                                </span>
                                            </div>
                                        </div>

                                        <p className="font-sans text-xs text-abyss-muted line-clamp-2 leading-relaxed">
                                            {prob.description?.replace(/<[^>]*>/g, '') || 'Tackle this algorithmic maze to refine your programming spellcraft.'}
                                        </p>
                                    </div>

                                    <div className="mt-6 pt-4 border-t border-abyss-border/20 flex justify-between items-center text-xs">
                                        <div className="flex space-x-4 font-mono text-[10px] text-abyss-muted">
                                            <div>
                                                <span className="block uppercase text-[8px] tracking-wider">XP Reward</span>
                                                <span className="text-purple-400 font-semibold">+{prob.xpReward} XP</span>
                                            </div>
                                            <div>
                                                <span className="block uppercase text-[8px] tracking-wider">Estimated Time</span>
                                                <span className="text-white">{prob.difficulty === 'hard' ? '45' : prob.difficulty === 'medium' ? '30' : '15'} Mins</span>
                                            </div>
                                        </div>

                                        <SecondaryButton
                                            onClick={() => navigate(`/problems/${prob._id}`)}
                                            className="py-1.5 px-4 text-xs flex items-center space-x-1.5"
                                        >
                                            <span>Enter Trials</span>
                                            <FaChevronRight />
                                        </SecondaryButton>
                                    </div>
                                </Card>
                            </div>
                        );
                    })}
                </div>
            )}
        </motion.div>
    );
};

export default ProblemList;
