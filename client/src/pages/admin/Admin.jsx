import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import PrimaryButton from '../../components/ui/PrimaryButton';
import SecondaryButton from '../../components/ui/SecondaryButton';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import { ROUTES } from '../../constants/routes';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    GiSpellBook, GiGothicCross, GiGlobe, GiUpgrade, GiCoins, GiBrain, 
    GiTrophy, GiSwordsPower, GiScrollUnfurled, GiOpenChest, GiFlame 
} from 'react-icons/gi';
import { 
    FaUsers, FaSkull, FaCalendarCheck, FaSearch, FaTrash, FaEdit, 
    FaPlus, FaTimes, FaGlobe, FaBook, FaCheckCircle, FaImage, FaCog 
} from 'react-icons/fa';

// APIs
import { 
    getAdminStatsApi, 
    getAdminAnalyticsApi, 
    getAdminUsersApi, 
    updateUserRoleApi, 
    resetUserXpApi, 
    resetUserCoinsApi, 
    resetUserProgressApi, 
    deleteUserApi, 
    getAdminQuestsApi, 
    createAdminQuestApi, 
    updateAdminQuestApi, 
    deleteAdminQuestApi, 
    getAdminAchievementsApi, 
    createAdminAchievementApi, 
    updateAdminAchievementApi, 
    deleteAdminAchievementApi, 
    getAdminBossesApi, 
    createAdminBossApi, 
    updateAdminBossApi, 
    deleteAdminBossApi 
} from '../../services/adminCustom.api';

import { 
    adminGetWorldsApi, 
    adminCreateWorldApi, 
    adminUpdateWorldApi, 
    adminDeleteWorldApi, 
    adminGetTopicsApi, 
    adminCreateTopicApi, 
    adminUpdateTopicApi, 
    adminDeleteTopicApi, 
    adminGetProblemsApi, 
    adminCreateProblemApi, 
    adminUpdateProblemApi, 
    adminDeleteProblemApi, 
    adminSeedDatabaseApi 
} from '../../services/admin.api';

import { 
    getContestsApi, 
    adminCreateContestApi, 
    adminUpdateContestApi, 
    adminDeleteContestApi 
} from '../../services/contest.api';

