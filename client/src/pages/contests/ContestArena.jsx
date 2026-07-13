const React = require('react');
const { useState, useEffect, useRef } = require('react');
const { useParams, useNavigate, Link } = require('react-router-dom');
const Card = require('../../components/ui/Card').default;
const PrimaryButton = require('../../components/ui/PrimaryButton').default;
const SecondaryButton = require('../../components/ui/SecondaryButton').default;
const LoadingSpinner = require('../../components/ui/LoadingSpinner').default;
const toast = require('react-hot-toast').default;
const { getProblemByIdApi } = require('../../services/world.api');
const { getContestByIdApi, submitContestSolutionApi } = require('../../services/contest.api');
const VictoryModal = require('../../components/shared/VictoryModal').default;
const Editor = require('@monaco-editor/react').default;
const { FaClock, FaChevronRight, FaTerminal, FaPlay, FaCheck } = require('react-icons/fa');

const ContestArena = () => {
    const { contestId, problemId } = useParams();
    const navigate = useNavigate();

    const [problem, setProblem] = useState(null);
    const [contest, setContest] = useState(null);
    const [registration, setRegistration] = useState(null);
    const [loading, setLoading] = useState(true);

    const [code, setCode] = useState('');
    const [language, setLanguage] = useState('javascript');
    const [theme, setTheme] = useState('vs-dark');

    // Executions states
    const [executing, setExecuting] = useState(false);
    const [verdict, setVerdict] = useState(null);
    const [verdictDetails, setVerdictDetails] = useState(null);
    const [victoryOpen, setVictoryOpen] = useState(false);
    const [rewards, setRewards] = useState({});

    const [timeLeftStr, setTimeLeftStr] = useState('');

    const loadArena = async () => {
        setLoading(true);
        try {
            const [probRes, contestRes] = await Promise.all([
                getProblemByIdApi(problemId),
                getContestByIdApi(contestId)
            ]);

            if (probRes.success && probRes.data) {
                setProblem(probRes.data);
                setCode(probRes.data.starterCode || 'function solve(input) {\n    return input;\n}');
            }
            if (contestRes.success && contestRes.data) {
                setContest(contestRes.data.contest);
                setRegistration(contestRes.data.registration);
            }
        } catch (err) {
            console.error('Failed to sync contest arena:', err);
            toast.error('Failed to load contest arena');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadArena();
    }, [contestId, problemId]);

    // Timer countdown for active session remaining time
    useEffect(() => {
        if (!registration || registration.status !== 'active') return;

        const interval = setInterval(() => {
            const end = new Date(registration.endTime).getTime();
            const diff = end - Date.now();
            if (diff <= 0) {
                setTimeLeftStr('Session Concluded');
                clearInterval(interval);
                toast.error('Contest session expired');
                navigate(`/contests/${contestId}`);
            } else {
                const mins = Math.floor(diff / (1000 * 60));
                const secs = Math.floor((diff % (1000 * 60)) / 1000);
                setTimeLeftStr(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [registration]);

    const handleExecute = async () => {
        setExecuting(true);
        setVerdict('running');
        setVerdictDetails(null);

        try {
            const res = await submitContestSolutionApi({
                contestId,
                problemId,
                code,
                language
            });

            if (res.success && res.data) {
                const data = res.data;
                setVerdict(data.verdict);
                setVerdictDetails({
                    testCasesPassed: data.testCasesPassed || 0,
                    totalTestCases: data.totalTestCases || 3,
                    errorMessage: data.verdict !== 'accepted' ? 'Spell execution failed evaluation check.' : ''
                });

                if (data.verdict === 'accepted') {
                    toast.success('Dungeon solved! Metric scores updated.');
                    setRewards({
                        xpGained: contest.rewards?.xp || 200,
                        coinsGained: contest.rewards?.coins || 50,
                        isFirstSolve: true
                    });
                    setVictoryOpen(true);
                }
            }
        } catch (err) {
            setVerdict('runtime_error');
            setVerdictDetails({
                errorMessage: err.message || 'Verification endpoint returned exception.'
            });
        } finally {
            setExecuting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (!problem) {
        return (
            <div className="text-center py-12">
                <p className="text-abyss-danger font-fantasy uppercase text-lg">Arena coordinates lost in the void.</p>
                <Link to={`/contests/${contestId}`} className="text-abyss-gold underline mt-4 inline-block font-fantasy uppercase text-xs">Return to Contest Details</Link>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full space-y-6">
            
            {/* Header info */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-abyss-border/20 pb-4">
                <div className="flex items-center space-x-2 text-xs font-fantasy uppercase tracking-wider text-abyss-muted">
                    <Link to="/contests" className="hover:text-white transition-colors">Contests Hub</Link>
                    <FaChevronRight className="text-[10px]" />
                    <Link to={`/contests/${contestId}`} className="hover:text-white transition-colors">{contest?.title}</Link>
                    <FaChevronRight className="text-[10px]" />
                    <span className="text-abyss-gold font-bold">{problem.title}</span>
                </div>

                {/* Session countdown timer */}
                <div className="flex items-center space-x-2 bg-red-950/20 border border-red-500/30 px-4 py-1.5 rounded-xl font-mono text-sm text-red-400 font-bold shadow-glow-danger/10">
                    <FaClock className="text-xs animate-pulse" />
                    <span>SESSION TIME: {timeLeftStr}</span>
                </div>
            </div>

            {/* Split Workspace Layout */}
            <div className="flex flex-col lg:flex-row gap-6 flex-grow">
                
                {/* 1. LEFT PANE (35%): Problem Info */}
                <div className="w-full lg:w-[35%] flex flex-col space-y-4">
                    <Card className="flex-1 overflow-y-auto max-h-[75vh] border-abyss-border/40 p-5 space-y-5">
                        <div className="space-y-1">
                            <span className="text-[9px] uppercase tracking-wider text-abyss-gold border border-abyss-gold/20 px-2 py-0.5 rounded font-fantasy bg-abyss-gold/5">{problem.difficulty}</span>
                            <h2 className="font-fantasy text-xl font-bold text-white uppercase tracking-wider">{problem.title}</h2>
                        </div>
                        <div className="h-[1px] bg-abyss-border/10"></div>
                        <div className="space-y-3">
                            <h4 className="font-fantasy text-xs text-abyss-gold uppercase tracking-widest border-b border-abyss-border/10 pb-1">Dungeon Statement</h4>
                            <div className="font-sans text-xs text-abyss-muted leading-relaxed space-y-2" dangerouslySetInnerHTML={{ __html: problem.description }} />
                        </div>
                    </Card>
                </div>

                {/* 2. CENTER PANE (45%): Editor */}
                <div className="w-full lg:w-[45%] flex flex-col space-y-4">
                    <Card className="flex-1 flex flex-col p-4 border-abyss-border bg-black/60 rounded-2xl relative min-h-[50vh]">
                        {/* Editor Config bar */}
                        <div className="flex justify-between items-center pb-3 border-b border-abyss-border/20 mb-3 text-xs">
                            <select value={language} onChange={(e) => setLanguage(e.target.value)} className="bg-black border border-abyss-border/40 text-xs px-3 py-1 rounded-xl text-white">
                                <option value="javascript">JavaScript</option>
                                <option value="python">Python</option>
                                <option value="java">Java</option>
                                <option value="cpp">C++</option>
                                <option value="c">C</option>
                            </select>
                            <span className="text-[9px] uppercase tracking-wider text-abyss-muted font-mono font-bold">Monaco Sandbox</span>
                        </div>

                        <div className="flex-1 rounded-xl overflow-hidden border border-abyss-border/30">
                            <Editor
                                height="45vh"
                                language={language}
                                theme={theme}
                                value={code}
                                onChange={(val) => setCode(val || '')}
                                options={{
                                    fontSize: 12,
                                    minimap: { enabled: false },
                                    automaticLayout: true,
                                    fontFamily: 'Fira Code, monospace'
                                }}
                            />
                        </div>

                        <div className="pt-4 border-t border-abyss-border/20 mt-4 flex justify-between items-center">
                            <button disabled className="text-[10px] text-abyss-muted italic">Auto Save Active</button>
                            <PrimaryButton onClick={handleExecute} disabled={executing} className="flex items-center space-x-1.5 px-6 py-2 shadow-glow-primary/20">
                                <FaPlay className="text-[9px]" />
                                <span>{executing ? 'Casting Spell...' : 'Cast Spell (Submit)'}</span>
                            </PrimaryButton>
                        </div>
                    </Card>
                </div>

                {/* 3. RIGHT PANE (20%): Console Output */}
                <div className="w-full lg:w-[20%] flex flex-col space-y-4">
                    <Card className="flex-1 p-5 border-abyss-border bg-black/40 flex flex-col space-y-4">
                        <h4 className="font-fantasy text-xs text-abyss-gold tracking-widest uppercase flex items-center space-x-1.5">
                            <FaTerminal className="text-xs" />
                            <span>Evaluation Console</span>
                        </h4>

                        <div className="flex-1 bg-black/60 border border-abyss-border/30 rounded-xl p-4 font-mono text-[10px] space-y-3 overflow-y-auto">
                            {verdict === 'running' ? (
                                <div className="flex flex-col items-center justify-center space-y-2 py-8">
                                    <LoadingSpinner size="sm" />
                                    <span className="text-abyss-muted animate-pulse">Running compilation checks...</span>
                                </div>
                            ) : verdict ? (
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center pb-2 border-b border-abyss-border/10">
                                        <span className="text-abyss-muted uppercase text-[9px] tracking-wider">Result Status</span>
                                        <span className={`font-fantasy uppercase font-bold text-[10px] ${verdict === 'accepted' ? 'text-green-400' : 'text-red-400'}`}>
                                            {verdict === 'accepted' ? 'ACCEPTED' : verdict.toUpperCase()}
                                        </span>
                                    </div>
                                    {verdictDetails && (
                                        <>
                                            <div className="flex justify-between">
                                                <span className="text-abyss-muted uppercase text-[9px]">Test Cases</span>
                                                <span className="text-white font-bold">{verdictDetails.testCasesPassed} / {verdictDetails.totalTestCases}</span>
                                            </div>
                                            {verdictDetails.errorMessage && (
                                                <div className="text-red-400 border border-red-500/20 bg-red-500/5 p-2 rounded leading-relaxed break-all">
                                                    {verdictDetails.errorMessage}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-abyss-muted italic">
                                    Ready to compile. Submit code to run validation tests.
                                </div>
                            )}
                        </div>
                    </Card>
                </div>

            </div>

            {/* Victory overlay */}
            <VictoryModal
                isOpen={victoryOpen}
                rewards={rewards}
                onClose={() => { setVictoryOpen(false); navigate(`/contests/${contestId}`); }}
                onNext={() => navigate(`/contests/${contestId}`)}
            />

        </div>
    );
};

module.exports = { default: ContestArena };
