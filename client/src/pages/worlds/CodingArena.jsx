import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getProblemByIdApi, getProblemsByTopicApi } from '../../services/world.api';
import { submitSolutionApi } from '../../services/submission.api';
import { submitBossSolutionApi } from '../../services/boss.api';
import Card from '../../components/ui/Card';
import PrimaryButton from '../../components/ui/PrimaryButton';
import SecondaryButton from '../../components/ui/SecondaryButton';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import VictoryModal from '../../components/shared/VictoryModal';
import AchievementPopup from '../../components/shared/AchievementPopup';
import { motion, AnimatePresence } from 'framer-motion';
import { GiGothicCross, GiCompass, GiScrollUnfurled, GiCheckMark, GiUpgrade, GiCoins, GiStopwatch } from 'react-icons/gi';
import { FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaTrashRestore, FaChevronRight, FaChevronLeft } from 'react-icons/fa';
import { ROUTES } from '../../constants/routes';

// Lazy Load Monaco Editor
const Editor = lazy(() => import('@monaco-editor/react'));

const CodingArena = () => {
    const { problemId } = useParams();
    const navigate = useNavigate();
    const { user, refreshUser } = useAuth();

    const [problem, setProblem] = useState(null);
    const [problemsList, setProblemsList] = useState([]);
    const [code, setCode] = useState('');
    const [language, setLanguage] = useState('javascript');
    const [editorTheme, setEditorTheme] = useState('vs-dark');
    
    // Status states
    const [saveStatus, setSaveStatus] = useState('Synced');
    const [loading, setLoading] = useState(true);
    const [executing, setExecuting] = useState(false);
    const [verdict, setVerdict] = useState(null);
    const [verdictDetails, setVerdictDetails] = useState(null);
    const [victoryOpen, setVictoryOpen] = useState(false);
    const [rewards, setRewards] = useState({});
    const [unlockedAchievements, setUnlockedAchievements] = useState([]);
    const [bossHp, setBossHp] = useState(100);

    // Sibling problem boundaries
    const [currentIdx, setCurrentIdx] = useState(-1);
    const [prevProblem, setPrevProblem] = useState(null);
    const [nextProblem, setNextProblem] = useState(null);

    // 1. Fetch problem specs
    useEffect(() => {
        const fetchProblem = async () => {
            setLoading(true);
            try {
                const res = await getProblemByIdApi(problemId);
                if (res.success && res.data) {
                    const prob = res.data;
                    setProblem(prob);

                    // Restore from localStorage or load default starterCode
                    const savedCode = localStorage.getItem(`abyss_trial_${problemId}`);
                    if (savedCode) {
                        setCode(savedCode);
                    } else {
                        setCode(prob.starterCode || `// Write your javascript spell here\nfunction solve(input) {\n    return input;\n}`);
                    }

                    // Fetch sibling problems in the same topic for prev/next navigation bounds
                    const siblingsRes = await getProblemsByTopicApi(prob.topic);
                    if (siblingsRes.success && siblingsRes.data) {
                        const list = siblingsRes.data;
                        setProblemsList(list);
                        
                        const idx = list.findIndex(p => String(p._id) === String(problemId));
                        setCurrentIdx(idx);
                        setPrevProblem(idx > 0 ? list[idx - 1] : null);
                        setNextProblem(idx < list.length - 1 ? list[idx + 1] : null);
                    }
                }
            } catch (err) {
                console.error('Failed to load arena problem:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProblem();
    }, [problemId]);

    // 2. Autosave Hook
    useEffect(() => {
        if (code && problemId && !loading) {
            localStorage.setItem(`abyss_trial_${problemId}`, code);
            setSaveStatus('Saving Draft...');
            const timer = setTimeout(() => {
                setSaveStatus('Synced');
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [code, problemId, loading]);

    // Boss HP Calculation and Reset effects
    useEffect(() => {
        setBossHp(100);
    }, [problemId]);

    useEffect(() => {
        if (problem && (problem.difficulty === 'boss' || problem.bossLevel) && verdictDetails) {
            if (verdict === 'accepted') {
                setBossHp(0);
            } else if (verdictDetails.totalTestCases > 0) {
                const passPct = (verdictDetails.testCasesPassed / verdictDetails.totalTestCases) * 100;
                setBossHp(Math.max(15, Math.round(100 - passPct)));
            }
        }
    }, [verdictDetails, verdict, problem]);

    // 3. Reset Code
    const handleReset = () => {
        if (problem) {
            setCode(problem.starterCode || `// Write your javascript spell here\nfunction solve(input) {\n    return input;\n}`);
            setSaveStatus('Reset');
        }
    };

    // 4. Run / Submit Flow
    const handleExecute = async (isSubmit = false) => {
        setExecuting(true);
        setVerdict('running');
        setVerdictDetails(null);

        try {
            const isBossBattle = problem.difficulty === 'boss' || problem.bossLevel;
            let res;
            if (isBossBattle && isSubmit) {
                res = await submitBossSolutionApi(problem.world, code, language);
            } else {
                res = await submitSolutionApi(problemId, code, language);
            }

            if (res.success && res.data) {
                const submission = res.data.submission;
                const rewardLogs = res.data.bossRewards || res.data.rewards || {};
                const activeVerdict = submission.verdict;

                setVerdict(activeVerdict);
                setVerdictDetails({
                    errorMessage: submission.errorMessage,
                    executionTime: submission.executionTime || 12,
                    memoryUsed: submission.memoryUsed || 1024,
                    testCasesPassed: submission.testCasesPassed || 0,
                    totalTestCases: submission.totalTestCases || 3
                });

                if (activeVerdict === 'accepted') {
                    if (isSubmit) {
                        setRewards(rewardLogs);
                        setVictoryOpen(true);
                        if (rewardLogs.newlyUnlockedAchievements && rewardLogs.newlyUnlockedAchievements.length > 0) {
                            setUnlockedAchievements(rewardLogs.newlyUnlockedAchievements);
                        }
                        // Refresh credentials inside Navbar/Sidebar
                        if (refreshUser) refreshUser();
                    }
                }
            }
        } catch (error) {
            setVerdict('runtime_error');
            setVerdictDetails({
                errorMessage: error.message || 'Execution error: Endpoint returned invalid code verification.',
                executionTime: 0,
                memoryUsed: 0,
                testCasesPassed: 0,
                totalTestCases: 3
            });
        } finally {
            setExecuting(false);
        }
    };

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
                <p className="text-abyss-danger font-fantasy uppercase text-lg">Arena coordinates lost in the void.</p>
                <Link to={ROUTES.WORLDS} className="text-abyss-gold underline mt-4 inline-block font-fantasy uppercase text-xs">Return to Worlds Map</Link>
            </div>
        );
    }

    // Colors mapping
    const difficultyColors = {
        easy: 'text-green-400 border-green-500/20 bg-green-500/5',
        medium: 'text-blue-400 border-blue-500/20 bg-blue-500/5',
        hard: 'text-purple-400 border-purple-500/20 bg-purple-500/5 shadow-glow-primary',
        boss: 'text-abyss-danger border-abyss-danger/20 bg-abyss-danger/5 shadow-glow-danger'
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col h-full space-y-6 relative"
        >
            {/* Top Navigation Headers */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-abyss-border/20 pb-4">
                <div className="flex items-center space-x-2 text-xs font-fantasy uppercase tracking-wider text-abyss-muted">
                    <Link to={ROUTES.WORLDS} className="hover:text-white transition-colors">Realms Map</Link>
                    <FaChevronRight />
                    <Link to={`/realms/${problem.world}`} className="hover:text-white transition-colors">Realm details</Link>
                    <FaChevronRight />
                    <Link to={`/topics/${problem.topic}`} className="hover:text-white transition-colors">Topic</Link>
                    <FaChevronRight />
                    <Link to={`/problems/${problem._id}`} className="hover:text-white transition-colors truncate max-w-[100px]">{problem.title}</Link>
                    <FaChevronRight />
                    <span className="text-abyss-gold font-bold">Coding Arena</span>
                </div>

                {/* Sibling dungeon jumps */}
                <div className="flex items-center space-x-3 text-xs font-fantasy uppercase tracking-wider">
                    <Link to={`/problems/${problem._id}`} className="text-abyss-muted hover:text-abyss-gold transition-colors flex items-center space-x-1">
                        <FaChevronLeft />
                        <span>Problem Info</span>
                    </Link>
                    {prevProblem && (
                        <>
                            <span className="text-abyss-border">|</span>
                            <Link to={`/arena/${prevProblem._id}`} className="text-abyss-muted hover:text-abyss-gold transition-colors">Prev Arena</Link>
                        </>
                    )}
                    {nextProblem && (
                        <>
                            <span className="text-abyss-border">|</span>
                            <Link to={`/arena/${nextProblem._id}`} className="text-abyss-muted hover:text-abyss-gold transition-colors">Next Arena</Link>
                        </>
                    )}
                </div>
            </div>

            {/* Split Workspace Layout */}
            <div className="flex flex-col lg:flex-row gap-6 flex-grow">
                {/* 1. LEFT PANE (35%): Statement details */}
                <div className="w-full lg:w-[35%] flex flex-col space-y-4">
                    <Card className="flex-1 overflow-y-auto max-h-[70vh] border-abyss-border/40 p-5 space-y-5">
                        <div>
                            <span className={`text-[9px] uppercase font-fantasy tracking-wider px-2 py-0.5 rounded border ${difficultyColors[problem.difficulty]}`}>
                                {problem.difficulty}
                            </span>
                            <h2 className="font-fantasy text-xl font-bold text-white uppercase tracking-wider mt-2.5">
                                {problem.title}
                            </h2>
                        </div>

                        {/* Statement */}
                        <div className="space-y-2">
                            <h4 className="font-fantasy text-xs text-abyss-gold uppercase tracking-widest border-b border-abyss-border/10 pb-1">Dungeon Statement</h4>
                            <div 
                                className="font-sans text-xs text-abyss-muted leading-relaxed space-y-2.5"
                                dangerouslySetInnerHTML={{ __html: problem.description }}
                            />
                        </div>

                        {/* Examples */}
                        {problem.examples && problem.examples.length > 0 && (
                            <div className="space-y-3">
                                <h4 className="font-fantasy text-xs text-abyss-gold uppercase tracking-widest border-b border-abyss-border/10 pb-1">Examples</h4>
                                <div className="space-y-3">
                                    {problem.examples.map((ex, index) => (
                                        <div key={index} className="bg-black/30 border border-abyss-border/40 rounded-xl p-3 font-mono text-[10px] space-y-1.5">
                                            <p className="text-purple-400 font-bold">Example {index + 1}:</p>
                                            <p><span className="text-abyss-muted">Input:</span> <span className="text-white">{ex.input}</span></p>
                                            <p><span className="text-abyss-muted">Output:</span> <span className="text-white">{ex.output}</span></p>
                                            {ex.explanation && (
                                                <p className="text-abyss-muted leading-relaxed italic"><span className="underline">Explain:</span> {ex.explanation}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Constraints */}
                        {problem.constraints && problem.constraints.length > 0 && (
                            <div className="space-y-2">
                                <h4 className="font-fantasy text-xs text-abyss-gold uppercase tracking-widest border-b border-abyss-border/10 pb-1">Constraints</h4>
                                <ul className="list-disc list-inside font-mono text-[10px] text-abyss-muted space-y-1">
                                    {problem.constraints.map((c, i) => (
                                        <li key={i}>{c}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Hints list */}
                        {problem.hints && problem.hints.length > 0 && (
                            <div className="space-y-2">
                                <h4 className="font-fantasy text-xs text-abyss-gold uppercase tracking-widest border-b border-abyss-border/10 pb-1">Hints</h4>
                                <div className="space-y-1.5">
                                    {problem.hints.map((hint, idx) => (
                                        <details key={idx} className="bg-black/20 border border-abyss-border/30 rounded-lg p-2.5 font-sans text-[10px] cursor-pointer text-abyss-muted hover:text-white">
                                            <summary className="font-fantasy uppercase text-[9px] text-abyss-gold tracking-widest">Reveal Hint {idx + 1}</summary>
                                            <p className="mt-2 leading-relaxed">{hint}</p>
                                        </details>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Tags */}
                        {problem.tags && problem.tags.length > 0 && (
                            <div className="space-y-1">
                                <span className="text-[9px] uppercase tracking-wider text-abyss-muted block">Tags</span>
                                <div className="flex flex-wrap gap-1">
                                    {problem.tags.map(t => (
                                        <span key={t} className="text-[8px] uppercase font-fantasy border border-abyss-border px-1.5 py-0.5 rounded text-abyss-muted bg-abyss-bg/60">
                                            {t}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </Card>
                </div>

                {/* 2. CENTER PANE (45%): Monaco Workspace Editor */}
                <div className="w-full lg:w-[45%] flex flex-col space-y-4">
                    <Card className="flex-1 flex flex-col justify-between border-abyss-primary/30 p-5 min-h-[50vh] max-h-[70vh]">
                        {/* Editor Controls Header */}
                        <div className="flex flex-wrap items-center justify-between border-b border-abyss-border/20 pb-3 mb-4 gap-2">
                            <div className="flex items-center space-x-2">
                                <GiScrollUnfurled className="text-abyss-gold text-lg" />
                                <span className="font-fantasy text-xs uppercase tracking-widest text-abyss-gold font-bold">
                                    Spellcrafter Workspace
                                </span>
                            </div>

                            {/* Selectors */}
                            <div className="flex items-center space-x-2 text-[10px]">
                                <select 
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value)}
                                    className="bg-black/45 border border-abyss-border/40 rounded px-2 py-1 text-white focus:outline-none focus:border-abyss-primary"
                                >
                                    <option value="javascript">JavaScript</option>
                                    <option value="python">Python (Mock)</option>
                                </select>
                                <select 
                                    value={editorTheme}
                                    onChange={(e) => setEditorTheme(e.target.value)}
                                    className="bg-black/45 border border-abyss-border/40 rounded px-2 py-1 text-white focus:outline-none focus:border-abyss-primary"
                                >
                                    <option value="vs-dark">Dark Theme</option>
                                    <option value="light">Light Theme</option>
                                </select>
                            </div>
                        </div>

                        {/* Editor Canvas */}
                        <div className="flex-1 border border-abyss-border/30 rounded-xl overflow-hidden min-h-[300px]">
                            <Suspense fallback={
                                <div className="h-full flex items-center justify-center bg-black/40">
                                    <LoadingSpinner size="md" />
                                </div>
                            }>
                                <Editor
                                    height="100%"
                                    language={language}
                                    theme={editorTheme}
                                    value={code}
                                    onChange={(val) => setCode(val || '')}
                                    options={{
                                        minimap: { enabled: false },
                                        fontSize: 12,
                                        tabSize: 4,
                                        lineNumbers: 'on',
                                        wordWrap: 'on',
                                        automaticLayout: true
                                    }}
                                />
                            </Suspense>
                        </div>

                        {/* Editor Action Controls Footer */}
                        <div className="border-t border-abyss-border/20 pt-4 mt-4 flex justify-between items-center flex-wrap gap-2 text-xs font-sans">
                            <span className="text-[10px] font-mono text-abyss-muted flex items-center space-x-1.5">
                                <span className={`w-1.5 h-1.5 rounded-full ${saveStatus === 'Synced' ? 'bg-green-400 shadow-glow-success' : 'bg-yellow-400 animate-pulse'}`}></span>
                                <span>{saveStatus}</span>
                            </span>

                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={handleReset}
                                    title="Restore starter code"
                                    className="p-2 border border-abyss-border/45 rounded bg-black/30 text-abyss-muted hover:text-white transition-colors cursor-pointer"
                                >
                                    <FaTrashRestore />
                                </button>
                                <SecondaryButton 
                                    onClick={() => handleExecute(false)}
                                    disabled={executing}
                                    className="py-1.5 px-3 text-xs"
                                >
                                    {executing && verdict === 'running' ? 'Casting...' : 'Run Code'}
                                </SecondaryButton>
                                <PrimaryButton
                                    onClick={() => handleExecute(true)}
                                    disabled={executing}
                                    className="py-1.5 px-3 text-xs"
                                >
                                    {executing && verdict === 'running' ? 'Submitting...' : 'Submit Code'}
                                </PrimaryButton>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* 3. RIGHT PANE (20%): Console, verdict & rewards */}
                <div className="w-full lg:w-[20%] flex flex-col space-y-4">
                    <Card className="flex-grow flex flex-col justify-between border-abyss-border/40 p-4 max-h-[70vh] overflow-y-auto">
                        <div>
                            <h4 className="font-fantasy text-xs text-abyss-gold tracking-widest uppercase mb-4 border-b border-abyss-border/10 pb-1">Spell Console</h4>
                            
                            {/* Execution Verdict Area */}
                            <div className="space-y-4">
                                {verdict === null && (
                                    <div className="text-center py-8 text-abyss-muted text-[10px] font-mono">
                                        Cast Run or Submit spells to verify logic.
                                    </div>
                                )}

                                {verdict === 'running' && (
                                    <div className="flex flex-col items-center justify-center py-8 space-y-2">
                                        <LoadingSpinner size="md" />
                                        <span className="text-[10px] font-mono text-purple-400 animate-pulse">Running Spells Verification...</span>
                                    </div>
                                )}

                                {verdict && verdict !== 'running' && (
                                    <div className="space-y-4">
                                        {/* Status Tag */}
                                        <div className={`p-3 rounded-lg border flex items-center justify-center space-x-2 font-fantasy uppercase text-xs tracking-wider
                                            ${verdict === 'accepted' ? 'border-green-500/25 bg-green-500/5 text-green-400 shadow-glow-success' : ''}
                                            ${verdict === 'wrong_answer' ? 'border-abyss-danger/25 bg-abyss-danger/5 text-abyss-danger shadow-glow-danger' : ''}
                                            ${verdict === 'compilation_error' || verdict === 'runtime_error' ? 'border-orange-500/25 bg-orange-500/5 text-orange-400' : ''}
                                        `}>
                                            {verdict === 'accepted' && <FaCheckCircle />}
                                            {verdict === 'wrong_answer' && <FaTimesCircle />}
                                            {(verdict === 'compilation_error' || verdict === 'runtime_error') && <FaExclamationTriangle />}
                                            <span>{verdict?.replace('_', ' ')}</span>
                                        </div>

                                        {/* Metadatas */}
                                        {verdictDetails && (
                                            <div className="space-y-2 text-[10px] font-mono text-abyss-muted border-b border-abyss-border/20 pb-3">
                                                <div className="flex justify-between">
                                                    <span>Passed Cases:</span>
                                                    <span className="text-white">{verdictDetails.testCasesPassed} / {verdictDetails.totalTestCases}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Time Spent:</span>
                                                    <span className="text-white">{verdictDetails.executionTime}ms</span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Compilation / Runtime Logs */}
                                        {verdictDetails?.errorMessage && (
                                            <div className="bg-black/50 border border-abyss-border/40 p-2.5 rounded-lg font-mono text-[9px] text-orange-400 break-words leading-normal max-h-36 overflow-y-auto">
                                                {verdictDetails.errorMessage}
                                            </div>
                                        )}

                                        {/* Wrong Answer Failed Case Visual */}
                                        {verdict === 'wrong_answer' && problem.examples?.[0] && (
                                            <div className="space-y-2 pt-1">
                                                <span className="text-[9px] text-abyss-danger uppercase font-fantasy font-semibold tracking-wider block">Failed Test Case</span>
                                                <div className="bg-black/45 border border-abyss-danger/25 p-3 rounded-lg font-mono text-[9px] space-y-1.5">
                                                    <p><span className="text-abyss-muted">Input:</span> <span className="text-white break-all">{problem.examples[0].input}</span></p>
                                                    <p><span className="text-abyss-muted">Expected:</span> <span className="text-green-400 break-all">{problem.examples[0].output}</span></p>
                                                    <p><span className="text-abyss-muted">Output:</span> <span className="text-abyss-danger break-all">undefined</span></p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Quest metrics reward overview */}
                        <div className="border-t border-abyss-border/20 pt-4 mt-4 space-y-2.5">
                            <span className="text-[9px] uppercase tracking-wider text-abyss-gold font-fantasy font-bold block">Accruable Gains</span>
                            <div className="space-y-1.5 text-[10px] font-sans text-abyss-muted">
                                <div className="flex items-center justify-between">
                                    <span className="flex items-center space-x-1">
                                        <GiUpgrade className="text-purple-400" />
                                        <span>Dungeon XP:</span>
                                    </span>
                                    <span className="text-white font-mono font-semibold">+{problem.xpReward} XP</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="flex items-center space-x-1">
                                        <GiCoins className="text-abyss-gold" />
                                        <span>Dungeon Gold:</span>
                                    </span>
                                    <span className="text-white font-mono font-semibold">+{problem.coinReward}</span>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Victory Overlay Modal */}
            <VictoryModal 
                isOpen={victoryOpen}
                rewards={rewards}
                onClose={() => setVictoryOpen(false)}
                onNext={nextProblem ? () => navigate(`/arena/${nextProblem._id}`) : null}
            />

            {/* Achievement Unlock Popup */}
            <AchievementPopup 
                achievements={unlockedAchievements}
                onClose={() => setUnlockedAchievements([])}
            />
        </motion.div>
    );
};

export default CodingArena;
