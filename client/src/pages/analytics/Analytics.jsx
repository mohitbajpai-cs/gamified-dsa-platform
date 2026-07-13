import React, { useState, useEffect, useMemo } from 'react';
import Card from '../../components/ui/Card';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { 
    getUserAnalyticsApi, 
    getActivityAnalyticsApi 
} from '../../services/analytics.api';
import { motion } from 'framer-motion';
import { 
    ResponsiveContainer, 
    LineChart, Line, XAxis, YAxis, Tooltip, 
    BarChart, Bar, 
    PieChart, Pie, Cell, 
    RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar 
} from 'recharts';
import { FaCalendarAlt, FaChartPie, FaChartLine, FaBrain, FaLanguage } from 'react-icons/fa';

const COLORS = ['#10B981', '#3B82F6', '#8B5CF6']; // Green (Easy), Blue (Medium), Purple (Hard)

const Analytics = () => {
    const [analytics, setAnalytics] = useState(null);
    const [activity, setActivity] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [anaRes, actRes] = await Promise.all([
                    getUserAnalyticsApi(),
                    getActivityAnalyticsApi()
                ]);
                if (anaRes.success) setAnalytics(anaRes.data);
                if (actRes.success) setActivity(actRes.data);
            } catch (err) {
                console.error('Failed to load analytics:', err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    // 1. Difficulty distribution pie data
    const pieData = useMemo(() => {
        if (!analytics?.difficultySolved) return [];
        return [
            { name: 'Easy', value: analytics.difficultySolved.easy || 0 },
            { name: 'Medium', value: analytics.difficultySolved.medium || 0 },
            { name: 'Hard', value: analytics.difficultySolved.hard || 0 }
        ].filter(d => d.value > 0);
    }, [analytics]);

    // 2. Heatmap calculations
    const heatmapCells = useMemo(() => {
        // Generate grid cells for last 365 days
        const cells = [];
        const today = new Date();
        const activityMap = new Map(activity.map(a => [a.date, a.count]));

        for (let i = 365; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const count = activityMap.get(dateStr) || 0;
            cells.push({ date: dateStr, count });
        }
        return cells;
    }, [activity]);

    const getHeatmapColorClass = (count) => {
        if (count === 0) return 'bg-white/5 border border-white/5';
        if (count < 2) return 'bg-purple-950/40 border border-purple-500/20 text-purple-200';
        if (count < 4) return 'bg-purple-800/60 border border-purple-500/40 text-purple-100';
        return 'bg-purple-500 border border-purple-400 text-white shadow-glow-primary/25 animate-pulse';
    };

    if (loading) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (!analytics) {
        return (
            <div className="text-center py-12 text-abyss-muted">
                <p>No analytics parameters populated. Try solving trials to log charts data.</p>
            </div>
        );
    }

    const { insights, languageUsage, topicMastery, successRate, totalSubmissions, acceptedSubmissions, guildContribution } = analytics;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
        >
            {/* Header */}
            <div>
                <h1 className="font-fantasy text-3xl font-bold text-white tracking-widest uppercase">Void Command Analytics</h1>
                <p className="font-sans text-xs text-abyss-muted">Examine solver telemetry, chapter mastery status, and personal recommendation charts.</p>
            </div>

            {/* Insights Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="p-5 border-abyss-border/40 space-y-2">
                    <h5 className="text-[10px] uppercase text-abyss-muted font-fantasy tracking-wider">Strongest Spell (Topic)</h5>
                    <p className="text-lg font-fantasy font-bold text-green-400 uppercase truncate">{insights.strongestTopic}</p>
                </Card>
                <Card className="p-5 border-abyss-border/40 space-y-2">
                    <h5 className="text-[10px] uppercase text-abyss-muted font-fantasy tracking-wider">Recommended Practice</h5>
                    <p className="text-lg font-fantasy font-bold text-yellow-400 uppercase truncate">{insights.weakestTopic}</p>
                </Card>
                <Card className="p-5 border-abyss-border/40 space-y-2">
                    <h5 className="text-[10px] uppercase text-abyss-muted font-fantasy tracking-wider">Resonance Streak</h5>
                    <p className="text-lg font-fantasy font-bold text-cyan-400 uppercase">{insights.streak} Days</p>
                </Card>
                <Card className="p-5 border-abyss-border/40 space-y-2">
                    <h5 className="text-[10px] uppercase text-abyss-muted font-fantasy tracking-wider">Precision (Success Rate)</h5>
                    <p className="text-lg font-fantasy font-bold text-purple-400 uppercase">{insights.successRate}</p>
                </Card>
            </div>

            {/* Chart Grid Row 1: XP line chart & Topic Mastery radar */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 1. XP / Progress over time */}
                <Card className="p-6 border-abyss-border/40 space-y-4">
                    <h3 className="font-fantasy text-sm font-bold text-white tracking-widest uppercase flex items-center space-x-2">
                        <FaChartLine className="text-cyan-400" />
                        <span>Resonance XP Progression</span>
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={topicMastery.map((t, idx) => ({ name: t.name.slice(0, 8), XP: t.solved * 250 }))}>
                                <XAxis dataKey="name" stroke="#6B7280" style={{ fontSize: 9 }} />
                                <YAxis stroke="#6B7280" style={{ fontSize: 9 }} />
                                <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151' }} />
                                <Line type="monotone" dataKey="XP" stroke="#3B82F6" strokeWidth={2} dot={{ fill: '#3B82F6', r: 3 }} activeDot={{ r: 5 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* 2. Topic mastery Radar */}
                <Card className="p-6 border-abyss-border/40 space-y-4">
                    <h3 className="font-fantasy text-sm font-bold text-white tracking-widest uppercase flex items-center space-x-2">
                        <FaBrain className="text-purple-400" />
                        <span>Chapter Mastery Radar</span>
                    </h3>
                    <div className="h-64 flex justify-center">
                        {topicMastery.length === 0 ? (
                            <span className="text-xs text-abyss-muted self-center">No mastery parameters logged.</span>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart outerRadius="80%" data={topicMastery}>
                                    <PolarGrid stroke="#374151" />
                                    <PolarAngleAxis dataKey="name" stroke="#9CA3AF" style={{ fontSize: 8 }} />
                                    <PolarRadiusAxis stroke="#374151" style={{ fontSize: 8 }} />
                                    <Radar name="Mastery" dataKey="percentage" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.2} />
                                </RadarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </Card>
            </div>

            {/* Chart Grid Row 2: Solved distribution (Pie) & Language usage (Bar) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 1. Solved Difficulty Pie */}
                <Card className="p-6 border-abyss-border/40 space-y-4">
                    <h3 className="font-fantasy text-sm font-bold text-white tracking-widest uppercase flex items-center space-x-2">
                        <FaChartPie className="text-emerald-400" />
                        <span>Difficulty Distribution</span>
                    </h3>
                    <div className="h-64 flex flex-col sm:flex-row items-center justify-around gap-4">
                        {pieData.length === 0 ? (
                            <span className="text-xs text-abyss-muted self-center">No trial solves logged.</span>
                        ) : (
                            <>
                                <div className="h-full w-full sm:w-1/2">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={pieData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={4}
                                                dataKey="value"
                                            >
                                                {pieData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151' }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="space-y-2 text-xs font-mono">
                                    {pieData.map((d, idx) => (
                                        <div key={d.name} className="flex items-center space-x-2">
                                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx] }}></span>
                                            <span className="text-abyss-muted">{d.name}:</span>
                                            <span className="text-white font-bold">{d.value} Solves</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </Card>

                {/* 2. Language Usage Bar */}
                <Card className="p-6 border-abyss-border/40 space-y-4">
                    <h3 className="font-fantasy text-sm font-bold text-white tracking-widest uppercase flex items-center space-x-2">
                        <FaLanguage className="text-yellow-400" />
                        <span>Familiar Languages</span>
                    </h3>
                    <div className="h-64">
                        {languageUsage.length === 0 ? (
                            <div className="h-full flex items-center justify-center"><span className="text-xs text-abyss-muted">No compilation submits logged.</span></div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={languageUsage}>
                                    <XAxis dataKey="name" stroke="#6B7280" style={{ fontSize: 9 }} />
                                    <YAxis stroke="#6B7280" style={{ fontSize: 9 }} />
                                    <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151' }} />
                                    <Bar dataKey="value" fill="#EAB308" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </Card>
            </div>

            {/* Daily activity calendar Heatmap */}
            <Card className="p-6 border-abyss-border/40 space-y-4">
                <h3 className="font-fantasy text-sm font-bold text-white tracking-widest uppercase flex items-center space-x-2">
                    <FaCalendarAlt className="text-purple-400" />
                    <span>Void Commits Calendar Heatmap</span>
                </h3>
                
                <div className="overflow-x-auto pb-2">
                    <div className="min-w-[700px] flex flex-wrap gap-1">
                        {heatmapCells.map((c, idx) => (
                            <div
                                key={idx}
                                title={`${c.date}: ${c.count} Solves`}
                                className={`w-3.5 h-3.5 rounded transition-all cursor-pointer ${getHeatmapColorClass(c.count)}`}
                            ></div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end space-x-4 text-[10px] text-abyss-muted font-mono pt-2 border-t border-abyss-border/10">
                    <span>Less Commits</span>
                    <div className="flex space-x-1 items-center">
                        <span className="w-2.5 h-2.5 bg-white/5 rounded"></span>
                        <span className="w-2.5 h-2.5 bg-purple-950/40 rounded"></span>
                        <span className="w-2.5 h-2.5 bg-purple-800/60 rounded"></span>
                        <span className="w-2.5 h-2.5 bg-purple-500 rounded"></span>
                    </div>
                    <span>More Commits</span>
                </div>
            </Card>

            {/* Recommendations segment */}
            <Card className="p-5 border-purple-500/20 bg-gradient-to-r from-purple-950/10 via-black to-black space-y-3">
                <h4 className="font-fantasy text-sm font-bold text-white uppercase tracking-wider">Insights & Training Directives</h4>
                <div className="text-xs text-abyss-muted space-y-2 leading-relaxed font-sans">
                    <p>🎯 Recommended next target gateway: <span className="text-abyss-gold font-bold">{insights.nextRealm}</span></p>
                    {insights.weakTopicsToPractice.length > 0 ? (
                        <p>⚠️ Strengthen your algorithms by focusing on: <span className="text-purple-300 font-bold">{insights.weakTopicsToPractice.join(', ')}</span></p>
                    ) : (
                        <p>✨ Exceptional algorithmic balance! Keep practicing daily quests to maintain resonance stability.</p>
                    )}
                </div>
            </Card>
        </motion.div>
    );
};

export default Analytics;
