import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import PrimaryButton from '../../components/ui/PrimaryButton';
import SecondaryButton from '../../components/ui/SecondaryButton';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import { 
    getNotificationsApi, 
    markNotificationReadApi, 
    markAllNotificationsReadApi, 
    deleteNotificationApi,
    acceptFriendRequestApi,
    rejectFriendRequestApi
} from '../../services/social.api';
import { motion } from 'framer-motion';
import { GiScrollUnfurled, GiCheckMark } from 'react-icons/gi';
import { FaTrash, FaCheck, FaTimes, FaBell } from 'react-icons/fa';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    // Simple client-side pagination
    const [page, setPage] = useState(1);
    const itemsPerPage = 8;

    const loadNotifications = async () => {
        setLoading(true);
        try {
            const res = await getNotificationsApi();
            if (res.success && res.data) {
                setNotifications(res.data);
            }
        } catch (err) {
            console.error('Failed to load notifications:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadNotifications();
    }, []);

    const handleMarkRead = async (id) => {
        try {
            const res = await markNotificationReadApi(id);
            if (res.success) {
                setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleMarkAllRead = async () => {
        setActionLoading(true);
        try {
            const res = await markAllNotificationsReadApi();
            if (res.success) {
                setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                toast.success('All notifications marked read');
            }
        } catch (err) {
            toast.error('Failed to update notifications');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        try {
            const res = await deleteNotificationApi(id);
            if (res.success) {
                setNotifications(prev => prev.filter(n => n._id !== id));
                toast.success('Notification cleared');
            }
        } catch (err) {
            toast.error('Deletion failed');
        }
    };

    const handleAcceptFriend = async (friendshipId, notificationId) => {
        setActionLoading(true);
        try {
            const res = await acceptFriendRequestApi(friendshipId);
            if (res.success) {
                toast.success('Resonance lock established! You are now friends.');
                await markNotificationReadApi(notificationId);
                loadNotifications();
            }
        } catch (err) {
            toast.error(err.message || 'Action failed');
        } finally {
            setActionLoading(false);
        }
    };

    const handleRejectFriend = async (friendshipId, notificationId) => {
        setActionLoading(true);
        try {
            const res = await rejectFriendRequestApi(friendshipId);
            if (res.success) {
                toast.success('Resonance request rejected');
                await markNotificationReadApi(notificationId);
                loadNotifications();
            }
        } catch (err) {
            toast.error(err.message || 'Action failed');
        } finally {
            setActionLoading(false);
        }
    };

    // Pagination slice
    const totalPages = Math.ceil(notifications.length / itemsPerPage);
    const paginatedItems = notifications.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
        >
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="font-fantasy text-3xl font-bold text-white tracking-widest uppercase">Notification Center</h1>
                    <p className="font-sans text-xs text-abyss-muted">Monitor character card upgrades, arena status syncs, and friend alignment resonance alerts.</p>
                </div>
                
                {notifications.some(n => !n.isRead) && (
                    <SecondaryButton onClick={handleMarkAllRead} disabled={actionLoading} className="py-2 text-xs">
                        Mark all read
                    </SecondaryButton>
                )}
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <LoadingSpinner size="lg" />
                </div>
            ) : (
                <div className="space-y-6 max-w-4xl">
                    <div className="space-y-3">
                        {paginatedItems.map(n => {
                            const friendshipId = n.data?.friendshipId;
                            return (
                                <Card 
                                    key={n._id} 
                                    onClick={() => !n.isRead && handleMarkRead(n._id)}
                                    className={`p-4 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 cursor-pointer relative overflow-hidden border ${n.isRead ? 'border-abyss-border/20 bg-black/40' : 'border-purple-500/35 bg-gradient-to-r from-purple-950/10 via-black to-black shadow-glow-primary/5'}`}
                                >
                                    <div className="flex items-start space-x-3.5 z-10">
                                        <div className={`p-2 rounded-lg border ${n.isRead ? 'border-abyss-border/20 text-abyss-muted' : 'border-purple-500/40 text-purple-400 bg-purple-500/5'}`}>
                                            <FaBell />
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center space-x-2">
                                                <h4 className={`font-fantasy text-sm font-bold uppercase tracking-wider ${n.isRead ? 'text-white/70' : 'text-white'}`}>{n.title}</h4>
                                                {!n.isRead && <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse"></span>}
                                            </div>
                                            <p className="text-xs text-abyss-muted leading-relaxed">{n.message}</p>
                                            <span className="text-[9px] font-mono text-abyss-muted block pt-1">{new Date(n.createdAt).toLocaleString()}</span>
                                        </div>
                                    </div>

                                    {/* Action buttons */}
                                    <div className="flex items-center space-x-2 z-10 w-full sm:w-auto justify-end">
                                        {n.type === 'friend_request' && !n.isRead && friendshipId && (
                                            <div className="flex space-x-2 mr-2">
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); handleAcceptFriend(friendshipId, n._id); }} 
                                                    disabled={actionLoading}
                                                    className="px-3 py-1 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg text-[10px] font-fantasy uppercase tracking-wider cursor-pointer"
                                                >
                                                    Accept
                                                </button>
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); handleRejectFriend(friendshipId, n._id); }} 
                                                    disabled={actionLoading}
                                                    className="px-3 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-[10px] font-fantasy uppercase tracking-wider cursor-pointer"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        )}
                                        
                                        <button 
                                            onClick={(e) => handleDelete(n._id, e)} 
                                            className="p-2 bg-red-500/5 hover:bg-red-500/15 text-red-400 border border-red-500/20 rounded-lg transition-all cursor-pointer"
                                        >
                                            <FaTrash size={11} />
                                        </button>
                                    </div>
                                </Card>
                            );
                        })}

                        {notifications.length === 0 && (
                            <Card className="flex flex-col items-center justify-center py-12 text-center border-dashed border-abyss-border/30">
                                <FaBell className="text-abyss-muted text-4xl mb-3" />
                                <p className="font-fantasy text-xs text-abyss-gold uppercase tracking-wider">No resonance alerts mapped</p>
                                <span className="text-[10px] text-abyss-muted">You are fully synchronized. Alerts will appear here when generated.</span>
                            </Card>
                        )}
                    </div>

                    {/* Pagination Buttons */}
                    {totalPages > 1 && (
                        <div className="flex justify-center space-x-2 pt-4">
                            <SecondaryButton 
                                onClick={() => setPage(prev => Math.max(prev - 1, 1))} 
                                disabled={page === 1}
                                className="py-1 px-4 text-[10px]"
                            >
                                Prev
                            </SecondaryButton>
                            <span className="font-mono text-xs text-abyss-muted flex items-center px-2">Page {page} of {totalPages}</span>
                            <SecondaryButton 
                                onClick={() => setPage(prev => Math.min(prev + 1, totalPages))} 
                                disabled={page === totalPages}
                                className="py-1 px-4 text-[10px]"
                            >
                                Next
                            </SecondaryButton>
                        </div>
                    )}
                </div>
            )}
        </motion.div>
    );
};

export default Notifications;
