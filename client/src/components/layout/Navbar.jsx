import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../constants/routes';
import { getUnreadNotificationsCountApi } from '../../services/social.api';
import CoinCounter from '../ui/CoinCounter';
import LevelBadge from '../ui/LevelBadge';
import RankBadge from '../ui/RankBadge';
import { FaBars, FaBell, FaSignOutAlt, FaChevronDown, FaUser, FaCog } from 'react-icons/fa';
import { GiEgyptianWalk } from 'react-icons/gi';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = ({ toggleSidebar }) => {
    const { user, logout } = useAuth();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (!user) return;
        const fetchCount = async () => {
            try {
                const res = await getUnreadNotificationsCountApi();
                if (res.success && res.data) {
                    setUnreadCount(res.data.count);
                }
            } catch (err) {}
        };
        fetchCount();
        const interval = setInterval(fetchCount, 15000); // refresh every 15s
        return () => clearInterval(interval);
    }, [user]);

    const getBreadcrumb = () => {
        const path = window.location.pathname;
        if (path === ROUTES.COMMAND_CENTER) return 'Command Center';
        if (path === ROUTES.DASHBOARD || path === ROUTES.WORLDS) return 'Realms Map';
        if (path.includes('/realms/')) return 'Dungeon Arena';
        if (path === ROUTES.LEADERBOARD) return 'Leaderboard';
        if (path === ROUTES.ACHIEVEMENTS) return 'Achievements';
        if (path === ROUTES.QUESTS) return 'Quests';
        if (path === ROUTES.TRIALS) return 'Trials';
        if (path === ROUTES.GUILD) return 'Guild';
        if (path === ROUTES.NOTIFICATIONS) return 'Notifications';
        if (path === ROUTES.ANALYTICS) return 'Analytics';
        if (path === ROUTES.PROFILE) return 'Character Profile';
        return 'Valthor';
    };

    return (
        <header className="bg-abyss-card border-b border-abyss-border/40 h-16 px-6 flex items-center justify-between sticky top-0 z-30">
            {/* Left Section (Hamburger & Breadcrumb) */}
            <div className="flex items-center space-x-4">
                <button
                    onClick={toggleSidebar}
                    className="text-abyss-muted hover:text-white lg:hidden text-lg transition-colors focus:outline-none"
                >
                    <FaBars />
                </button>
                <div className="hidden sm:block">
                    <span className="font-fantasy text-xs uppercase tracking-widest text-abyss-muted">Sector / </span>
                    <span className="font-fantasy text-xs uppercase tracking-widest text-abyss-gold font-bold">
                        {getBreadcrumb()}
                    </span>
                </div>
            </div>

            {/* Right Section (Currency stats and Profile) */}
            {user && (
                <div className="flex items-center space-x-6">
                    {/* Coin counter summary */}
                    <CoinCounter coins={user.coins || 0} className="text-sm font-semibold" />

                    {/* Notifications Link */}
                    <Link to={ROUTES.NOTIFICATIONS} className="relative text-abyss-muted hover:text-white transition-colors cursor-pointer">
                        <FaBell className="text-lg" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-abyss-danger rounded-full text-white text-[8px] font-bold flex items-center justify-center animate-pulse shadow-glow-danger">
                                {unreadCount}
                            </span>
                        )}
                    </Link>

                    {/* Character Dropdown Trigger */}
                    <div className="relative">
                        <button 
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className="flex items-center space-x-3 hover:opacity-90 transition-opacity focus:outline-none cursor-pointer"
                        >
                            {/* Avatar Shield */}
                            <div className="w-8 h-8 rounded bg-gradient-to-tr from-abyss-primary to-purple-500 border border-abyss-gold/20 flex items-center justify-center">
                                <GiEgyptianWalk className="text-white text-base" />
                            </div>

                            <div className="text-left hidden xs:block">
                                <p className="font-fantasy text-xs font-bold text-white uppercase tracking-wider leading-none">
                                    {user.username}
                                </p>
                                <span className="text-[9px] font-mono text-purple-400 uppercase tracking-widest">
                                    {user.role}
                                </span>
                            </div>
                            <FaChevronDown className={`text-[10px] text-abyss-muted transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                            {dropdownOpen && (
                                <>
                                    {/* Backdrop overlay to close dropdown */}
                                    <div 
                                        onClick={() => setDropdownOpen(false)}
                                        className="fixed inset-0 z-40"
                                    ></div>

                                    {/* The Dropdown Menu */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute right-0 mt-2.5 w-56 bg-abyss-card border border-abyss-border rounded-xl shadow-glow-primary/20 z-50 p-4 space-y-3"
                                    >
                                        <div className="border-b border-abyss-border/30 pb-3 text-center">
                                            <p className="font-fantasy text-sm font-bold text-white uppercase tracking-wider">
                                                {user.username}
                                            </p>
                                            <span className="text-[9px] font-mono text-purple-400 uppercase tracking-widest block mb-2">
                                                {user.currentTitle || 'Void Walker'}
                                            </span>
                                            <div className="flex justify-center items-center space-x-2">
                                                <LevelBadge level={user.level || 1} size="sm" />
                                                <RankBadge rank={user.rank || 'Novice'} />
                                            </div>
                                        </div>

                                        <div className="space-y-1 text-xs font-fantasy uppercase tracking-wider">
                                            <Link 
                                                to={ROUTES.PROFILE}
                                                onClick={() => setDropdownOpen(false)}
                                                className="flex items-center space-x-3 px-3 py-2 rounded-lg text-abyss-muted hover:text-white hover:bg-abyss-hover/30 transition-colors"
                                            >
                                                <FaUser className="text-abyss-gold" />
                                                <span>Profile Shell</span>
                                            </Link>

                                            <Link 
                                                to={ROUTES.PROFILE} 
                                                onClick={() => setDropdownOpen(false)}
                                                className="flex items-center space-x-3 px-3 py-2 rounded-lg text-abyss-muted hover:text-white hover:bg-abyss-hover/30 transition-colors"
                                            >
                                                <FaCog className="text-abyss-gold" />
                                                <span>Settings</span>
                                            </Link>
                                        </div>

                                        <div className="border-t border-abyss-border/30 pt-2">
                                            <button
                                                onClick={() => {
                                                    setDropdownOpen(false);
                                                    logout();
                                                }}
                                                className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-fantasy uppercase tracking-wider text-abyss-danger hover:bg-abyss-danger/10 transition-colors cursor-pointer"
                                            >
                                                <FaSignOutAlt />
                                                <span>Exit Protocol</span>
                                            </button>
                                        </div>
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Navbar;
