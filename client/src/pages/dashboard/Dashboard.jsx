import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getProgressApi } from '../../services/progress.api';
import { motion } from 'framer-motion';

// Lazy Loaded Widgets
const HeroSection = lazy(() => import('../../components/dashboard/HeroSection'));
const CharacterCard = lazy(() => import('../../components/dashboard/CharacterCard'));
const XPCard = lazy(() => import('../../components/dashboard/XPCard'));
const LevelCard = lazy(() => import('../../components/dashboard/LevelCard'));
const RankCard = lazy(() => import('../../components/dashboard/RankCard'));
const CoinsCard = lazy(() => import('../../components/dashboard/CoinsCard'));
const QuestCard = lazy(() => import('../../components/dashboard/QuestCard'));
const AchievementCard = lazy(() => import('../../components/dashboard/AchievementCard'));
const StatsCard = lazy(() => import('../../components/dashboard/StatsCard'));
const RealmPreview = lazy(() => import('../../components/dashboard/RealmPreview'));
const LeaderboardPreview = lazy(() => import('../../components/dashboard/LeaderboardPreview'));
const ActivityCard = lazy(() => import('../../components/dashboard/ActivityCard'));
const RecentNotificationsCard = lazy(() => import('../../components/dashboard/RecentNotificationsCard'));
const GuildSummaryCard = lazy(() => import('../../components/dashboard/GuildSummaryCard'));
const FriendActivityCard = lazy(() => import('../../components/dashboard/FriendActivityCard'));
import DailyRewardModal from '../../components/dashboard/DailyRewardModal';
import { getAllBossesApi, getBossRewardsApi } from '../../services/boss.api';

const CardSkeleton = () => (
    <div className="bg-abyss-card/50 border border-abyss-border/40 rounded-xl p-6 h-48 animate-pulse flex flex-col justify-between">
        <div className="h-4 bg-abyss-border/30 rounded w-1/3"></div>
        <div className="space-y-3">
            <div className="h-3.5 bg-abyss-border/30 rounded w-full"></div>
            <div className="h-3.5 bg-abyss-border/30 rounded w-5/6"></div>
        </div>
        <div className="h-8 bg-abyss-border/30 rounded w-full mt-4"></div>
    </div>
);

