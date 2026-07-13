import React, { useState, useEffect } from 'react';
import Card from '../ui/Card';
import { getFriendsApi, sendFriendRequestApi } from '../../services/social.api';
import { FaUserFriends, FaPlus } from 'react-icons/fa';
import toast from 'react-hot-toast';

const FriendActivityCard = () => {
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(true);
    const [targetUser, setTargetUser] = useState('');
    const [sending, setSending] = useState(false);

    const loadFriends = async () => {
        try {
            const res = await getFriendsApi();
            if (res.success && res.data) {
                setFriends(res.data.slice(0, 3));
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadFriends();
    }, []);

    const handleAddFriend = async (e) => {
        e.preventDefault();
        if (!targetUser.trim()) return;
        setSending(true);
        try {
            const res = await sendFriendRequestApi(targetUser.trim());
            if (res.success) {
                toast.success('Resonance lock request sent!');
                setTargetUser('');
            }
        } catch (err) {
            toast.error(err.message || 'Resonance request failed');
        } finally {
            setSending(false);
        }
    };

    return (
        <Card className="p-5 border-abyss-border/40 space-y-4">
            <h3 className="font-fantasy text-sm font-bold text-white tracking-widest uppercase flex items-center space-x-2">
                <FaUserFriends className="text-cyan-400" />
                <span>Synchronized Factions</span>
            </h3>

            {/* Quick send request */}
            <form onSubmit={handleAddFriend} className="flex gap-2">
                <input
                    type="text"
                    required
                    value={targetUser}
                    onChange={(e) => setTargetUser(e.target.value)}
                    placeholder="Enter contender name..."
                    className="flex-grow bg-black/45 border border-abyss-border/40 rounded-lg px-3 py-1.5 text-[10px] text-white focus:outline-none focus:border-cyan-500/40 placeholder-abyss-muted"
                />
                <button 
                    type="submit" 
                    disabled={sending} 
                    className="px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-lg text-[10px] font-fantasy uppercase tracking-wider cursor-pointer"
                >
                    Link
                </button>
            </form>

            {loading ? (
                <div className="h-16 flex items-center justify-center"><span className="text-[10px] text-abyss-muted animate-pulse">Searching faction lines...</span></div>
            ) : (
                <div className="space-y-2">
                    {friends.map(f => (
                        <div key={f._id} className="flex justify-between items-center text-xs bg-black/20 p-2 rounded-lg border border-abyss-border/5">
                            <span className="font-sans text-white font-medium">{f.username}</span>
                            <span className="text-[10px] text-cyan-400 font-fantasy">Tier {f.level}</span>
                        </div>
                    ))}
                    {friends.length === 0 && (
                        <p className="text-[10px] text-abyss-muted italic text-center py-2">No contender links currently mapped.</p>
                    )}
                </div>
            )}
        </Card>
    );
};

export default FriendActivityCard;
