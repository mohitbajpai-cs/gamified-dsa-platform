const React = require('react');
const { useState, useEffect } = require('react');
const { useParams, useNavigate, Link } = require('react-router-dom');
const Card = require('../../components/ui/Card').default;
const PrimaryButton = require('../../components/ui/PrimaryButton').default;
const SecondaryButton = require('../../components/ui/SecondaryButton').default;
const LoadingSpinner = require('../../components/ui/LoadingSpinner').default;
const toast = require('react-hot-toast').default;
const { 
    getContestByIdApi, 
    startContestApi, 
    getContestLeaderboardApi,
    registerContestApi
} = require('../../services/contest.api');
const { FaClock, FaUsers, FaTrophy, FaCalendarAlt, FaChevronRight } = require('react-icons/fa');

const ContestDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [contest, setContest] = useState(null);
    const [registration, setRegistration] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [timeLeft, setTimeLeft] = useState('');

    const loadDetails = async () => {
        setLoading(true);
        try {
            const [detailsRes, leaderRes] = await Promise.all([
                getContestByIdApi(id),
                getContestLeaderboardApi(id)
            ]);

            if (detailsRes.success && detailsRes.data) {
                setContest(detailsRes.data.contest);
                setRegistration(detailsRes.data.registration);
            }
            if (leaderRes.success) {
                setLeaderboard(leaderRes.data);
            }
        } catch (err) {
            console.error('Failed to sync contest details:', err);
            toast.error('Failed to load contest specs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDetails();
    }, [id]);

    // Timer countdown
    useEffect(() => {
        if (!contest || contest.status !== 'upcoming') return;

        const interval = setInterval(() => {
            const diff = new Date(contest.startTime).getTime() - Date.now();
            if (diff <= 0) {
                setTimeLeft('00:00:00');
                clearInterval(interval);
                loadDetails();
            } else {
                const hrs = Math.floor(diff / (1000 * 60 * 60));
                const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const secs = Math.floor((diff % (1000 * 60)) / 1000);
                setTimeLeft(
                    `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
                );
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [contest]);

    const handleRegister = async () => {
        setActionLoading(true);
        try {
            const res = await registerContestApi(id);
            if (res.success) {
                toast.success('Lobby coordinates registered! Prepare for trials.');
                loadDetails();
            }
        } catch (err) {
            toast.error(err.message || 'Registration failed');
        } finally {
            setActionLoading(false);
        }
    };

    const handleStartSession = async () => {
        setActionLoading(true);
        try {
            const res = await startContestApi(id);
            if (res.success) {
                toast.success('Contest gates opened! Summon algorithms.');
                setRegistration(res.data);
                loadDetails();
            }
        } catch (err) {
            toast.error(err.message || 'Lobby entrance failed');
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (!contest) {
        return (
            <div className="text-center py-12">
                <p className="text-abyss-danger font-fantasy uppercase text-lg">Contest records lost in the void.</p>
                <Link to="/contests" className="text-abyss-gold underline mt-4 inline-block font-fantasy uppercase text-xs">Return to Contests Hub</Link>
            </div>
        );
    }

    const isLive = contest.status === 'live';
    const isCompleted = contest.status === 'completed';
    const isActiveSession = registration && registration.status === 'active';

    return (
        <div className="space-y-8">
            {/* Header Navigation */}
            <div className="flex items-center space-x-2 text-xs font-fantasy uppercase tracking-wider text-abyss-muted">
                <Link to="/contests" className="hover:text-white transition-colors">Contests Hub</Link>
                <FaChevronRight className="text-[10px]" />
                <span className="text-abyss-gold font-bold">{contest.title}</span>
            </div>

            {/* Contest Info Hero Card */}
            <Card className={`p-6 bg-gradient-to-b from-abyss-card via-black to-black border-2 ${isLive ? 'border-red-500/40 shadow-glow-danger/10' : 'border-abyss-border/40'} rounded-2xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6`}>
                <div className="space-y-3 max-w-xl">
                    <div className="flex items-center space-x-2">
                        <span className={`text-[8px] uppercase tracking-widest px-2 py-0.5 rounded font-bold font-fantasy ${isLive ? 'text-red-500 bg-red-500/10 border border-red-500/30' : isCompleted ? 'text-abyss-muted bg-black/40 border border-abyss-border/40' : 'text-abyss-gold bg-abyss-gold/10 border border-abyss-gold/30'}`}>
                            {contest.status.toUpperCase()}
                        </span>
                        <span className="text-[9px] uppercase tracking-widest text-abyss-gold border border-abyss-gold/20 px-2 py-0.5 rounded font-fantasy bg-abyss-gold/5">
                            {contest.type}
                        </span>
                    </div>
                    
                    <h2 className="font-fantasy text-2xl font-bold text-white uppercase tracking-wider">{contest.title}</h2>
                    <p className="text-xs text-abyss-muted leading-relaxed">{contest.description}</p>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono text-abyss-muted pt-2 border-t border-abyss-border/10">
                        <div className="flex items-center space-x-1.5"><FaClock className="text-abyss-gold" /> <span>{contest.duration} Mins</span></div>
                        <div className="flex items-center space-x-1.5"><FaUsers className="text-cyan-400" /> <span>{leaderboard.length} Joined</span></div>
                        <div className="flex items-center space-x-1.5"><FaTrophy className="text-yellow-500" /> <span>{contest.problems?.length || 0} Tasks</span></div>
                        <div className="flex items-center space-x-1.5"><FaCalendarAlt className="text-purple-400" /> <span>{new Date(contest.startTime).toLocaleDateString()}</span></div>
                    </div>
                </div>

                {/* Registration Control Panel */}
                <div className="w-full md:w-64 bg-black/40 border border-abyss-border/20 p-5 rounded-xl text-center space-y-4">
                    {isCompleted ? (
                        <div className="space-y-1">
                            <span className="text-[10px] uppercase tracking-widest text-abyss-muted block font-fantasy">Championship Concluded</span>
                            <p className="text-white text-xs font-fantasy uppercase font-bold text-yellow-500">Loot Disbursed</p>
                        </div>
                    ) : isLive ? (
                        isActiveSession ? (
                            <div className="space-y-2">
                                <span className="text-[9px] uppercase tracking-widest text-red-400 block font-bold font-fantasy">YOUR SESSION IS RUNNING</span>
                                <div className="text-white font-mono text-base font-bold">Time Penalty: {registration.penalty}</div>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <span className="text-[9px] uppercase tracking-widest text-abyss-muted block font-fantasy">Gates are now OPEN</span>
                                <PrimaryButton onClick={handleStartSession} disabled={actionLoading} className="w-full bg-gradient-to-r from-red-600 to-red-800 border-red-500/40 py-2.5">
                                    {actionLoading ? 'Summoning...' : 'Start trials'}
                                </PrimaryButton>
                            </div>
                        )
                    ) : (
                        <div className="space-y-3">
                            <span className="text-[9px] uppercase tracking-widest text-abyss-muted block font-fantasy">Gates Open In</span>
                            <div className="text-white font-mono text-xl font-bold tracking-wider text-abyss-gold">{timeLeft || 'CALCULATING...'}</div>
                            {registration ? (
                                <button disabled className="w-full text-center py-2 bg-green-500/10 border border-green-500/20 text-green-400 font-fantasy text-xs uppercase tracking-wider rounded-xl">
                                    Registered ✔
                                </button>
                            ) : (
                                <PrimaryButton onClick={handleRegister} disabled={actionLoading} className="w-full py-2.5">
                                    {actionLoading ? 'Registering...' : 'Register for contest'}
                                </PrimaryButton>
                            )}
                        </div>
                    )}
                </div>
            </Card>

            {/* Problems List or Leaderboard */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Problems Panel (Only shown if user has active session or contest is completed) */}
                <div className="lg:col-span-2 space-y-4">
                    {isActiveSession ? (
                        <div className="space-y-4">
                            <h3 className="font-fantasy text-lg font-bold text-white tracking-wider uppercase">Championship Tasks</h3>
                            <div className="grid grid-cols-1 gap-3">
                                {contest.problems?.map((p, idx) => (
                                    <Card key={p._id} className="p-4 border-abyss-border/20 hover:border-abyss-gold/20 transition-all flex justify-between items-center bg-black/40">
                                        <div className="space-y-1">
                                            <span className="text-[9px] font-mono text-abyss-gold uppercase">TASK #{idx + 1}</span>
                                            <h4 className="font-fantasy text-sm font-bold text-white uppercase tracking-wider">{p.title}</h4>
                                            <span className="text-[9px] uppercase tracking-wider font-fantasy text-abyss-muted">{p.difficulty}</span>
                                        </div>
                                        <PrimaryButton onClick={() => navigate(`/contests/${id}/arena/${p._id}`)} className="py-1 px-4 text-[10px]">
                                            Solve
                                        </PrimaryButton>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    ) : isCompleted ? (
                        <div className="space-y-4">
                            <h3 className="font-fantasy text-lg font-bold text-white tracking-wider uppercase">Conquered Tasks</h3>
                            <div className="grid grid-cols-1 gap-3">
                                {contest.problems?.map((p, idx) => (
                                    <Card key={p._id} className="p-4 border-abyss-border/10 bg-black/60 flex justify-between items-center text-xs">
                                        <div className="space-y-1">
                                            <span className="text-[9px] font-mono text-abyss-muted">TASK #{idx + 1}</span>
                                            <h4 className="font-fantasy font-bold text-white uppercase tracking-wider">{p.title}</h4>
                                        </div>
                                        <span className="text-[10px] uppercase font-fantasy text-abyss-muted">{p.difficulty}</span>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <Card className="border-dashed border-abyss-border/40 p-8 text-center bg-black/20">
                            <p className="font-fantasy text-xs text-abyss-gold uppercase tracking-wider">Tasks Locked</p>
                            <span className="font-sans text-[10px] text-abyss-muted">Task logs will be revealed when your contest session starts.</span>
                        </Card>
                    )}
                </div>

                {/* Leaderboard Panel */}
                <div className="space-y-4">
                    <h3 className="font-fantasy text-lg font-bold text-white tracking-wider uppercase">Lobby Rankings</h3>
                    <Card className="p-4 border-abyss-border/30 bg-black/40 space-y-4">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-[11px] font-sans">
                                <thead>
                                    <tr className="border-b border-abyss-border/20 text-abyss-gold font-fantasy uppercase tracking-wider">
                                        <th className="pb-2">Rank</th>
                                        <th className="pb-2">Solver</th>
                                        <th className="pb-2 text-center">Solved</th>
                                        <th className="pb-2 text-right">Penalty</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-abyss-border/10 text-abyss-muted font-mono">
                                    {leaderboard.map((row, idx) => (
                                        <tr key={row._id} className="hover:bg-white/2">
                                            <td className="py-2 text-white font-bold">#{idx + 1}</td>
                                            <td className="py-2 text-white font-medium font-sans truncate max-w-[80px]">{row.user?.username}</td>
                                            <td className="py-2 text-center text-cyan-400">{row.solvedCount}</td>
                                            <td className="py-2 text-right text-yellow-500">{row.penalty}</td>
                                        </tr>
                                    ))}
                                    {leaderboard.length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="py-4 text-center text-abyss-muted italic">No active contenders registered.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>

            </div>
        </div>
    );
};

module.exports = { default: ContestDetails };