const Admin = () => {
    const { user, refreshProgress } = useAuth();
    
    // Redirect non-staff roles
    if (user?.role !== 'admin' && user?.role !== 'moderator') {
        return <Navigate to={ROUTES.DASHBOARD} replace />;
    }

    const isAdmin = user?.role === 'admin';

    // Tabs state
    const [activeTab, setActiveTab] = useState('dashboard');

    // Data lists
    const [stats, setStats] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [usersList, setUsersList] = useState([]);
    const [usersTotal, setUsersTotal] = useState(0);
    const [usersPage, setUsersPage] = useState(1);
    const [usersSearch, setUsersSearch] = useState('');
    const [usersRoleFilter, setUsersRoleFilter] = useState('');
    
    const [worlds, setWorlds] = useState([]);
    const [topics, setTopics] = useState([]);
    const [problems, setProblems] = useState([]);
    const [bosses, setBosses] = useState([]);
    const [quests, setQuests] = useState([]);
    const [achievements, setAchievements] = useState([]);
    const [contests, setContests] = useState([]);

    // Loading states
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [seeding, setSeeding] = useState(false);
    const [fullReset, setFullReset] = useState(false);

    // Modal forms states
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
    const [modalTarget, setModalTarget] = useState(null); // The row being edited
    const [formData, setFormData] = useState({});

    // Media Manager state
    const [previewUrl, setPreviewUrl] = useState('');
    const [previewType, setPreviewType] = useState('realm'); // 'realm', 'boss', 'achievement'

    // Load initial tab data
    useEffect(() => {
        loadTabData();
    }, [activeTab, usersPage, usersSearch, usersRoleFilter]);

    const loadTabData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'dashboard') {
                const [statsRes, analyticsRes] = await Promise.all([
                    getAdminStatsApi(),
                    getAdminAnalyticsApi()
                ]);
                if (statsRes.success) setStats(statsRes.data);
                if (analyticsRes.success) setAnalytics(analyticsRes.data);
            } else if (activeTab === 'users') {
                const res = await getAdminUsersApi({ 
                    search: usersSearch, 
                    role: usersRoleFilter, 
                    page: usersPage, 
                    limit: 10 
                });
                if (res.success) {
                    setUsersList(res.data.users);
                    setUsersTotal(res.data.total);
                }
            } else if (activeTab === 'realms') {
                const res = await adminGetWorldsApi();
                if (res.success) setWorlds(res.data);
            } else if (activeTab === 'topics') {
                const [topicsRes, worldsRes] = await Promise.all([
                    adminGetTopicsApi(),
                    adminGetWorldsApi()
                ]);
                if (topicsRes.success) setTopics(topicsRes.data);
                if (worldsRes.success) setWorlds(worldsRes.data);
            } else if (activeTab === 'problems') {
                const [probsRes, topicsRes, worldsRes] = await Promise.all([
                    adminGetProblemsApi(),
                    adminGetTopicsApi(),
                    adminGetWorldsApi()
                ]);
                if (probsRes.success) setProblems(probsRes.data);
                if (topicsRes.success) setTopics(topicsRes.data);
                if (worldsRes.success) setWorlds(worldsRes.data);
            } else if (activeTab === 'bosses') {
                const [bossesRes, worldsRes, probsRes] = await Promise.all([
                    getAdminBossesApi(),
                    adminGetWorldsApi(),
                    adminGetProblemsApi()
                ]);
                if (bossesRes.success) setBosses(bossesRes.data);
                if (worldsRes.success) setWorlds(worldsRes.data);
                if (probsRes.success) setProblems(probsRes.data);
            } else if (activeTab === 'quests') {
                const res = await getAdminQuestsApi();
                if (res.success) setQuests(res.data);
            } else if (activeTab === 'achievements') {
                const res = await getAdminAchievementsApi();
                if (res.success) setAchievements(res.data);
            } else if (activeTab === 'contests') {
                const res = await getContestsApi();
                if (res.success) setContests(res.data);
            }
        } catch (err) {
            console.error('Failed to load admin logs:', err);
            toast.error('Session verification expired or sync error.');
        } finally {
            setLoading(false);
        }
    };

    // Execute Seeder
    const handleSeed = async () => {
        setSeeding(true);
        const loadToast = toast.loading('Reforming primary DSA dungeons...');
        try {
            const res = await adminSeedDatabaseApi(fullReset);
            toast.success(res?.message || 'DB seeded successfully!', { id: loadToast });
            loadTabData();
            if (refreshProgress) refreshProgress();
        } catch (error) {
            toast.error(error.message || 'Seeding failed', { id: loadToast });
        } finally {
            setSeeding(false);
        }
    };

    // User Operations
    const handleUserRoleChange = async (userId, newRole) => {
        setActionLoading(true);
        try {
            await updateUserRoleApi(userId, newRole);
            toast.success('User permission level changed');
            loadTabData();
        } catch (err) {
            toast.error(err.message || 'Action restricted');
        } finally {
            setActionLoading(false);
        }
    };

    const handleUserReset = async (userId, type) => {
        setActionLoading(true);
        try {
            if (type === 'xp') await resetUserXpApi(userId);
            else if (type === 'coins') await resetUserCoinsApi(userId);
            else if (type === 'progress') await resetUserProgressApi(userId);
            toast.success(`User ${type.toUpperCase()} reset completed`);
            loadTabData();
        } catch (err) {
            toast.error(err.message || 'Action restricted');
        } finally {
            setActionLoading(false);
        }
    };

    const handleUserDelete = async (userId) => {
        if (!isAdmin) {
            toast.error('Only Admins can delete user profiles');
            return;
        }
        if (!confirm('Are you sure you want to permanently erase this user profile?')) return;
        setActionLoading(true);
        try {
            await deleteUserApi(userId);
            toast.success('User deleted successfully');
            loadTabData();
        } catch (err) {
            toast.error(err.message);
        } finally {
            setActionLoading(false);
        }
    };

    // Generic CRUD save handler
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        const mode = modalMode;
        try {
            if (activeTab === 'realms') {
                if (mode === 'create') await adminCreateWorldApi(formData);
                else await adminUpdateWorldApi(modalTarget._id, formData);
            } else if (activeTab === 'topics') {
                if (mode === 'create') await adminCreateTopicApi(formData);
                else await adminUpdateTopicApi(modalTarget._id, formData);
            } else if (activeTab === 'problems') {
                if (mode === 'create') await adminCreateProblemApi(formData);
                else await adminUpdateProblemApi(modalTarget._id, formData);
            } else if (activeTab === 'bosses') {
                if (mode === 'create') await createAdminBossApi(formData);
                else await updateAdminBossApi(modalTarget._id, formData);
            } else if (activeTab === 'quests') {
                if (mode === 'create') await createAdminQuestApi(formData);
                else await updateAdminQuestApi(modalTarget._id, formData);
            } else if (activeTab === 'achievements') {
                if (mode === 'create') await createAdminAchievementApi(formData);
                else await updateAdminAchievementApi(modalTarget._id, formData);
            } else if (activeTab === 'contests') {
                if (mode === 'create') await adminCreateContestApi(formData);
                else await adminUpdateContestApi(modalTarget._id, formData);
            }
            toast.success(`Entry ${mode === 'create' ? 'created' : 'updated'} successfully`);
            setShowModal(false);
            loadTabData();
        } catch (err) {
            toast.error(err.message || 'Failed to save entry');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteItem = async (id) => {
        if (activeTab === 'realms' && !isAdmin) {
            toast.error('Only Admins can delete Realms/Worlds');
            return;
        }
        if (!confirm('Delete this item? This action is irreversible.')) return;
        setActionLoading(true);
        try {
            if (activeTab === 'realms') await adminDeleteWorldApi(id);
            else if (activeTab === 'topics') await adminDeleteTopicApi(id);
            else if (activeTab === 'problems') await adminDeleteProblemApi(id);
            else if (activeTab === 'bosses') await deleteAdminBossApi(id);
            else if (activeTab === 'quests') await deleteAdminQuestApi(id);
            else if (activeTab === 'achievements') await deleteAdminAchievementApi(id);
            else if (activeTab === 'contests') await adminDeleteContestApi(id);
            toast.success('Deleted successfully');
            loadTabData();
        } catch (err) {
            toast.error(err.message || 'Deletion failed');
        } finally {
            setActionLoading(false);
        }
    };

    const openCreateModal = () => {
        setModalMode('create');
        setModalTarget(null);
        // Set starter starter code fields, defaults
        if (activeTab === 'realms') {
            setFormData({ name: '', description: '', unlockLevel: 1, difficulty: 'Easy', order: 0, bgImage: '', bossName: '', rewardXp: 300, rewardCoins: 75 });
        } else if (activeTab === 'topics') {
            setFormData({ name: '', world: worlds[0]?._id || '', description: '', difficulty: 'easy', order: 0 });
        } else if (activeTab === 'problems') {
            setFormData({ title: '', difficulty: 'easy', topic: topics[0]?._id || '', world: worlds[0]?._id || '', description: '', inputFormat: '', outputFormat: '', constraints: '', starterCode: '', testCases: [], xpReward: 100, coinsReward: 25 });
        } else if (activeTab === 'bosses') {
            setFormData({ bossName: '', realmId: worlds[0]?._id || '', requiredLevel: 1, requiredTrials: 8, problemId: problems[0]?._id || '', lore: '', artwork: '', reward: { xp: 500, coins: 150, relic: '', title: '' } });
        } else if (activeTab === 'quests') {
            setFormData({ title: '', description: '', type: 'daily', targetType: 'solve_problems', targetValue: 3, xpReward: 150, coinsReward: 50, durationDays: 1 });
        } else if (activeTab === 'achievements') {
            setFormData({ title: '', description: '', icon: '', rarity: 'Common', rewardXp: 200, rewardCoins: 50, conditionType: 'problems_solved', conditionValue: 1 });
        } else if (activeTab === 'contests') {
            setFormData({ title: '', description: '', type: 'Weekly Contest', startTime: new Date().toISOString().slice(0, 16), endTime: new Date(Date.now() + 120 * 60 * 1000).toISOString().slice(0, 16), duration: 120, problems: [], difficulty: 'Mixed', maxParticipants: 1000, rewards: { xp: 500, coins: 100, badge: '', trophy: '', title: '' }, status: 'upcoming', bannerImage: '' });
        }
        setShowModal(true);
    };

    const openEditModal = (item) => {
        setModalMode('edit');
        setModalTarget(item);
        if (activeTab === 'bosses' && !item.reward) {
            item.reward = { xp: 500, coins: 150, relic: '', title: '' };
        }
        if (activeTab === 'contests') {
            item.startTime = item.startTime ? new Date(item.startTime).toISOString().slice(0, 16) : '';
            item.endTime = item.endTime ? new Date(item.endTime).toISOString().slice(0, 16) : '';
        }
        setFormData({ ...item });
        setShowModal(true);
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 min-h-[80vh]">
            
            {/* Left Tabs Sidebar */}
            <div className="w-full lg:w-64 flex flex-col space-y-2">
                <div className="p-4 border border-abyss-border bg-black/60 rounded-xl mb-4">
                    <h2 className="font-fantasy text-sm text-abyss-gold tracking-widest uppercase">Admin Sanctum</h2>
                    <p className="text-[10px] text-abyss-muted">Logged in as {user?.role.toUpperCase()}</p>
                </div>

                {[
                    { id: 'dashboard', label: 'Home Overview', icon: FaCog },
                    { id: 'users', label: 'Users list', icon: FaUsers },
                    { id: 'realms', label: 'Realms Config', icon: FaGlobe },
                    { id: 'topics', label: 'Topics Config', icon: FaBook },
                    { id: 'problems', label: 'Problems CMS', icon: GiBrain },
                    { id: 'bosses', label: 'Bosses Config', icon: FaSkull },
                    { id: 'quests', label: 'Quest Config', icon: FaCalendarCheck },
                    { id: 'achievements', label: 'Achievements', icon: GiTrophy },
                    { id: 'contests', label: 'Contests CRUD', icon: GiTrophy },
                    { id: 'media', label: 'Media Manager', icon: FaImage }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => { setActiveTab(tab.id); setUsersPage(1); }}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-fantasy text-xs uppercase tracking-wider text-left transition-all cursor-pointer ${activeTab === tab.id ? 'bg-abyss-gold/10 border border-abyss-gold/40 text-abyss-gold shadow-glow-gold/10' : 'bg-transparent text-abyss-muted border border-transparent hover:text-white hover:bg-white/5'}`}
                    >
                        <tab.icon className="text-sm" />
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Right Tabs Panel content */}
            <div className="flex-1 min-w-0">
                <Card className="p-6 border-abyss-border flex flex-col min-h-[70vh]">
                    
                    {loading ? (
                        <div className="flex-1 flex items-center justify-center min-h-[50vh]">
                            <LoadingSpinner size="lg" />
                        </div>
                    ) : (
                        <div className="space-y-6">
                            
                            {/* DASHBOARD TAB */}
                            {activeTab === 'dashboard' && stats && (
                                <div className="space-y-8">
                                    {/* Stats grid */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {[
                                            { label: 'Total Users', value: stats.totalUsers, color: 'text-cyan-400 border-cyan-500/20' },
                                            { label: 'Active Users', value: stats.activeUsers, color: 'text-green-400 border-green-500/20' },
                                            { label: 'Total Tasks', value: stats.totalProblems, color: 'text-purple-400 border-purple-500/20' },
                                            { label: 'Success Rate', value: `${stats.successRate}%`, color: 'text-yellow-400 border-yellow-500/20' },
                                            { label: 'XP Distributed', value: `${stats.totalXp} XP`, color: 'text-purple-300 border-purple-500/10' },
                                            { label: 'Coins Disbursed', value: `${stats.totalCoins} G`, color: 'text-yellow-500 border-yellow-500/10' },
                                            { label: 'Bosses Slain', value: stats.totalBosses, color: 'text-red-400 border-red-500/20 shadow-glow-danger/5' },
                                            { label: 'Submissions', value: stats.totalSubmissions, color: 'text-teal-400 border-teal-500/20' }
                                        ].map((s) => (
                                            <div key={s.label} className={`bg-black/45 border p-4 rounded-xl text-center ${s.color}`}>
                                                <span className="text-[9px] uppercase tracking-wider text-abyss-muted block mb-1">{s.label}</span>
                                                <span className="font-mono text-xl font-bold text-white">{s.value}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Custom SVG charts (Lightweight & high performance) */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Card className="bg-black/30 border-abyss-border/40 p-5 space-y-4">
                                            <h4 className="font-fantasy text-xs text-abyss-gold tracking-widest uppercase">Daily User Traffic</h4>
                                            {/* Beautiful custom responsive SVG chart */}
                                            <div className="h-48 w-full flex items-end justify-between pt-6 border-b border-l border-abyss-border/20 px-2 font-mono text-[9px] text-abyss-muted">
                                                {analytics?.dailyActiveUsers?.map((d) => (
                                                    <div key={d.day} className="flex flex-col items-center w-full group relative">
                                                        {/* Tooltip */}
                                                        <span className="absolute -top-6 bg-black border border-abyss-border px-1.5 py-0.5 rounded text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                                            {d.count} Users
                                                        </span>
                                                        <div 
                                                            style={{ height: `${(d.count / 40) * 120}px` }} 
                                                            className="w-8 bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-t shadow-glow-primary/20 hover:from-cyan-500 hover:to-cyan-300 transition-all cursor-pointer"
                                                        />
                                                        <span className="mt-2 block uppercase text-[8px]">{d.day}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </Card>

                                        <Card className="bg-black/30 border-abyss-border/40 p-5 space-y-4">
                                            <h4 className="font-fantasy text-xs text-abyss-gold tracking-widest uppercase">Submissions Load</h4>
                                            {/* Submissions spline sparkline chart using custom SVG Path */}
                                            <div className="h-48 w-full relative pt-6">
                                                <svg className="w-full h-32" viewBox="0 0 400 100" preserveAspectRatio="none">
                                                    {/* Sparkline curve path */}
                                                    <path 
                                                        d="M 10 70 Q 70 40 130 80 T 250 20 T 310 10 T 390 30" 
                                                        fill="none" 
                                                        stroke="rgba(239, 68, 68, 0.7)" 
                                                        strokeWidth="3"
                                                        className="drop-shadow-[0_2px_8px_rgba(239,68,68,0.4)]"
                                                    />
                                                    <path 
                                                        d="M 10 80 Q 70 60 130 90 T 250 50 T 310 40 T 390 60" 
                                                        fill="none" 
                                                        stroke="rgba(16, 185, 129, 0.6)" 
                                                        strokeWidth="2"
                                                    />
                                                </svg>
                                                <div className="flex justify-between border-t border-abyss-border/20 pt-2 text-[8px] font-mono text-abyss-muted uppercase">
                                                    <span>07/04</span>
                                                    <span>07/06</span>
                                                    <span>07/08</span>
                                                    <span>Today</span>
                                                </div>
                                            </div>
                                        </Card>
                                    </div>

                                    {/* DB Seeder widget */}
                                    <div className="border-t border-abyss-border/20 pt-6">
                                        <h4 className="font-fantasy text-xs text-abyss-gold tracking-widest uppercase mb-3">Database Seeder & Curriculum Refiner</h4>
                                        <div className="flex flex-col sm:flex-row items-center justify-between bg-black/60 p-4 border border-abyss-border/20 rounded-xl gap-4">
                                            <div className="space-y-1 text-left">
                                                <div className="flex items-center space-x-2">
                                                    <input
                                                        id="full-reset-dash"
                                                        type="checkbox"
                                                        checked={fullReset}
                                                        onChange={(e) => setFullReset(e.target.checked)}
                                                        className="h-3.5 w-3.5 rounded border-abyss-border bg-black/40 text-abyss-primary cursor-pointer"
                                                    />
                                                    <label htmlFor="full-reset-dash" className="font-fantasy text-[10px] uppercase tracking-wider text-abyss-gold cursor-pointer select-none">
                                                        Full Reset (Wipe Achievements & user statistics)
                                                    </label>
                                                </div>
                                                <p className="text-[10px] text-abyss-muted leading-relaxed">Runs default seeder engine for Arrays, Strings, Trees, and Dynamic Programming curriculum.</p>
                                            </div>
                                            <PrimaryButton onClick={handleSeed} disabled={seeding} className="px-6 py-2.5">
                                                {seeding ? 'Casting Seeder Spell...' : 'Execute DB Seeder'}
                                            </PrimaryButton>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* USERS TAB */}
                            {activeTab === 'users' && (
                                <div className="space-y-4">
                                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                                        <h3 className="font-fantasy text-base font-bold text-white uppercase tracking-wider">User Directory</h3>
                                        {/* Search & filters */}
                                        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                                            <div className="relative flex-grow sm:flex-grow-0">
                                                <FaSearch className="absolute left-3 top-3 text-abyss-muted text-xs" />
                                                <input
                                                    type="text"
                                                    placeholder="Search username/email..."
                                                    value={usersSearch}
                                                    onChange={(e) => { setUsersSearch(e.target.value); setUsersPage(1); }}
                                                    className="w-full sm:w-48 bg-black/45 border border-abyss-border/30 rounded-xl pl-9 pr-4 py-2 font-sans text-xs text-white placeholder-abyss-muted focus:outline-none focus:border-abyss-gold"
                                                />
                                            </div>
                                            <select
                                                value={usersRoleFilter}
                                                onChange={(e) => { setUsersRoleFilter(e.target.value); setUsersPage(1); }}
                                                className="bg-black/45 border border-abyss-border/30 rounded-xl px-4 py-2 font-fantasy text-xs text-abyss-gold focus:outline-none"
                                            >
                                                <option value="">All Roles</option>
                                                <option value="student">Student</option>
                                                <option value="moderator">Moderator</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Users List Table */}
                                    <div className="overflow-x-auto border border-abyss-border/20 rounded-xl bg-black/45">
                                        <table className="w-full text-left border-collapse text-xs font-sans">
                                            <thead>
                                                <tr className="border-b border-abyss-border/30 bg-black/60 font-fantasy text-abyss-gold uppercase tracking-wider">
                                                    <th className="p-3.5">User</th>
                                                    <th className="p-3.5">Email</th>
                                                    <th className="p-3.5">Role</th>
                                                    <th className="p-3.5">Level</th>
                                                    <th className="p-3.5">Coins / XP</th>
                                                    <th className="p-3.5 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-abyss-border/10 text-abyss-muted">
                                                {usersList.map((usr) => (
                                                    <tr key={usr._id} className="hover:bg-white/2">
                                                        <td className="p-3.5 text-white font-medium">{usr.username}</td>
                                                        <td className="p-3.5 font-mono">{usr.email}</td>
                                                        <td className="p-3.5">
                                                            <select
                                                                value={usr.role}
                                                                onChange={(e) => handleUserRoleChange(usr._id, e.target.value)}
                                                                className="bg-black border border-abyss-border/40 text-xs px-2 py-0.5 rounded text-white cursor-pointer"
                                                            >
                                                                <option value="student">Student</option>
                                                                <option value="moderator">Moderator</option>
                                                                <option value="admin">Admin</option>
                                                            </select>
                                                        </td>
                                                        <td className="p-3.5 font-mono">{usr.level}</td>
                                                        <td className="p-3.5 font-mono">{usr.coins} G / {usr.xp} XP</td>
                                                        <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                                                            <button onClick={() => handleUserReset(usr._id, 'xp')} className="px-2 py-1 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20 rounded text-[10px] uppercase font-fantasy cursor-pointer">Reset XP</button>
                                                            <button onClick={() => handleUserReset(usr._id, 'coins')} className="px-2 py-1 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-300 border border-yellow-500/20 rounded text-[10px] uppercase font-fantasy cursor-pointer">Reset G</button>
                                                            <button onClick={() => handleUserReset(usr._id, 'progress')} className="px-2 py-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/20 rounded text-[10px] uppercase font-fantasy cursor-pointer">Reset Progress</button>
                                                            <button onClick={() => handleUserDelete(usr._id)} className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded cursor-pointer"><FaTrash size={10} /></button>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {usersList.length === 0 && (
                                                    <tr>
                                                        <td colSpan="6" className="p-8 text-center text-abyss-muted italic">No users found match your parameters.</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* REALMS TAB */}
                            {activeTab === 'realms' && (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-fantasy text-base font-bold text-white uppercase tracking-wider">Fantasy Realms</h3>
                                        <PrimaryButton onClick={openCreateModal} className="flex items-center space-x-1 py-1.5 px-3">
                                            <FaPlus size={9} />
                                            <span className="text-[10px]">Create Realm</span>
                                        </PrimaryButton>
                                    </div>

                                    <div className="overflow-x-auto border border-abyss-border/20 rounded-xl bg-black/45">
                                        <table className="w-full text-left border-collapse text-xs font-sans">
                                            <thead>
                                                <tr className="border-b border-abyss-border/30 bg-black/60 font-fantasy text-abyss-gold uppercase tracking-wider">
                                                    <th className="p-3.5">Order</th>
                                                    <th className="p-3.5">Name</th>
                                                    <th className="p-3.5">Unlock LVL</th>
                                                    <th className="p-3.5">Boss</th>
                                                    <th className="p-3.5">XP Reward</th>
                                                    <th className="p-3.5 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-abyss-border/10 text-abyss-muted">
                                                {worlds.map((w) => (
                                                    <tr key={w._id} className="hover:bg-white/2">
                                                        <td className="p-3.5 font-mono text-white">{w.order}</td>
                                                        <td className="p-3.5 text-white font-medium font-fantasy uppercase">{w.name}</td>
                                                        <td className="p-3.5 font-mono">LVL {w.unlockLevel}</td>
                                                        <td className="p-3.5 text-red-400 font-medium">{w.bossName || 'None'}</td>
                                                        <td className="p-3.5 font-mono">+{w.rewardXp || 300} XP</td>
                                                        <td className="p-3.5 text-right space-x-2">
                                                            <button onClick={() => openEditModal(w)} className="p-1.5 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-300 border border-yellow-500/20 rounded cursor-pointer"><FaEdit size={10} /></button>
                                                            <button onClick={() => handleDeleteItem(w._id)} className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded cursor-pointer"><FaTrash size={10} /></button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* TOPICS TAB */}
                            {activeTab === 'topics' && (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-fantasy text-base font-bold text-white uppercase tracking-wider">Realm Chapters (Topics)</h3>
                                        <PrimaryButton onClick={openCreateModal} className="flex items-center space-x-1 py-1.5 px-3">
                                            <FaPlus size={9} />
                                            <span className="text-[10px]">Create Topic</span>
                                        </PrimaryButton>
                                    </div>

                                    <div className="overflow-x-auto border border-abyss-border/20 rounded-xl bg-black/45">
                                        <table className="w-full text-left border-collapse text-xs font-sans">
                                            <thead>
                                                <tr className="border-b border-abyss-border/30 bg-black/60 font-fantasy text-abyss-gold uppercase tracking-wider">
                                                    <th className="p-3.5">Realm</th>
                                                    <th className="p-3.5">Topic Name</th>
                                                    <th className="p-3.5">Difficulty</th>
                                                    <th className="p-3.5">Order</th>
                                                    <th className="p-3.5 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-abyss-border/10 text-abyss-muted">
                                                {topics.map((t) => (
                                                    <tr key={t._id} className="hover:bg-white/2">
                                                        <td className="p-3.5 text-white font-fantasy text-[10px]">{t.world?.name || 'Seeded'}</td>
                                                        <td className="p-3.5 text-white font-medium">{t.name}</td>
                                                        <td className="p-3.5 uppercase">{t.difficulty}</td>
                                                        <td className="p-3.5 font-mono">{t.order}</td>
                                                        <td className="p-3.5 text-right space-x-2">
                                                            <button onClick={() => openEditModal(t)} className="p-1.5 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-300 border border-yellow-500/20 rounded cursor-pointer"><FaEdit size={10} /></button>
                                                            <button onClick={() => handleDeleteItem(t._id)} className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded cursor-pointer"><FaTrash size={10} /></button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* PROBLEMS CMS TAB */}
                            {activeTab === 'problems' && (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-fantasy text-base font-bold text-white uppercase tracking-wider">Dungeons tasks (Problems)</h3>
                                        <PrimaryButton onClick={openCreateModal} className="flex items-center space-x-1 py-1.5 px-3">
                                            <FaPlus size={9} />
                                            <span className="text-[10px]">Create Problem</span>
                                        </PrimaryButton>
                                    </div>

                                    <div className="overflow-x-auto border border-abyss-border/20 rounded-xl bg-black/45">
                                        <table className="w-full text-left border-collapse text-xs font-sans">
                                            <thead>
                                                <tr className="border-b border-b-abyss-border/30 bg-black/60 font-fantasy text-abyss-gold uppercase tracking-wider">
                                                    <th className="p-3.5">Title</th>
                                                    <th className="p-3.5">Difficulty</th>
                                                    <th className="p-3.5">Topic</th>
                                                    <th className="p-3.5">Boss Trial</th>
                                                    <th className="p-3.5">XP Bounty</th>
                                                    <th className="p-3.5 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-abyss-border/10 text-abyss-muted">
                                                {problems.map((p) => (
                                                    <tr key={p._id} className="hover:bg-white/2">
                                                        <td className="p-3.5 text-white font-medium">{p.title}</td>
                                                        <td className="p-3.5 uppercase">{p.difficulty}</td>
                                                        <td className="p-3.5">{p.topic?.name || 'Seeded'}</td>
                                                        <td className="p-3.5">
                                                            <span className={`text-[10px] font-fantasy uppercase ${p.bossLevel ? 'text-red-400' : 'text-abyss-muted'}`}>
                                                                {p.bossLevel ? 'Yes' : 'No'}
                                                            </span>
                                                        </td>
                                                        <td className="p-3.5 font-mono">+{p.xpReward} XP</td>
                                                        <td className="p-3.5 text-right space-x-2">
                                                            <button onClick={() => openEditModal(p)} className="p-1.5 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-300 border border-yellow-500/20 rounded cursor-pointer"><FaEdit size={10} /></button>
                                                            <button onClick={() => handleDeleteItem(p._id)} className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded cursor-pointer"><FaTrash size={10} /></button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* BOSSES CONFIG TAB */}
                            {activeTab === 'bosses' && (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-fantasy text-base font-bold text-white uppercase tracking-wider">Zone Guardians</h3>
                                        <PrimaryButton onClick={openCreateModal} className="flex items-center space-x-1 py-1.5 px-3">
                                            <FaPlus size={9} />
                                            <span className="text-[10px]">Create Guardian</span>
                                        </PrimaryButton>
                                    </div>

                                    <div className="overflow-x-auto border border-abyss-border/20 rounded-xl bg-black/45">
                                        <table className="w-full text-left border-collapse text-xs font-sans">
                                            <thead>
                                                <tr className="border-b border-abyss-border/30 bg-black/60 font-fantasy text-abyss-gold uppercase tracking-wider">
                                                    <th className="p-3.5">Boss Name</th>
                                                    <th className="p-3.5">Realm</th>
                                                    <th className="p-3.5">Required Level</th>
                                                    <th className="p-3.5">Required Trials</th>
                                                    <th className="p-3.5">Relic Drop</th>
                                                    <th className="p-3.5 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-abyss-border/10 text-abyss-muted">
                                                {bosses.map((b) => (
                                                    <tr key={b._id} className="hover:bg-white/2">
                                                        <td className="p-3.5 text-red-400 font-fantasy uppercase font-medium">{b.bossName}</td>
                                                        <td className="p-3.5 text-white font-fantasy text-[10px]">{b.realmId?.name || 'Seeded'}</td>
                                                        <td className="p-3.5 font-mono">LVL {b.requiredLevel}</td>
                                                        <td className="p-3.5 font-mono">{b.requiredTrials} Solve</td>
                                                        <td className="p-3.5 text-yellow-300 font-fantasy">{b.reward?.relic || 'None'}</td>
                                                        <td className="p-3.5 text-right space-x-2">
                                                            <button onClick={() => openEditModal(b)} className="p-1.5 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-300 border border-yellow-500/20 rounded cursor-pointer"><FaEdit size={10} /></button>
                                                            <button onClick={() => handleDeleteItem(b._id)} className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded cursor-pointer"><FaTrash size={10} /></button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* QUESTS CONFIG TAB */}
                            {activeTab === 'quests' && (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-fantasy text-base font-bold text-white uppercase tracking-wider">Quest Ledger</h3>
                                        <PrimaryButton onClick={openCreateModal} className="flex items-center space-x-1 py-1.5 px-3">
                                            <FaPlus size={9} />
                                            <span className="text-[10px]">Create Quest</span>
                                        </PrimaryButton>
                                    </div>

                                    <div className="overflow-x-auto border border-abyss-border/20 rounded-xl bg-black/45">
                                        <table className="w-full text-left border-collapse text-xs font-sans">
                                            <thead>
                                                <tr className="border-b border-abyss-border/30 bg-black/60 font-fantasy text-abyss-gold uppercase tracking-wider">
                                                    <th className="p-3.5">Quest Title</th>
                                                    <th className="p-3.5">Type</th>
                                                    <th className="p-3.5">Objective</th>
                                                    <th className="p-3.5">Rewards</th>
                                                    <th className="p-3.5">Duration</th>
                                                    <th className="p-3.5 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-abyss-border/10 text-abyss-muted">
                                                {quests.map((q) => (
                                                    <tr key={q._id} className="hover:bg-white/2">
                                                        <td className="p-3.5 text-white font-medium">{q.title}</td>
                                                        <td className="p-3.5 uppercase font-fantasy text-[10px]">{q.type}</td>
                                                        <td className="p-3.5 font-mono">{q.targetType}: {q.targetValue}</td>
                                                        <td className="p-3.5 font-mono text-yellow-300">+{q.coinsReward} G / +{q.xpReward} XP</td>
                                                        <td className="p-3.5 font-mono">{q.durationDays} Days</td>
                                                        <td className="p-3.5 text-right space-x-2">
                                                            <button onClick={() => openEditModal(q)} className="p-1.5 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-300 border border-yellow-500/20 rounded cursor-pointer"><FaEdit size={10} /></button>
                                                            <button onClick={() => handleDeleteItem(q._id)} className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded cursor-pointer"><FaTrash size={10} /></button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* ACHIEVEMENTS TAB */}
                            {activeTab === 'achievements' && (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-fantasy text-base font-bold text-white uppercase tracking-wider">Achievements Gallery Config</h3>
                                        <PrimaryButton onClick={openCreateModal} className="flex items-center space-x-1 py-1.5 px-3">
                                            <FaPlus size={9} />
                                            <span className="text-[10px]">Create Achievement</span>
                                        </PrimaryButton>
                                    </div>

                                    <div className="overflow-x-auto border border-abyss-border/20 rounded-xl bg-black/45">
                                        <table className="w-full text-left border-collapse text-xs font-sans">
                                            <thead>
                                                <tr className="border-b border-abyss-border/30 bg-black/60 font-fantasy text-abyss-gold uppercase tracking-wider">
                                                    <th className="p-3.5">Name</th>
                                                    <th className="p-3.5">Rarity</th>
                                                    <th className="p-3.5">Gold Bounty</th>
                                                    <th className="p-3.5">Condition</th>
                                                    <th className="p-3.5 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-abyss-border/10 text-abyss-muted">
                                                {achievements.map((a) => (
                                                    <tr key={a._id} className="hover:bg-white/2">
                                                        <td className="p-3.5 text-white font-medium">{a.title}</td>
                                                        <td className="p-3.5 uppercase font-fantasy text-[9px] text-yellow-300">{a.rarity}</td>
                                                        <td className="p-3.5 font-mono">+{a.rewardCoins} G</td>
                                                        <td className="p-3.5 font-mono">{a.conditionType} &gt;= {a.conditionValue}</td>
                                                        <td className="p-3.5 text-right space-x-2">
                                                            <button onClick={() => openEditModal(a)} className="p-1.5 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-300 border border-yellow-500/20 rounded cursor-pointer"><FaEdit size={10} /></button>
                                                            <button onClick={() => handleDeleteItem(a._id)} className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded cursor-pointer"><FaTrash size={10} /></button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* CONTESTS TAB */}
                            {activeTab === 'contests' && (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-fantasy text-base font-bold text-white uppercase tracking-wider">Championship Arenas Config</h3>
                                        <PrimaryButton onClick={openCreateModal} className="flex items-center space-x-1 py-1.5 px-3">
                                            <FaPlus size={9} />
                                            <span className="text-[10px]">Create Contest</span>
                                        </PrimaryButton>
                                    </div>

                                    <div className="overflow-x-auto border border-abyss-border/20 rounded-xl bg-black/45">
                                        <table className="w-full text-left border-collapse text-xs font-sans">
                                            <thead>
                                                <tr className="border-b border-abyss-border/30 bg-black/60 font-fantasy text-abyss-gold uppercase tracking-wider">
                                                    <th className="p-3.5">Contest</th>
                                                    <th className="p-3.5">Type</th>
                                                    <th className="p-3.5">Difficulty</th>
                                                    <th className="p-3.5">Duration</th>
                                                    <th className="p-3.5">Status</th>
                                                    <th className="p-3.5 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-abyss-border/10 text-abyss-muted">
                                                {contests.map((c) => (
                                                    <tr key={c._id} className="hover:bg-white/2">
                                                        <td className="p-3.5 text-white font-medium">{c.title}</td>
                                                        <td className="p-3.5 uppercase font-fantasy text-[9px] text-yellow-300">{c.type}</td>
                                                        <td className="p-3.5 font-mono">{c.difficulty}</td>
                                                        <td className="p-3.5 font-mono">{c.duration} Mins</td>
                                                        <td className="p-3.5 font-mono uppercase text-[9px]">{c.status}</td>
                                                        <td className="p-3.5 text-right space-x-2">
                                                            <button onClick={() => openEditModal(c)} className="p-1.5 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-300 border border-yellow-500/20 rounded cursor-pointer"><FaEdit size={10} /></button>
                                                            <button onClick={() => handleDeleteItem(c._id)} className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded cursor-pointer"><FaTrash size={10} /></button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* MEDIA MANAGER TAB */}
                            {activeTab === 'media' && (
                                <div className="space-y-6">
                                    <h3 className="font-fantasy text-base font-bold text-white uppercase tracking-wider">Media Sandbox</h3>
                                    <p className="text-xs text-abyss-muted">Inspect, preview, and test artwork scaling before registering them in database configs.</p>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Card className="p-5 border-abyss-border/30 space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] uppercase font-fantasy text-abyss-gold tracking-wider">Asset URL to inspect</label>
                                                <input
                                                    type="text"
                                                    value={previewUrl}
                                                    onChange={(e) => setPreviewUrl(e.target.value)}
                                                    placeholder="Paste image address (HTTPS only)..."
                                                    className="w-full bg-black/45 border border-abyss-border/40 rounded-xl px-4 py-2 text-xs text-white placeholder-abyss-muted focus:outline-none"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] uppercase font-fantasy text-abyss-gold tracking-wider">Preview Frame Aspect</label>
                                                <select
                                                    value={previewType}
                                                    onChange={(e) => setPreviewType(e.target.value)}
                                                    className="w-full bg-black border border-abyss-border/40 text-xs px-3 py-2 rounded-xl text-white focus:outline-none"
                                                >
                                                    <option value="realm">Realm Background Hero (Full-width cinematic)</option>
                                                    <option value="boss">Boss Portrait Card (Aspect ratio 1:1)</option>
                                                    <option value="achievement">Achievement Icon Badge (Circular float)</option>
                                                </select>
                                            </div>
                                        </Card>

                                        <Card className="p-5 border-abyss-border/30 flex flex-col justify-center items-center text-center bg-black/20">
                                            {previewUrl ? (
                                                <div className="space-y-3 w-full">
                                                    <span className="text-[9px] uppercase tracking-wider text-green-400 block font-fantasy">Sandbox preview viewport</span>
                                                    {previewType === 'realm' && (
                                                        <div className="h-32 w-full rounded-xl overflow-hidden relative border border-abyss-border/40">
                                                            <div className="absolute inset-0 bg-black/40 z-10 flex items-center justify-center">
                                                                <span className="font-fantasy text-sm uppercase text-white tracking-widest">Cinema Viewport</span>
                                                            </div>
                                                            <img src={previewUrl} className="w-full h-full object-cover" alt="Realm preview" onError={(e) => { toast.error('Invalid image URL'); setPreviewUrl(''); }} />
                                                        </div>
                                                    )}
                                                    {previewType === 'boss' && (
                                                        <div className="w-24 h-24 rounded-2xl overflow-hidden border border-red-500/40 shadow-glow-danger/25 mx-auto">
                                                            <img src={previewUrl} className="w-full h-full object-cover" alt="Boss portrait preview" />
                                                        </div>
                                                    )}
                                                    {previewType === 'achievement' && (
                                                        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-abyss-gold/40 shadow-glow-gold/25 mx-auto bg-black/60 p-2">
                                                            <img src={previewUrl} className="w-full h-full object-contain" alt="Achievement icon preview" />
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="space-y-2">
                                                    <FaImage className="text-4xl text-abyss-muted/20 mx-auto" />
                                                    <p className="text-[10px] text-abyss-muted uppercase">Ready for image verification.</p>
                                                </div>
                                            )}
                                        </Card>
                                    </div>
                                </div>
                            )}

                        </div>
                    )}
                </Card>
            </div>

            {/* FORM MODAL (UNIVERSAL CRUD FORM) */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm overflow-y-auto">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative max-w-lg w-full bg-gradient-to-b from-abyss-card via-black to-black border-2 border-abyss-gold/40 rounded-2xl p-6 text-left space-y-4 shadow-glow-gold/10 overflow-hidden my-8"
                        >
                            <div className="flex justify-between items-center border-b border-abyss-border/20 pb-3">
                                <h3 className="font-fantasy text-sm uppercase text-abyss-gold tracking-widest">
                                    {modalMode === 'create' ? 'Forge New' : 'Refine'} {activeTab.slice(0, -1).toUpperCase()}
                                </h3>
                                <button onClick={() => setShowModal(false)} className="text-abyss-muted hover:text-white cursor-pointer"><FaTimes /></button>
                            </div>

                            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs font-sans">
                                
                                {/* REALM FORM */}
                                {activeTab === 'realms' && (
                                    <>
                                        <div className="space-y-1">
                                            <label className="text-[10px] uppercase font-fantasy tracking-wider text-abyss-muted">Realm Name</label>
                                            <input type="text" required value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-black/45 border border-abyss-border/40 rounded-xl px-4 py-2 text-white" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] uppercase font-fantasy tracking-wider text-abyss-muted">Description</label>
                                            <textarea required value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full bg-black/45 border border-abyss-border/40 rounded-xl px-4 py-2 text-white h-20" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-[10px] uppercase font-fantasy tracking-wider text-abyss-muted">Unlock Level</label>
                                                <input type="number" required value={formData.unlockLevel || 1} onChange={(e) => setFormData({ ...formData, unlockLevel: Number(e.target.value) })} className="w-full bg-black/45 border border-abyss-border/40 rounded-xl px-4 py-2 text-white" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] uppercase font-fantasy tracking-wider text-abyss-muted">Order</label>
                                                <input type="number" required value={formData.order || 0} onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })} className="w-full bg-black/45 border border-abyss-border/40 rounded-xl px-4 py-2 text-white" />
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] uppercase font-fantasy tracking-wider text-abyss-muted">Background Image (URL)</label>
                                            <input type="text" value={formData.bgImage || ''} onChange={(e) => setFormData({ ...formData, bgImage: e.target.value })} className="w-full bg-black/45 border border-abyss-border/40 rounded-xl px-4 py-2 text-white" />
                                        </div>
                                    </>
                                )}

                                {/* TOPIC FORM */}
                                {activeTab === 'topics' && (
                                    <>
                                        <div className="space-y-1">
                                            <label className="text-[10px] uppercase font-fantasy tracking-wider text-abyss-muted">Topic Name</label>
                                            <input type="text" required value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-black/45 border border-abyss-border/40 rounded-xl px-4 py-2 text-white" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] uppercase font-fantasy tracking-wider text-abyss-muted">Parent Realm</label>
                                            <select value={formData.world || ''} onChange={(e) => setFormData({ ...formData, world: e.target.value })} className="w-full bg-black border border-abyss-border/40 text-xs px-3 py-2 rounded-xl text-white">
                                                {worlds.map((w) => <option key={w._id} value={w._id}>{w.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] uppercase font-fantasy tracking-wider text-abyss-muted">Description</label>
                                            <textarea required value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full bg-black/45 border border-abyss-border/40 rounded-xl px-4 py-2 text-white h-20" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-[10px] uppercase font-fantasy tracking-wider text-abyss-muted">Difficulty</label>
                                                <select value={formData.difficulty || 'easy'} onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })} className="w-full bg-black border border-abyss-border/40 text-xs px-3 py-2 rounded-xl text-white">
                                                    <option value="easy">Easy</option>
                                                    <option value="medium">Medium</option>
                                                    <option value="hard">Hard</option>
                                                </select>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] uppercase font-fantasy tracking-wider text-abyss-muted">Order</label>
                                                <input type="number" required value={formData.order || 0} onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })} className="w-full bg-black/45 border border-abyss-border/40 rounded-xl px-4 py-2 text-white" />
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* PROBLEM FORM */}
                                {activeTab === 'problems' && (
                                    <>
                                        <div className="space-y-1">
                                            <label className="text-[10px] uppercase font-fantasy tracking-wider text-abyss-muted">Problem Title</label>
                                            <input type="text" required value={formData.title || ''} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full bg-black/45 border border-abyss-border/40 rounded-xl px-4 py-2 text-white" />
                                        </div>
                                        <div className="grid grid-cols-3 gap-2">
                                            <div className="space-y-1">
                                                <label className="text-[10px] uppercase font-fantasy tracking-wider text-abyss-muted">Difficulty</label>
                                                <select value={formData.difficulty || 'easy'} onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })} className="w-full bg-black border border-abyss-border/40 text-xs px-2 py-1.5 rounded-xl text-white">
                                                    <option value="easy">Easy</option>
                                                    <option value="medium">Medium</option>
                                                    <option value="hard">Hard</option>
                                                    <option value="boss">Boss</option>
                                                </select>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] uppercase font-fantasy tracking-wider text-abyss-muted">Topic</label>
                                                <select value={formData.topic || ''} onChange={(e) => setFormData({ ...formData, topic: e.target.value })} className="w-full bg-black border border-abyss-border/40 text-xs px-2 py-1.5 rounded-xl text-white">
                                                    {topics.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
                                                </select>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] uppercase font-fantasy tracking-wider text-abyss-muted">Realm</label>
                                                <select value={formData.world || ''} onChange={(e) => setFormData({ ...formData, world: e.target.value })} className="w-full bg-black border border-abyss-border/40 text-xs px-2 py-1.5 rounded-xl text-white">
                                                    {worlds.map((w) => <option key={w._id} value={w._id}>{w.name}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] uppercase font-fantasy tracking-wider text-abyss-muted">Dungeon Statement (HTML / Markdown)</label>
                                            <textarea required value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full bg-black/45 border border-abyss-border/40 rounded-xl px-4 py-2 text-white h-20" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-[10px] uppercase font-fantasy tracking-wider text-abyss-muted">XP Reward</label>
                                                <input type="number" required value={formData.xpReward || 100} onChange={(e) => setFormData({ ...formData, xpReward: Number(e.target.value) })} className="w-full bg-black/45 border border-abyss-border/40 rounded-xl px-4 py-2 text-white" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] uppercase font-fantasy tracking-wider text-abyss-muted">Coins Reward</label>
                                                <input type="number" required value={formData.coinsReward || 25} onChange={(e) => setFormData({ ...formData, coinsReward: Number(e.target.value) })} className="w-full bg-black/45 border border-abyss-border/40 rounded-xl px-4 py-2 text-white" />
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] uppercase font-fantasy tracking-wider text-abyss-muted">Starter Code</label>
                                            <textarea value={formData.starterCode || ''} onChange={(e) => setFormData({ ...formData, starterCode: e.target.value })} placeholder="function solve() {}..." className="w-full bg-black/45 border border-abyss-border/40 rounded-xl px-4 py-2 text-white font-mono h-24" />
                                        </div>
                                    </>
                                )}

                                {/* BOSS FORM */}
                                {activeTab === 'bosses' && (
                                    <>
                                        <div className="space-y-1">
                                            <label className="text-[10px] uppercase font-fantasy tracking-wider text-abyss-muted">Boss Name</label>
                                            <input type="text" required value={formData.bossName || ''} onChange={(e) => setFormData({ ...formData, bossName: e.target.value })} className="w-full bg-black/45 border border-abyss-border/40 rounded-xl px-4 py-2 text-white" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-[10px] uppercase font-fantasy tracking-wider text-abyss-muted">Realm Mapping</label>
                                                <select value={formData.realmId || ''} onChange={(e) => setFormData({ ...formData, realmId: e.target.value })} className="w-full bg-black border border-abyss-border/40 text-xs px-3 py-2 rounded-xl text-white">
                                                    {worlds.map((w) => <option key={w._id} value={w._id}>{w.name}</option>)}
                                                </select>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] uppercase font-fantasy tracking-wider text-abyss-muted">Problem Mapping</label>
                                                <select value={formData.problemId || ''} onChange={(e) => setFormData({ ...formData, problemId: e.target.value })} className="w-full bg-black border border-abyss-border/40 text-xs px-3 py-2 rounded-xl text-white">
                                                    {problems.map((p) => <option key={p._id} value={p._id}>{p.title}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-[10px] uppercase font-fantasy tracking-wider text-abyss-muted">Required Level</label>
                                                <input type="number" required value={formData.requiredLevel || 1} onChange={(e) => setFormData({ ...formData, requiredLevel: Number(e.target.value) })} className="w-full bg-black/45 border border-abyss-border/40 rounded-xl px-4 py-2 text-white" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] uppercase font-fantasy tracking-wider text-abyss-muted">Required Trials</label>
                                                <input type="number" required value={formData.requiredTrials || 8} onChange={(e) => setFormData({ ...formData, requiredTrials: Number(e.target.value) })} className="w-full bg-black/45 border border-abyss-border/40 rounded-xl px-4 py-2 text-white" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-[10px] uppercase font-fantasy tracking-wider text-abyss-muted">Relic Reward</label>
                                                <input type="text" value={formData.reward?.relic || ''} onChange={(e) => setFormData({ ...formData, reward: { ...formData.reward, relic: e.target.value } })} className="w-full bg-black/45 border border-abyss-border/40 rounded-xl px-4 py-2 text-white" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] uppercase font-fantasy tracking-wider text-abyss-muted">Title Reward</label>
                                                <input type="text" value={formData.reward?.title || ''} onChange={(e) => setFormData({ ...formData, reward: { ...formData.reward, title: e.target.value } })} className="w-full bg-black/45 border border-abyss-border/40 rounded-xl px-4 py-2 text-white" />
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] uppercase font-fantasy tracking-wider text-abyss-muted">Boss Artwork (URL)</label>
                                            <input type="text" value={formData.artwork || ''} onChange={(e) => setFormData({ ...formData, artwork: e.target.value })} className="w-full bg-black/45 border border-abyss-border/40 rounded-xl px-4 py-2 text-white" />
                                        </div>
                                    </>
                                )}

                                {/* QUEST FORM */}
                                {activeTab === 'quests' && (
                                    <>
                                        <div className="space-y-1">
                                            <label className="text-[10px] uppercase font-fantasy tracking-wider text-abyss-muted">Quest Title</label>
                                            <input type="text" required value={formData.title || ''} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full bg-black/45 border border-abyss-border/40 rounded-xl px-4 py-2 text-white" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-[10px] uppercase font-fantasy tracking-wider text-abyss-muted">Quest Type</label>
                                                <select value={formData.type || 'daily'} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full bg-black border border-abyss-border/40 text-xs px-3 py-2 rounded-xl text-white">
                                                    <option value="daily">Daily</option>
                                                    <option value="weekly">Weekly</option>
                                                </select>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] uppercase font-fantasy tracking-wider text-abyss-muted">Objective Target Type</label>
                                                <select value={formData.targetType || 'solve_problems'} onChange={(e) => setFormData({ ...formData, targetType: e.target.value })} className="w-full bg-black border border-abyss-border/40 text-xs px-3 py-2 rounded-xl text-white">
                                                    <option value="solve_problems">Solve problems</option>
                                                    <option value="earn_xp">Earn XP</option>
                                                    <option value="complete_topic">Complete Topic</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2">
                                            <div className="space-y-1">
                                                <label className="text-[10px] uppercase font-fantasy tracking-wider text-abyss-muted">Target Value</label>
                                                <input type="number" required value={formData.targetValue || 3} onChange={(e) => setFormData({ ...formData, targetValue: Number(e.target.value) })} className="w-full bg-black/45 border border-abyss-border/40 rounded-xl px-4 py-2 text-white" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] uppercase font-fantasy tracking-wider text-abyss-muted">XP Reward</label>
                                                <input type="number" required value={formData.xpReward || 150} onChange={(e) => setFormData({ ...formData, xpReward: Number(e.target.value) })} className="w-full bg-black/45 border border-abyss-border/40 rounded-xl px-4 py-2 text-white" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] uppercase font-fantasy tracking-wider text-abyss-muted">Gold Reward</label>
                                                <input type="number" required value={formData.coinsReward || 50} onChange={(e) => setFormData({ ...formData, coinsReward: Number(e.target.value) })} className="w-full bg-black/45 border border-abyss-border/40 rounded-xl px-4 py-2 text-white" />
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* ACHIEVEMENT FORM */}
                                {activeTab === 'achievements' && (
                                    <>
                                        <div className="space-y-1">
                                            <label className="text-[10px] uppercase font-fantasy tracking-wider text-abyss-muted">Achievement Title</label>
                                            <input type="text" required value={formData.title || ''} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full bg-black/45 border border-abyss-border/40 rounded-xl px-4 py-2 text-white" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] uppercase font-fantasy tracking-wider text-abyss-muted">Description</label>
                                            <textarea required value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full bg-black/45 border border-abyss-border/40 rounded-xl px-4 py-2 text-white h-20" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-[10px] uppercase font-fantasy tracking-wider text-abyss-muted">Rarity</label>
                                                <select value={formData.rarity || 'Common'} onChange={(e) => setFormData({ ...formData, rarity: e.target.value })} className="w-full bg-black border border-abyss-border/40 text-xs px-3 py-2 rounded-xl text-white">
                                                    <option value="Common">Common</option>
                                                    <option value="Rare">Rare</option>
                                                    <option value="Epic">Epic</option>
                                                    <option value="Legendary">Legendary</option>
                                                </select>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] uppercase font-fantasy tracking-wider text-abyss-muted">Gold Bounty</label>
                                                <input type="number" required value={formData.rewardCoins || 50} onChange={(e) => setFormData({ ...formData, rewardCoins: Number(e.target.value) })} className="w-full bg-black/45 border border-abyss-border/40 rounded-xl px-4 py-2 text-white" />
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* CONTEST FORM */}
                                {activeTab === 'contests' && (
                                    <>
                                        <div className="space-y-1">
                                            <label className="text-[10px] uppercase font-fantasy tracking-wider text-abyss-muted">Contest Title</label>
                                            <input type="text" required value={formData.title || ''} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full bg-black/45 border border-abyss-border/40 rounded-xl px-4 py-2 text-white" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] uppercase font-fantasy tracking-wider text-abyss-muted">Description</label>
                                            <textarea required value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full bg-black/45 border border-abyss-border/40 rounded-xl px-4 py-2 text-white h-16" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-[10px] uppercase font-fantasy tracking-wider text-abyss-muted">Contest Type</label>
                                                <select value={formData.type || 'Weekly Contest'} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full bg-black border border-abyss-border/40 text-xs px-3 py-2 rounded-xl text-white">
                                                    <option value="Daily Challenge">Daily Challenge</option>
                                                    <option value="Weekly Contest">Weekly Contest</option>
                                                    <option value="Monthly Championship">Monthly Championship</option>
                                                    <option value="Virtual Contest">Virtual Contest</option>
                                                    <option value="Practice Contest">Practice Contest</option>
                                                </select>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] uppercase font-fantasy tracking-wider text-abyss-muted">Difficulty</label>
                                                <select value={formData.difficulty || 'Mixed'} onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })} className="w-full bg-black border border-abyss-border/40 text-xs px-3 py-2 rounded-xl text-white">
                                                    <option value="Easy">Easy</option>
                                                    <option value="Medium">Medium</option>
                                                    <option value="Hard">Hard</option>
                                                    <option value="Mixed">Mixed</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-[10px] uppercase font-fantasy tracking-wider text-abyss-muted">Start Time</label>
                                                <input type="datetime-local" required value={formData.startTime || ''} onChange={(e) => setFormData({ ...formData, startTime: e.target.value })} className="w-full bg-black/45 border border-abyss-border/40 rounded-xl px-4 py-2 text-white" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] uppercase font-fantasy tracking-wider text-abyss-muted">End Time</label>
                                                <input type="datetime-local" required value={formData.endTime || ''} onChange={(e) => setFormData({ ...formData, endTime: e.target.value })} className="w-full bg-black/45 border border-abyss-border/40 rounded-xl px-4 py-2 text-white" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2">
                                            <div className="space-y-1">
                                                <label className="text-[10px] uppercase font-fantasy tracking-wider text-abyss-muted">Duration (Mins)</label>
                                                <input type="number" required value={formData.duration || 120} onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })} className="w-full bg-black/45 border border-abyss-border/40 rounded-xl px-4 py-2 text-white" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] uppercase font-fantasy tracking-wider text-abyss-muted">Max lobby slots</label>
                                                <input type="number" required value={formData.maxParticipants || 1000} onChange={(e) => setFormData({ ...formData, maxParticipants: Number(e.target.value) })} className="w-full bg-black/45 border border-abyss-border/40 rounded-xl px-4 py-2 text-white" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] uppercase font-fantasy tracking-wider text-abyss-muted">Banner URL</label>
                                                <input type="text" value={formData.bannerImage || ''} onChange={(e) => setFormData({ ...formData, bannerImage: e.target.value })} className="w-full bg-black/45 border border-abyss-border/40 rounded-xl px-4 py-2 text-white" />
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] uppercase font-fantasy tracking-wider text-abyss-muted">Problem IDs (comma separated)</label>
                                            <input 
                                                type="text" 
                                                placeholder="Problem ObjectId list..."
                                                value={Array.isArray(formData.problems) ? formData.problems.join(', ') : (formData.problems || '')} 
                                                onChange={(e) => setFormData({ ...formData, problems: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} 
                                                className="w-full bg-black/45 border border-abyss-border/40 rounded-xl px-4 py-2 text-white" 
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-[10px] uppercase font-fantasy tracking-wider text-abyss-muted">XP Reward</label>
                                                <input type="number" value={formData.rewards?.xp || 500} onChange={(e) => setFormData({ ...formData, rewards: { ...formData.rewards, xp: Number(e.target.value) } })} className="w-full bg-black/45 border border-abyss-border/40 rounded-xl px-4 py-2 text-white" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] uppercase font-fantasy tracking-wider text-abyss-muted">Gold Reward</label>
                                                <input type="number" value={formData.rewards?.coins || 100} onChange={(e) => setFormData({ ...formData, rewards: { ...formData.rewards, coins: Number(e.target.value) } })} className="w-full bg-black/45 border border-abyss-border/40 rounded-xl px-4 py-2 text-white" />
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div className="pt-4 border-t border-abyss-border/20 flex space-x-2">
                                    <PrimaryButton type="submit" disabled={actionLoading} className="flex-1 py-2">
                                        {actionLoading ? 'Verifying...' : 'Forge Configurations'}
                                    </PrimaryButton>
                                    <SecondaryButton onClick={() => setShowModal(false)} className="py-2">
                                        Retreat
                                    </SecondaryButton>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default Admin;
