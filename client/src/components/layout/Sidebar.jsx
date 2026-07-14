import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../constants/routes';
import { motion } from 'framer-motion';
import { 
    GiCastle, GiTrophy, GiScrollUnfurled, GiAchievement, 
    GiGears, GiPortal, GiEgyptianWalk, GiShield 
} from 'react-icons/gi';
import { FaBell } from 'react-icons/fa';

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const { logout, user } = useAuth();

    const navLinks = [
        { name: 'Realms', path: ROUTES.WORLDS, icon: GiCastle },
        { name: 'Trials', path: ROUTES.TRIALS, icon: GiTrophy },
        { name: 'Quests', path: ROUTES.QUESTS, icon: GiScrollUnfurled },
        { name: 'Rankings', path: ROUTES.LEADERBOARD, icon: GiTrophy },
        { name: 'Codex', path: ROUTES.COMMAND_CENTER, icon: GiGears },
        { name: 'Achievements', path: ROUTES.ACHIEVEMENTS, icon: GiAchievement },
        { name: 'Guild', path: ROUTES.GUILD, icon: GiShield },
        { name: 'Profile', path: ROUTES.PROFILE, icon: GiEgyptianWalk },
        { name: 'Settings', path: ROUTES.SETTINGS, icon: GiGears },
        { name: 'Admin Gates', path: ROUTES.ADMIN, icon: GiCastle, adminOnly: true }
    ];

    return (
        <>
            {/* Backdrop for Mobile */}
            {isOpen && (
                <div 
                    onClick={toggleSidebar} 
                    className="fixed inset-0 bg-black/60 z-30 lg:hidden"
                ></div>
            )}

            <aside className={`
                fixed top-0 bottom-0 left-0 w-64 bg-abyss-card border-r border-abyss-border/40 z-40
                transform lg:transform-none lg:static transition-transform duration-300 ease-in-out
                flex flex-col justify-between p-6
                ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div>
                    {/* Brand Banner */}
                    <div className="flex items-center space-x-2.5 mb-8 border-b border-abyss-border/20 pb-4">
                        <GiCastle className="text-abyss-gold text-3xl filter drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]" />
                        <span className="font-fantasy text-base font-bold text-abyss-gold tracking-widest uppercase">
                            Valthor
                        </span>
                    </div>

                    {/* Navigation Items */}
                    <nav className="space-y-1">
                        {navLinks.map((link) => {
                            if (link.adminOnly && user?.role !== 'admin') return null;
                            const isAnchor = link.path.startsWith('#');
                            const Component = isAnchor ? 'a' : NavLink;
                            const pathProps = isAnchor ? { href: link.path } : { to: link.path };

                            return (
                                <Component
                                    key={link.name}
                                    {...pathProps}
                                    end={!isAnchor}
                                    onClick={() => { if (toggleSidebar) toggleSidebar(); }}
                                    className={isAnchor 
                                        ? 'flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-fantasy uppercase tracking-wider transition-all duration-200 block text-abyss-muted hover:text-white hover:bg-abyss-hover/40'
                                        : ({ isActive }) => `
                                            flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-fantasy uppercase tracking-wider transition-all duration-200 block
                                            ${isActive 
                                                ? 'bg-abyss-primary/20 text-abyss-gold border border-abyss-gold/20 shadow-glow-primary' 
                                                : 'text-abyss-muted hover:text-white hover:bg-abyss-hover/40'
                                            }
                                        `
                                    }
                                >
                                    <motion.div whileHover={{ x: 4 }} className="flex items-center space-x-3 w-full">
                                        <link.icon className="text-lg" />
                                        <span>{link.name}</span>
                                    </motion.div>
                                </Component>
                            );
                        })}
                    </nav>
                </div>

                {/* Milestone Widget */}
                <div className="bg-white/[0.02] border border-white/10 rounded-xl p-4 mx-1 my-4 space-y-2.5 shadow-[0_4px_20px_rgba(0,0,0,0.4)] text-[10px] font-mono uppercase tracking-wider">
                    <div className="flex items-center space-x-2">
                        <GiCastle className="text-purple-400 text-sm" />
                        <span className="text-[8px] font-fantasy text-purple-400 tracking-widest uppercase">Next Milestone</span>
                    </div>
                    <h5 className="font-fantasy text-[10px] font-bold text-white tracking-wide leading-tight uppercase">
                        Reach Level 30 to unlock Grandmaster Rank
                    </h5>
                    <div className="space-y-1.5 pt-1">
                        <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden p-0.5 border border-white/5">
                            <div 
                                className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full transition-all duration-500" 
                                style={{ width: `${Math.min(100, Math.round(((user?.level || 24) / 30) * 100))}%` }}
                            />
                        </div>
                        <div className="flex justify-between text-[8px] text-abyss-muted">
                            <span>Progress</span>
                            <span className="text-white font-bold">{user?.level || 24} / 30</span>
                        </div>
                    </div>
                </div>

                {/* Footer Controls */}
                <div className="space-y-2 border-t border-abyss-border/20 pt-4">
                    <button
                        onClick={() => {
                            logout();
                            if (toggleSidebar) toggleSidebar();
                        }}
                        className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-xs font-fantasy uppercase tracking-wider text-abyss-danger hover:bg-abyss-danger/10 transition-all"
                    >
                        <GiPortal className="text-base rotate-180" />
                        <span>Exit Protocol</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
