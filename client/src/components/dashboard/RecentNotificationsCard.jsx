import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '../ui/Card';
import { getNotificationsApi } from '../../services/social.api';
import { FaBell } from 'react-icons/fa';

const RecentNotificationsCard = () => {
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecent = async () => {
            try {
                const res = await getNotificationsApi();
                if (res.success && res.data) {
                    setList(res.data.slice(0, 3));
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchRecent();
    }, []);

    return (
        <Card className="p-5 border-abyss-border/40 space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="font-fantasy text-sm font-bold text-white tracking-widest uppercase flex items-center space-x-2">
                    <FaBell className="text-purple-400" />
                    <span>Recent Resonance Alerts</span>
                </h3>
                <Link to="/notifications" className="text-[10px] font-fantasy uppercase text-abyss-gold hover:underline">Log</Link>
            </div>

            {loading ? (
                <div className="h-20 flex items-center justify-center"><span className="text-[10px] text-abyss-muted animate-pulse">Syncing logs...</span></div>
            ) : (
                <div className="space-y-2.5">
                    {list.map(n => (
                        <div key={n._id} className="text-xs border-b border-abyss-border/5 pb-2 last:border-b-0">
                            <div className="flex justify-between items-center">
                                <span className={`font-fantasy uppercase text-[10px] font-bold ${n.isRead ? 'text-white/60' : 'text-purple-400'}`}>{n.title}</span>
                                <span className="text-[8px] font-mono text-abyss-muted">{new Date(n.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-[11px] text-abyss-muted truncate mt-0.5">{n.message}</p>
                        </div>
                    ))}
                    {list.length === 0 && (
                        <p className="text-[11px] text-abyss-muted italic text-center py-4">No active resonance alerts logged.</p>
                    )}
                </div>
            )}
        </Card>
    );
};

export default RecentNotificationsCard;
