import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import PrimaryButton from '../../components/ui/PrimaryButton';
import SecondaryButton from '../../components/ui/SecondaryButton';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import { 
    getGuildMeApi, 
    createGuildApi, 
    joinGuildApi, 
    leaveGuildApi, 
    exileGuildMemberApi, 
    transferGuildOwnershipApi,
    getGuildLeaderboardApi
} from '../../services/social.api';
import { motion } from 'framer-motion';
import { GiTrophy, GiScrollUnfurled } from 'react-icons/gi';
import { FaUsers, FaCrown, FaDoorOpen, FaPlus } from 'react-icons/fa';

const Guild = () => {
    const [guild, setGuild] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    // Form inputs
    const [createForm, setCreateForm] = useState({ name: '', description: '', banner: 'banner-default' });
    const [joinCode, setJoinCode] = useState('');

    const loadGuildData = async () => {
        setLoading(true);
        try {
            const [meRes, leadRes] = await Promise.all([
                getGuildMeApi(),
                getGuildLeaderboardApi()
            ]);
            if (meRes.success) setGuild(meRes.data);
            if (leadRes.success) setLeaderboard(leadRes.data);
        } catch (err) {
            console.error('Failed to load guild data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadGuildData();
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            const res = await createGuildApi(createForm);
            if (res.success) {
                toast.success('Alliance banner raised successfully!');
                loadGuildData();
            }
        } catch (err) {
            toast.error(err.message || 'Alliance creation failed');
        } finally {
            setActionLoading(false);
        }
    };

    const handleJoin = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            const res = await joinGuildApi(joinCode);
            if (res.success) {
                toast.success('Joined guild alliance!');
                loadGuildData();
            }
        } catch (err) {
            toast.error(err.message || 'Alliance join failed');
        } finally {
            setActionLoading(false);
        }
    };

    const handleLeave = async () => {
        if (!confirm('Leave this alliance? Your loyalty points will clear.')) return;
        setActionLoading(true);
        try {
            const res = await leaveGuildApi();
            if (res.success) {
                toast.success('Deserted alliance logs');
                setGuild(null);
                loadGuildData();
            }
        } catch (err) {
            toast.error(err.message || 'Desertion failed');
        } finally {
            setActionLoading(false);
        }
    };

    const handleExile = async (memberId) => {
        if (!confirm('Exile this member from alliance scrolls?')) return;
        setActionLoading(true);
        try {
            const res = await exileGuildMemberApi(memberId);
            if (res.success) {
                toast.success('Member exiled');
                loadGuildData();
            }
        } catch (err) {
            toast.error(err.message || 'Exile failed');
        } finally {
            setActionLoading(false);
        }
    };

    const handleTransfer = async (memberId) => {
        if (!confirm('Transfer master ownership of this alliance? This is irreversible.')) return;
        setActionLoading(true);
        try {
            const res = await transferGuildOwnershipApi(memberId);
            if (res.success) {
                toast.success('Alliance mastery transferred');
                loadGuildData();
            }
        } catch (err) {
            toast.error(err.message || 'Transfer failed');
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

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
        >
            {/* Header */}
            <div>
                <h1 className="font-fantasy text-3xl font-bold text-white tracking-widest uppercase">Guild Alliances</h1>
                <p className="font-sans text-xs text-abyss-muted">Conspire with friendly factions, level up your banner, and top the alliance charts.</p>
            </div>

            {guild ? (
                /* IN A GUILD VIEW */
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Details card */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card className="p-6 border-abyss-gold/20 bg-gradient-to-b from-abyss-card via-black to-black space-y-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-abyss-gold/5 rounded-full blur-xl pointer-events-none"></div>
                            
                            <div className="text-center space-y-2">
                                <div className="w-16 h-16 mx-auto rounded-full bg-abyss-gold/10 border border-abyss-gold/30 flex items-center justify-center text-abyss-gold text-3xl shadow-glow-gold/10">
                                    ⚔
                                </div>
                                <h2 className="font-fantasy text-xl font-bold text-white uppercase tracking-widest">{guild.name}</h2>
                                <p className="text-xs text-abyss-muted leading-relaxed italic">"{guild.description}"</p>
                            </div>

                            <div className="pt-4 border-t border-abyss-border/15 space-y-3 font-mono text-xs text-abyss-muted">
                                <div className="flex justify-between">
                                    <span>Alliance Level</span>
                                    <span className="text-white font-bold">Tier {guild.level}</span>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex justify-between text-[10px]">
                                        <span>Alliance XP</span>
                                        <span>{guild.xp} / {guild.level * 1000}</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-black rounded-full overflow-hidden border border-abyss-border/10">
                                        <div className="h-full bg-abyss-gold" style={{ width: `${(guild.xp / (guild.level * 1000)) * 100}%` }}></div>
                                    </div>
                                </div>
                                <div className="flex justify-between pt-2 border-t border-abyss-border/10">
                                    <span>Invite Code</span>
                                    <span className="text-abyss-gold font-bold tracking-widest select-all">{guild.inviteCode}</span>
                                </div>
                            </div>

                            <div className="pt-4">
                                <button 
                                    onClick={handleLeave} 
                                    disabled={actionLoading} 
                                    className="w-full py-2 border border-red-500/20 hover:border-red-500/40 text-red-400 bg-red-500/5 hover:bg-red-500/10 font-fantasy text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center space-x-1 cursor-pointer"
                                >
                                    <FaDoorOpen />
                                    <span>Desert Alliance</span>
                                </button>
                            </div>
                        </Card>
                    </div>

                    {/* Member List Grid */}
                    <div className="lg:col-span-2 space-y-4">
                        <h3 className="font-fantasy text-lg font-bold text-white tracking-wider uppercase flex items-center space-x-2">
                            <FaUsers />
                            <span>Contenders Roster ({guild.members?.length})</span>
                        </h3>

                        <Card className="p-4 border-abyss-border/30 bg-black/40">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs font-sans">
                                    <thead>
                                        <tr className="border-b border-abyss-border/20 text-abyss-gold font-fantasy uppercase tracking-wider font-bold">
                                            <th className="pb-2">Contender</th>
                                            <th className="pb-2">Level</th>
                                            <th className="pb-2">Bounty Score</th>
                                            <th className="pb-2">Alliance Role</th>
                                            <th className="pb-2 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-abyss-border/10 text-abyss-muted font-mono">
                                        {guild.members?.map((member) => {
                                            const isOwner = String(guild.owner?._id) === String(member._id);
                                            return (
                                                <tr key={member._id} className="hover:bg-white/2">
                                                    <td className="py-3 text-white font-medium font-sans flex items-center space-x-2">
                                                        <span>{member.username}</span>
                                                    </td>
                                                    <td className="py-3 text-cyan-400">Lvl {member.level}</td>
                                                    <td className="py-3 text-yellow-400">{member.xp} XP</td>
                                                    <td className="py-3">
                                                        {isOwner ? (
                                                            <span className="flex items-center space-x-1 text-abyss-gold text-[10px] font-fantasy uppercase tracking-wider border border-abyss-gold/20 bg-abyss-gold/5 px-2 py-0.5 rounded">
                                                                <FaCrown />
                                                                <span>Guild Master</span>
                                                            </span>
                                                        ) : (
                                                            <span className="text-abyss-muted text-[10px] font-fantasy uppercase tracking-wider">Member</span>
                                                        )}
                                                    </td>
                                                    <td className="py-3 text-right space-x-2 font-fantasy uppercase text-[9px] tracking-wider z-10">
                                                        {/* Owner actions */}
                                                        {String(guild.owner?._id) === String(guild.members.find(m => m.username === member.username)?._id) ? null : (
                                                            String(guild.owner?._id) === String(member._id) ? null : (
                                                                <>
                                                                    <button onClick={() => handleTransfer(member._id)} className="px-2 py-1 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-300 border border-yellow-500/20 rounded cursor-pointer">Transfer Master</button>
                                                                    <button onClick={() => handleExile(member._id)} className="px-2 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded cursor-pointer">Exile</button>
                                                                </>
                                                            )
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </div>
                </div>
            ) : (
                /* JOIN/CREATE GUILD VIEW */
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Left: Forms */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* Join Guild Card */}
                        <Card className="p-5 border-abyss-border/40 space-y-4 bg-gradient-to-r from-abyss-card via-black to-black">
                            <h3 className="font-fantasy text-base font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                                <GiScrollUnfurled />
                                <span>Join an Alliance Faction</span>
                            </h3>
                            <form onSubmit={handleJoin} className="flex gap-4">
                                <input
                                    type="text"
                                    required
                                    value={joinCode}
                                    onChange={(e) => setJoinCode(e.target.value)}
                                    placeholder="Enter 6-character alliance invite code..."
                                    className="flex-grow bg-black/45 border border-abyss-border/40 rounded-xl px-4 py-2 text-xs text-white uppercase tracking-widest placeholder-abyss-muted focus:outline-none focus:border-abyss-gold/40"
                                />
                                <PrimaryButton type="submit" disabled={actionLoading} className="px-6 py-2 text-xs">
                                    Align
                                </PrimaryButton>
                            </form>
                        </Card>

                        {/* Create Guild Card */}
                        <Card className="p-5 border-abyss-border/40 space-y-4">
                            <h3 className="font-fantasy text-base font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                                <FaPlus />
                                <span>Found a New Alliance Faction</span>
                            </h3>
                            <form onSubmit={handleCreate} className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase font-fantasy tracking-wider text-abyss-muted">Alliance Name</label>
                                    <input 
                                        type="text" 
                                        required 
                                        value={createForm.name} 
                                        onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} 
                                        placeholder="Enter name of your alliance..."
                                        className="w-full bg-black/45 border border-abyss-border/40 rounded-xl px-4 py-2 text-xs text-white placeholder-abyss-muted focus:outline-none focus:border-abyss-gold/40" 
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase font-fantasy tracking-wider text-abyss-muted">Lore & Motto Description</label>
                                    <textarea 
                                        required 
                                        value={createForm.description} 
                                        onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })} 
                                        placeholder="Record the manifesto of your alliance faction..."
                                        className="w-full bg-black/45 border border-abyss-border/40 rounded-xl px-4 py-2 text-xs text-white placeholder-abyss-muted h-24 focus:outline-none focus:border-abyss-gold/40" 
                                    />
                                </div>
                                <PrimaryButton type="submit" disabled={actionLoading} className="w-full py-2.5 shadow-glow-primary/10">
                                    {actionLoading ? 'Forging Banner...' : 'Raise Alliance Banner'}
                                </PrimaryButton>
                            </form>
                        </Card>

                    </div>

                    {/* Right: Leaderboard */}
                    <div className="lg:col-span-1 space-y-4">
                        <h3 className="font-fantasy text-lg font-bold text-white tracking-wider uppercase flex items-center space-x-2">
                            <GiTrophy />
                            <span>Top Factions</span>
                        </h3>

                        <Card className="p-4 border-abyss-border/30 bg-black/40">
                            <div className="space-y-3">
                                {leaderboard.map((g, idx) => (
                                    <div key={g._id} className="flex justify-between items-center text-xs border-b border-abyss-border/5 pb-2 last:border-b-0">
                                        <div className="space-y-0.5">
                                            <h5 className="font-fantasy font-bold text-white uppercase tracking-wider">
                                                <span className="text-abyss-muted mr-1.5">#{idx + 1}</span>
                                                {g.name}
                                            </h5>
                                            <span className="text-[10px] text-abyss-muted font-mono">Master: {g.owner?.username}</span>
                                        </div>
                                        <span className="font-fantasy text-[10px] text-abyss-gold uppercase">Tier {g.level}</span>
                                    </div>
                                ))}
                                {leaderboard.length === 0 && (
                                    <p className="text-xs text-abyss-muted italic text-center py-4">No alliance records discovered inside scrolls.</p>
                                )}
                            </div>
                        </Card>
                    </div>

                </div>
            )}
        </motion.div>
    );
};

export default Guild;
