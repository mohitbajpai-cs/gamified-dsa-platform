import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getProblemByIdApi, getProblemsByTopicApi } from '../../services/world.api';
import Card from '../../components/ui/Card';
import PrimaryButton from '../../components/ui/PrimaryButton';
import SecondaryButton from '../../components/ui/SecondaryButton';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { motion } from 'framer-motion';
import { GiGothicCross, GiSwordsPower, GiCompass } from 'react-icons/gi';
import { FaChevronRight, FaChevronLeft } from 'react-icons/fa';
import { ROUTES } from '../../constants/routes';

const ProblemDetails = () => {
    const { problemId } = useParams();
    const navigate = useNavigate();

    const [problem, setProblem] = useState(null);
    const [problemsList, setProblemsList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProblemDetails = async () => {
            setLoading(true);
            try {
                const res = await getProblemByIdApi(problemId);
                if (res.success && res.data) {
                    const prob = res.data;
                    setProblem(prob);

                    // Fetch sibling problems in the same topic for prev/next navigation bounds
                    const siblingsRes = await getProblemsByTopicApi(prob.topic);
                    if (siblingsRes.success && siblingsRes.data) {
                        setProblemsList(siblingsRes.data);
                    }
                }
            } catch (err) {
                console.error('Failed to load problem details:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProblemDetails();
    }, [problemId]);

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (!problem) {
        return (
            <div className="text-center py-12">
                <p className="text-abyss-danger font-fantasy uppercase text-lg">Trial coordinates lost in the void.</p>
                <Link to={ROUTES.WORLDS} className="text-abyss-gold underline mt-4 inline-block font-fantasy uppercase text-xs">Return to Realms Map</Link>
            </div>
        );
    }

    // Solve navigation indices
    const currentIdx = problemsList.findIndex(p => String(p._id) === String(problemId));
    const prevProblem = currentIdx > 0 ? problemsList[currentIdx - 1] : null;
    const nextProblem = currentIdx < problemsList.length - 1 ? problemsList[currentIdx + 1] : null;

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
            {/* Nav Headers & Breadcrumbs */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-abyss-border/20 pb-4">
                <div className="flex items-center space-x-2 text-xs font-fantasy uppercase tracking-wider text-abyss-muted">
                    <Link to={ROUTES.WORLDS} className="hover:text-white transition-colors">Realms Map</Link>
                    <FaChevronRight />
                    <Link to={`/realms/${problem.world}`} className="hover:text-white transition-colors">Realm details</Link>
                    <FaChevronRight />
                    <Link to={`/topics/${problem.topic}`} className="hover:text-white transition-colors">Topic</Link>
                    <FaChevronRight />
                    <span className="text-white truncate max-w-[120px]">{problem.title}</span>
                </div>

                <div className="flex items-center space-x-3 text-xs font-fantasy uppercase tracking-wider">
                    <Link to={`/topics/${problem.topic}`} className="text-abyss-muted hover:text-abyss-gold transition-colors flex items-center space-x-1.5">
                        <FaChevronLeft />
                        <span>Back to Topic</span>
                    </Link>
                    <span className="text-abyss-border">|</span>
                    <Link to={`/realms/${problem.world}`} className="text-abyss-muted hover:text-abyss-gold transition-colors flex items-center space-x-1.5">
                        <GiCompass />
                        <span>Back to Realm</span>
                    </Link>
                </div>
            </div>

            {/* Main Details Body */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left column: Statement, examples, constraints */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-abyss-border/40 p-6 space-y-6">
                        <div className="flex justify-between items-start flex-wrap gap-4 border-b border-abyss-border/20 pb-4">
                            <div>
                                <h1 className="font-fantasy text-2xl font-bold text-white uppercase tracking-wider">
                                    {problem.title}
                                </h1>
                                <p className="text-xs text-abyss-muted font-mono mt-1">
                                    Trial Code: {problem._id}
                                </p>
                            </div>

                            <div className="flex items-center space-x-2.5">
                                <span className={`text-xs uppercase font-fantasy tracking-wider px-3 py-1 rounded border bg-black/45 ${difficultyColors[problem.difficulty] || difficultyColors.easy}`}>
                                    {problem.difficulty}
                                </span>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-3">
                            <h3 className="font-fantasy text-sm text-abyss-gold uppercase tracking-widest">Dungeon Description</h3>
                            <div 
                                className="font-sans text-sm text-abyss-muted leading-relaxed space-y-3"
                                dangerouslySetInnerHTML={{ __html: problem.description }}
                            />
                        </div>

                        {/* Examples */}
                        {problem.examples && problem.examples.length > 0 && (
                            <div className="space-y-4 pt-4 border-t border-abyss-border/10">
                                <h3 className="font-fantasy text-sm text-abyss-gold uppercase tracking-widest">Examples & Spells Runs</h3>
                                <div className="space-y-4">
                                    {problem.examples.map((ex, index) => (
                                        <div key={index} className="bg-black/30 border border-abyss-border/40 rounded-xl p-4 font-mono text-xs space-y-2">
                                            <p className="text-purple-400 font-bold">Example {index + 1}:</p>
                                            <p><span className="text-abyss-muted">Input:</span> <span className="text-white">{ex.input}</span></p>
                                            <p><span className="text-abyss-muted">Expected Output:</span> <span className="text-white">{ex.output}</span></p>
                                            {ex.explanation && (
                                                <p className="text-abyss-muted mt-1 leading-relaxed"><span className="underline">Explanation:</span> {ex.explanation}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Constraints */}
                        {problem.constraints && problem.constraints.length > 0 && (
                            <div className="space-y-3 pt-4 border-t border-abyss-border/10">
                                <h3 className="font-fantasy text-sm text-abyss-gold uppercase tracking-widest">Spell Constraints</h3>
                                <ul className="list-disc list-inside font-mono text-xs text-abyss-muted space-y-1">
                                    {problem.constraints.map((c, i) => (
                                        <li key={i} className="leading-relaxed">{c}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </Card>
                </div>

                {/* Right column: Specs, Rewards, navigation boundaries */}
                <div className="space-y-6">
                    <Card className="border-abyss-gold/20 flex flex-col justify-between p-6 space-y-6">
                        <div className="space-y-4">
                            <h3 className="font-fantasy text-base text-abyss-gold uppercase tracking-widest border-b border-abyss-border/20 pb-2">
                                Trial Rewards
                            </h3>
                            
                            <div className="grid grid-cols-2 gap-4 text-center">
                                <div className="bg-black/35 border border-abyss-border/40 p-3 rounded-lg">
                                    <span className="text-[9px] uppercase tracking-wider text-abyss-muted block">Spell XP</span>
                                    <span className="font-mono text-base font-bold text-purple-400 mt-1 block">+{problem.xpReward} XP</span>
                                </div>
                                <div className="bg-black/35 border border-abyss-border/40 p-3 rounded-lg">
                                    <span className="text-[9px] uppercase tracking-wider text-abyss-muted block">Gold Coins</span>
                                    <span className="font-mono text-base font-bold text-abyss-gold mt-1 block">+{problem.coinReward} Coins</span>
                                </div>
                            </div>

                            <div className="border-t border-abyss-border/20 pt-4 space-y-2 text-xs font-sans text-abyss-muted">
                                <div className="flex justify-between">
                                    <span>Acceptance Rate:</span>
                                    <span className="text-white font-mono font-semibold">84%</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Estimated Duration:</span>
                                    <span className="text-white font-mono font-semibold">
                                        {problem.difficulty === 'hard' ? '45 mins' : problem.difficulty === 'medium' ? '30 mins' : '15 mins'}
                                    </span>
                                </div>
                            </div>

                            {/* Tags list */}
                            {problem.tags && problem.tags.length > 0 && (
                                <div className="space-y-2 pt-2">
                                    <span className="text-[9px] uppercase text-abyss-muted block tracking-wider">Classification Tags:</span>
                                    <div className="flex flex-wrap gap-1.5">
                                        {problem.tags.map((tag) => (
                                            <span key={tag} className="text-[9px] uppercase font-fantasy border border-abyss-border px-2 py-0.5 rounded text-abyss-muted bg-abyss-bg/60">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Start Challenge */}
                        <div className="pt-4 border-t border-abyss-border/20">
                            <PrimaryButton
                                onClick={() => navigate(`/arena/${problem._id}`)}
                                className="w-full text-center flex items-center justify-center space-x-2 py-3"
                            >
                                <GiSwordsPower className="text-lg" />
                                <span>Start Challenge</span>
                            </PrimaryButton>
                        </div>
                    </Card>

                    {/* Sibling navigation cards */}
                    <div className="flex justify-between items-center gap-4">
                        <SecondaryButton
                            onClick={() => navigate(`/problems/${prevProblem._id}`)}
                            disabled={!prevProblem}
                            className="flex-1 text-center py-2 px-3 text-xs flex items-center justify-center space-x-1.5"
                        >
                            <FaChevronLeft />
                            <span>Prev Dungeon</span>
                        </SecondaryButton>

                        <SecondaryButton
                            onClick={() => navigate(`/problems/${nextProblem._id}`)}
                            disabled={!nextProblem}
                            className="flex-1 text-center py-2 px-3 text-xs flex items-center justify-center space-x-1.5"
                        >
                            <span>Next Dungeon</span>
                            <FaChevronRight />
                        </SecondaryButton>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default ProblemDetails;
