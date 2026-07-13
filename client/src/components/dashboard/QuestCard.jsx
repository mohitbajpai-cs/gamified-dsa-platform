import React, { useState, useEffect } from 'react';
import { getDailyQuestsApi, getWeeklyQuestsApi, claimQuestApi } from '../../services/quest.api';
import { useAuth } from '../../context/AuthContext';
import Card from '../ui/Card';
import PrimaryButton from '../ui/PrimaryButton';
import RealmProgress from '../worlds/RealmProgress';
import { GiScrollUnfurled, GiCheckMark } from 'react-icons/gi';

const QuestCard = () => {
    const { refreshUser } = useAuth();
    const [dailyQuests, setDailyQuests] = useState([]);
    const [weeklyQuests, setWeeklyQuests] = useState([]);
    const [tab, setTab] = useState('daily');
    const [loading, setLoading] = useState(true);

    const fetchQuests = async () => {
        try {
            const [dailyRes, weeklyRes] = await Promise.all([
                getDailyQuestsApi(),
                getWeeklyQuestsApi()
            ]);
            if (dailyRes.success && dailyRes.data) {
                setDailyQuests(dailyRes.data);
            }
            if (weeklyRes.success && weeklyRes.data) {
                setWeeklyQuests(weeklyRes.data);
            }
        } catch (err) {
            console.error('Failed to load quests:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuests();
    }, []);

    const handleClaim = async (questId) => {
        try {
            const res = await claimQuestApi(questId);
            if (res.success) {
                // Refresh local quest list
                await fetchQuests();
                // Refresh global user credentials in Navbar/Sidebar
                if (refreshUser) await refreshUser();
            }
        } catch (err) {
            console.error('Failed to claim quest reward:', err);
        }
    };

    const activeList = tab === 'daily' ? dailyQuests : weeklyQuests;

    return (
        <Card className="relative overflow-hidden border-abyss-primary/20 flex flex-col justify-between h-full bg-black/60 backdrop-blur-md p-6">
            <div className="absolute right-6 top-6 text-abyss-muted text-xl opacity-20 pointer-events-none">
                <GiScrollUnfurled />
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-abyss-border/20">
                    <h4 className="font-fantasy text-xs text-abyss-gold tracking-widest uppercase">Quest Codex</h4>
                    
                    {/* Tab Toggles */}
                    <div className="flex space-x-1 bg-black/40 border border-abyss-border/40 p-0.5 rounded-lg text-[9px] uppercase font-fantasy">
                        <button
                            onClick={() => setTab('daily')}
                            className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${tab === 'daily' ? 'bg-abyss-gold/15 text-abyss-gold font-bold' : 'text-abyss-muted hover:text-white'}`}
                        >
                            Daily
                        </button>
                        <button
                            onClick={() => setTab('weekly')}
                            className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${tab === 'weekly' ? 'bg-abyss-gold/15 text-abyss-gold font-bold' : 'text-abyss-muted hover:text-white'}`}
                        >
                            Weekly
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="py-8 text-center text-xs text-abyss-muted font-fantasy animate-pulse">Consulting Quest Codex...</div>
                ) : (
                    <div className="space-y-4 max-h-[220px] overflow-y-auto pr-1">
                        {activeList.map(q => {
                            const isCompleted = q.completed;
                            const isClaimed = q.claimed;
                            
                            return (
                                <div key={q._id} className="bg-black/35 border border-abyss-border/30 rounded-xl p-3.5 space-y-2 relative group hover:border-abyss-border transition-colors">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h5 className="font-fantasy text-xs font-bold text-white uppercase tracking-wider group-hover:text-abyss-gold transition-colors">
                                                {q.title}
                                            </h5>
                                            <p className="text-[10px] text-abyss-muted leading-tight mt-0.5">{q.description}</p>
                                        </div>
                                        {isClaimed && (
                                            <span className="text-[8px] font-fantasy uppercase text-green-400 bg-green-500/10 border border-green-500/25 px-1.5 py-0.5 rounded">
                                                Claimed
                                            </span>
                                        )}
                                    </div>

                                    {/* Progress meter */}
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-[8px] font-mono text-abyss-muted uppercase tracking-wider">
                                            <span>Progress</span>
                                            <span>{q.currentValue} / {q.targetValue}</span>
                                        </div>
                                        <RealmProgress completed={q.currentValue} total={q.targetValue} />
                                    </div>

                                    {/* Rewards & claim CTA */}
                                    <div className="flex justify-between items-center text-[9px] pt-1">
                                        <div className="flex space-x-2 font-mono text-abyss-muted">
                                            <span className="text-purple-400">+{q.xpReward} XP</span>
                                            <span className="text-abyss-gold">+{q.coinReward} G</span>
                                        </div>

                                        {isCompleted && !isClaimed && (
                                            <button
                                                onClick={() => handleClaim(q._id)}
                                                className="bg-abyss-gold hover:bg-yellow-600 text-black font-fantasy text-[9px] uppercase tracking-widest px-2.5 py-1 rounded transition-colors font-bold cursor-pointer"
                                            >
                                                Claim Reward
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                        {activeList.length === 0 && (
                            <div className="text-center py-6 text-[10px] text-abyss-muted uppercase font-fantasy">No active quests found.</div>
                        )}
                    </div>
                )}
            </div>
        </Card>
    );
};

export default QuestCard;
