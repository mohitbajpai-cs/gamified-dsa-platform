import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import PrimaryButton from '../../components/ui/PrimaryButton';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { getWorldsApi, getTopicsByWorldApi, getProblemsByTopicApi } from '../../services/world.api';
import { motion } from 'framer-motion';
import { GiTrophy, GiScrollUnfurled } from 'react-icons/gi';
import { FaClock, FaChevronRight } from 'react-icons/fa';

const Trials = () => {
    const navigate = useNavigate();
    const [worlds, setWorlds] = useState([]);
    const [selectedWorldId, setSelectedWorldId] = useState('');
    const [topics, setTopics] = useState([]);
    const [problemsMap, setProblemsMap] = useState({});
    const [loading, setLoading] = useState(true);
    const [detailLoading, setDetailLoading] = useState(false);

    useEffect(() => {
        const loadWorlds = async () => {
            try {
                const res = await getWorldsApi();
                if (res.success && res.data) {
                    setWorlds(res.data);
                    if (res.data.length > 0) {
                        setSelectedWorldId(res.data[0]._id);
                    }
                }
            } catch (err) {
                console.error('Failed to load worlds:', err);
            } finally {
                setLoading(false);
            }
        };
        loadWorlds();
    }, []);

    useEffect(() => {
        if (!selectedWorldId) return;

        const loadWorldDetails = async () => {
            setDetailLoading(true);
            try {
                const topicsRes = await getTopicsByWorldApi(selectedWorldId);
                if (topicsRes.success && topicsRes.data) {
                    setTopics(topicsRes.data);
                    
                    // Fetch problems for each topic in parallel
                    const probPromises = topicsRes.data.map(t => getProblemsByTopicApi(t._id));
                    const probResults = await Promise.all(probPromises);
                    
                    const newMap = {};
                    topicsRes.data.forEach((t, index) => {
                        const res = probResults[index];
                        if (res.success) {
                            newMap[t._id] = res.data;
                        }
                    });
                    setProblemsMap(newMap);
                }
            } catch (err) {
                console.error('Failed to load topic trials:', err);
            } finally {
                setDetailLoading(false);
            }
        };
        loadWorldDetails();
    }, [selectedWorldId]);

    const getDifficultyColor = (diff) => {
        const colors = {
            easy: 'text-green-400',
            medium: 'text-blue-400',
            hard: 'text-purple-400'
        };
        return colors[diff] || 'text-white';
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
        >
            {/* Header */}
            <div>
                <h1 className="font-fantasy text-3xl font-bold text-white tracking-widest uppercase">Practice Trials</h1>
                <p className="font-sans text-xs text-abyss-muted">Browse and practice algorithmic tasks directly across all unlocked realms.</p>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <LoadingSpinner size="lg" />
                </div>
            ) : (
                <div className="space-y-6">
                    {/* World Selector Tabs */}
                    <div className="flex flex-wrap gap-2 pb-2 border-b border-abyss-border/10">
                        {worlds.map(w => (
                            <button
                                key={w._id}
                                onClick={() => setSelectedWorldId(w._id)}
                                className={`px-4 py-2 rounded-xl font-fantasy text-xs uppercase tracking-wider transition-all cursor-pointer ${selectedWorldId === w._id ? 'bg-abyss-gold/15 border border-abyss-gold text-abyss-gold shadow-glow-gold/10' : 'bg-black/40 text-abyss-muted border border-transparent hover:text-white'}`}
                            >
                                {w.name}
                            </button>
                        ))}
                    </div>

                    {/* Content Section */}
                    {detailLoading ? (
                        <div className="flex justify-center py-12">
                            <LoadingSpinner size="md" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {topics.map(t => (
                                <Card key={t._id} className="p-5 border-abyss-border/30 bg-black/40 space-y-4">
                                    <div className="space-y-1">
                                        <h3 className="font-fantasy text-base font-bold text-white uppercase tracking-wider">{t.name}</h3>
                                        <p className="text-[11px] text-abyss-muted line-clamp-2 leading-relaxed">{t.description}</p>
                                    </div>

                                    <div className="h-[1px] bg-abyss-border/15"></div>

                                    {/* Problems inside this topic */}
                                    <div className="space-y-2.5">
                                        {problemsMap[t._id]?.map(p => (
                                            <div 
                                                key={p._id} 
                                                onClick={() => navigate(`/problem/${p._id}`)}
                                                className="group p-3 border border-abyss-border/10 rounded-xl bg-black/50 hover:border-abyss-gold/20 hover:bg-white/1 transition-all flex justify-between items-center cursor-pointer"
                                            >
                                                <div className="space-y-0.5 min-w-0">
                                                    <h4 className="text-xs font-fantasy font-medium text-white uppercase group-hover:text-abyss-gold transition-colors truncate">{p.title}</h4>
                                                    <span className={`text-[9px] uppercase tracking-wider font-fantasy font-bold ${getDifficultyColor(p.difficulty)}`}>{p.difficulty}</span>
                                                </div>
                                                <div className="flex items-center space-x-2 text-[10px] text-abyss-muted">
                                                    <span className="font-mono">+{p.xpReward} XP</span>
                                                    <FaChevronRight className="text-[9px] text-abyss-muted/40 group-hover:text-abyss-gold group-hover:translate-x-0.5 transition-all" />
                                                </div>
                                            </div>
                                        ))}
                                        {(!problemsMap[t._id] || problemsMap[t._id].length === 0) && (
                                            <p className="text-[11px] text-abyss-muted italic">No active trials mapped inside this topic coordinates.</p>
                                        )}
                                    </div>
                                </Card>
                            ))}
                            {topics.length === 0 && (
                                <p className="text-xs text-abyss-muted italic">No topic gates unlocked inside this realm.</p>
                            )}
                        </div>
                    )}
                </div>
            )}
        </motion.div>
    );
};

export default Trials;
