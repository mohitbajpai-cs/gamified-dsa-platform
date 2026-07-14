import React from 'react';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/ui/Card';
import { motion } from 'framer-motion';
import {
    GiGears, GiShield, GiScrollUnfurled, GiPortal,
    GiEgyptianWalk, GiCastle
} from 'react-icons/gi';
import { FaBell, FaLock, FaUserAlt, FaCalendarAlt } from 'react-icons/fa';

const SettingsSection = ({ icon: Icon, title, children }) => (
    <Card className="space-y-4">
        <div className="flex items-center space-x-3 border-b border-abyss-border/20 pb-3">
            <div className="p-2 rounded-lg bg-abyss-primary/10 border border-abyss-primary/20">
                <Icon className="text-abyss-gold text-base" />
            </div>
            <h3 className="font-fantasy text-sm font-bold text-abyss-gold uppercase tracking-widest">
                {title}
            </h3>
        </div>
        {children}
    </Card>
);

const FieldRow = ({ label, value, badge }) => (
    <div className="flex items-center justify-between py-2.5 border-b border-abyss-border/10 last:border-0">
        <span className="text-[11px] font-sans uppercase tracking-wider text-abyss-muted">{label}</span>
        <div className="flex items-center space-x-2">
            {badge && (
                <span className="text-[9px] font-fantasy uppercase tracking-widest px-2 py-0.5 rounded border border-abyss-gold/40 text-abyss-gold bg-abyss-gold/5">
                    {badge}
                </span>
            )}
            <span className="text-xs font-mono text-white">{value}</span>
        </div>
    </div>
);

const Settings = () => {
    const { user } = useAuth();

    const joinedDate = user?.createdAt
        ? new Date(user.createdAt).toLocaleDateString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric'
        })
        : 'Unknown';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 80, damping: 15 }}
            className="space-y-8"
        >
            {/* Page Header */}
            <div>
                <h1 className="font-fantasy text-3xl font-bold text-white tracking-widest uppercase">
                    Settings
                </h1>
                <p className="font-sans text-xs text-abyss-muted mt-1">
                    Manage your account preferences, security, and notification controls.
                </p>
            </div>

            {/* Account Details */}
            <SettingsSection icon={GiEgyptianWalk} title="Account Identity">
                <FieldRow label="Username" value={user?.username || '—'} />
                <FieldRow label="Email" value={user?.email || '—'} />
                <FieldRow
                    label="Role"
                    value={user?.role || 'member'}
                    badge={user?.role === 'admin' ? 'Admin' : null}
                />
                <FieldRow label="Member Since" value={joinedDate} />
                <FieldRow label="Current Title" value={user?.currentTitle || 'Beginner Knight'} />
                <FieldRow label="Rank" value={user?.rank || 'Novice'} />

                <div className="pt-2">
                    <p className="text-[10px] font-sans text-abyss-muted/60 italic">
                        Account details are managed by the system. Contact an admin to update your profile information.
                    </p>
                </div>
            </SettingsSection>

            {/* Security */}
            <SettingsSection icon={FaLock} title="Security Protocol">
                <div className="space-y-3">
                    <div className="flex items-center justify-between bg-black/30 border border-abyss-border/20 rounded-lg px-4 py-3">
                        <div>
                            <p className="text-xs font-sans text-white">Password</p>
                            <p className="text-[10px] text-abyss-muted font-mono tracking-wider">••••••••••••</p>
                        </div>
                        <div className="flex items-center space-x-1.5 text-abyss-muted">
                            <GiShield className="text-sm text-green-400" />
                            <span className="text-[10px] font-fantasy uppercase tracking-widest text-green-400">Protected</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between bg-black/30 border border-abyss-border/20 rounded-lg px-4 py-3">
                        <div>
                            <p className="text-xs font-sans text-white">Session Tokens</p>
                            <p className="text-[10px] text-abyss-muted">HTTP-only cookie authentication</p>
                        </div>
                        <div className="flex items-center space-x-1.5">
                            <GiShield className="text-sm text-cyan-400" />
                            <span className="text-[10px] font-fantasy uppercase tracking-widest text-cyan-400">Active</span>
                        </div>
                    </div>

                    <p className="text-[10px] font-sans text-abyss-muted/60 italic pt-1">
                        Password changes require verification. Use the exit protocol to terminate your active session.
                    </p>
                </div>
            </SettingsSection>

            {/* Notifications */}
            <SettingsSection icon={FaBell} title="Notification Runes">
                <div className="space-y-3">
                    {[
                        { label: 'Contest Alerts', desc: 'Notify when a new contest begins', state: 'Enabled' },
                        { label: 'Achievement Unlocks', desc: 'Notify on badge and title grants', state: 'Enabled' },
                        { label: 'Guild Activity', desc: 'Notify when guild members post', state: 'Enabled' },
                        { label: 'Daily Streak Reminder', desc: 'Remind to maintain daily streak', state: 'Enabled' },
                    ].map(({ label, desc, state }) => (
                        <div
                            key={label}
                            className="flex items-center justify-between bg-black/30 border border-abyss-border/20 rounded-lg px-4 py-3"
                        >
                            <div>
                                <p className="text-xs font-sans text-white">{label}</p>
                                <p className="text-[10px] text-abyss-muted">{desc}</p>
                            </div>
                            <span className="text-[9px] font-fantasy uppercase tracking-widest px-2 py-0.5 rounded border border-purple-500/40 text-purple-400 bg-purple-500/5">
                                {state}
                            </span>
                        </div>
                    ))}
                    <p className="text-[10px] font-sans text-abyss-muted/60 italic pt-1">
                        Notification preferences are managed globally. Per-channel tuning coming in a future update.
                    </p>
                </div>
            </SettingsSection>

            {/* Danger Zone */}
            <SettingsSection icon={GiPortal} title="Danger Zone">
                <div className="space-y-3">
                    <div className="flex items-start justify-between bg-abyss-danger/5 border border-abyss-danger/20 rounded-lg px-4 py-3">
                        <div>
                            <p className="text-xs font-sans text-abyss-danger font-semibold">Delete Account</p>
                            <p className="text-[10px] text-abyss-muted mt-0.5">
                                Permanently erase all character data, progress, and history from the Abyss.
                            </p>
                        </div>
                        <span className="text-[9px] font-fantasy uppercase tracking-widest px-2 py-0.5 rounded border border-abyss-danger/40 text-abyss-danger/70 bg-abyss-danger/5 whitespace-nowrap ml-4 mt-1">
                            Irreversible
                        </span>
                    </div>
                    <p className="text-[10px] font-sans text-abyss-muted/60 italic">
                        Destructive operations require admin authorization. Contact support to proceed.
                    </p>
                </div>
            </SettingsSection>
        </motion.div>
    );
};

export default Settings;