const Dashboard = () => {
    const { user, progress, refreshProgress } = useAuth();
    const [loading, setLoading] = useState(!progress);
    const [bossesList, setBossesList] = useState([]);
    const [bossRewards, setBossRewards] = useState(null);

    useEffect(() => {
        const syncProgress = async () => {
            if (!progress) {
                setLoading(true);
            }
            await refreshProgress();
            setLoading(false);
        };
        
        const loadBossData = async () => {
            try {
                const [bossesRes, rewardsRes] = await Promise.all([
                    getAllBossesApi(),
                    getBossRewardsApi()
                ]);
                if (bossesRes.success && bossesRes.data) {
                    setBossesList(bossesRes.data);
                }
                if (rewardsRes.success && rewardsRes.data) {
                    setBossRewards(rewardsRes.data);
                }
            } catch (err) {
                console.error('Failed to load dashboard boss data:', err);
            }
        };

        syncProgress();
        loadBossData();
    }, [progress ? null : refreshProgress]);

    // Extract values dynamically from backend progress response
    const totalXp = progress?.totalXP ?? user?.xp ?? 0;
    const currentLevel = progress?.currentLevel ?? user?.level ?? 1;
    const nextLevelXp = progress?.nextLevelXP ?? 100;
    const totalCoins = progress?.totalCoins ?? user?.coins ?? 0;
    const currentStreak = progress?.currentStreak ?? 0;
    const completedProblems = progress?.completedProblems || [];
    const unlockedWorlds = progress?.unlockedWorlds || [];
    const currentWorld = progress?.currentWorld;
    const progressPercentage = progress?.progressPercentage ?? 0;

    // Derived active quest based on current unlocked world
    const activeQuest = currentWorld ? {
        title: `Explore ${currentWorld.name}`,
        description: `Refine your spells inside ${currentWorld.name} Dungeons. Current progress: ${progressPercentage}%`,
        xpReward: currentWorld.unlockLevel * 100,
        coinReward: currentWorld.unlockLevel * 25
    } : null;

    // Derived latest achievement
    const latestAchievementTitle = user?.achievements?.length > 0 ? user.achievements[user.achievements.length - 1] : null;
    const latestAchievement = latestAchievementTitle ? {
        title: latestAchievementTitle,
        description: 'Unlocked during your trials.',
        rarity: 'Common'
    } : null;

    const statistics = {
        totalXp,
        coins: totalCoins,
        problemsSolved: completedProblems.length,
        completedWorlds: Math.max(0, unlockedWorlds.length - 1),
        achievements: user?.achievements?.length || 0,
        currentStreak,
        realmCompletionPct: Math.round((completedProblems.length / 81) * 100),
        bossesDefeated: bossRewards?.defeatedBosses?.length || user?.bossesDefeated?.length || 0,
        currentBoss: bossesList.find(b => b.unlocked && !b.defeated)?.bossName || 'None',
        latestTrophy: bossRewards?.trophies?.length > 0 ? bossRewards.trophies[bossRewards.trophies.length - 1] : (bossRewards?.relics?.length > 0 ? bossRewards.relics[bossRewards.relics.length - 1] : 'None')
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 80, damping: 15 }}
            className="space-y-6 lg:space-y-8"
        >
            <DailyRewardModal />
            {/* Ambient Background gradient glows */}
            <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-abyss-primary/10 rounded-full blur-[100px] pointer-events-none"></div>

            {/* Header Titles */}
            <div>
                <h1 className="font-fantasy text-3xl font-bold text-white tracking-widest uppercase">
                    Valthor Command Center
                </h1>
                <p className="font-sans text-xs text-abyss-muted">
                    Control your combat statistics, active daily quests, and dungeon progression.
                </p>
            </div>

            <Suspense fallback={<CardSkeleton />}>
                {/* 1. Hero Section (Full Width) */}
                <HeroSection progress={progress} user={user} />
            </Suspense>

            {/* 2. Grid Row 1 (4 columns: Character, XP, Level, Rank) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Suspense fallback={<CardSkeleton />}>
                    <CharacterCard user={user} currentWorldName={currentWorld?.name} />
                </Suspense>
                <Suspense fallback={<CardSkeleton />}>
                    <XPCard xp={totalXp} nextLevelXp={nextLevelXp} />
                </Suspense>
                <Suspense fallback={<CardSkeleton />}>
                    <LevelCard level={currentLevel} />
                </Suspense>
                <Suspense fallback={<CardSkeleton />}>
                    <RankCard rank={user?.rank || 'Novice'} />
                </Suspense>
            </div>

            {/* 3. Grid Row 2 (3 columns: Statistics, Daily Quest, Recent Achievement) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Suspense fallback={<CardSkeleton />}>
                    <StatsCard stats={statistics} />
                </Suspense>
                <Suspense fallback={<CardSkeleton />}>
                    <QuestCard currentQuest={activeQuest} />
                </Suspense>
                <Suspense fallback={<CardSkeleton />}>
                    <AchievementCard achievement={latestAchievement} />
                </Suspense>
            </div>

            {/* 4. Grid Row 3 (3 columns: Realm Preview, Leaderboard Preview, Recent Activity) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Suspense fallback={<CardSkeleton />}>
                    <RealmPreview nextRealm={currentWorld} progressPercentage={progressPercentage} />
                </Suspense>
                <Suspense fallback={<CardSkeleton />}>
                    <LeaderboardPreview currentUser={user} />
                </Suspense>
                <Suspense fallback={<CardSkeleton />}>
                    <ActivityCard />
                </Suspense>
            </div>

            {/* 5. Grid Row 4 (Social & Alliance Factions) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Suspense fallback={<CardSkeleton />}>
                    <RecentNotificationsCard />
                </Suspense>
                <Suspense fallback={<CardSkeleton />}>
                    <GuildSummaryCard />
                </Suspense>
                <Suspense fallback={<CardSkeleton />}>
                    <FriendActivityCard />
                </Suspense>
            </div>
        </motion.div>
    );
};

export default Dashboard;
