import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import PublicLayout from '../layouts/PublicLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import PublicRoute from './PublicRoute';
import ProtectedRoute from './ProtectedRoute';
import FullPageLoader from '../components/feedback/FullPageLoader';

const Landing = lazy(() => import('../pages/Landing'));
const Login = lazy(() => import('../pages/auth/Login'));
const Register = lazy(() => import('../pages/auth/Register'));
const CommandCenter = lazy(() => import('../pages/dashboard/Dashboard'));
const Worlds = lazy(() => import('../pages/worlds/Worlds'));
const RealmDetails = lazy(() => import('../pages/worlds/RealmDetails'));
const ProblemList = lazy(() => import('../pages/worlds/ProblemList'));
const ProblemDetails = lazy(() => import('../pages/worlds/ProblemDetails'));
const CodingArena = lazy(() => import('../pages/worlds/CodingArena'));
const Profile = lazy(() => import('../pages/profile/Profile'));
const Settings = lazy(() => import('../pages/profile/Settings'));
const Leaderboard = lazy(() => import('../pages/leaderboard/Leaderboard'));
const Achievements = lazy(() => import('../pages/achievements/Achievements'));
const Admin = lazy(() => import('../pages/admin/Admin'));
const Quests = lazy(() => import('../pages/quests/Quests'));
const Trials = lazy(() => import('../pages/trials/Trials'));
const Guild = lazy(() => import('../pages/social/Guild'));
const Notifications = lazy(() => import('../pages/social/Notifications'));
const Analytics = lazy(() => import('../pages/analytics/Analytics'));
const ContestsHub = lazy(() => import('../pages/contests/ContestsHub'));
const ContestDetails = lazy(() => import('../pages/contests/ContestDetails'));
const ContestArena = lazy(() => import('../pages/contests/ContestArena'));
const NotFound = lazy(() => import('../pages/NotFound'));

const AppRoutes = () => {
    return (
        <Suspense fallback={<FullPageLoader />}>
            <Routes>
                {/* Public Routes */}
                <Route element={<PublicLayout />}>
                    <Route 
                        path={ROUTES.LANDING} 
                        element={
                            <PublicRoute>
                                <Landing />
                            </PublicRoute>
                        } 
                    />
                    <Route
                        path={ROUTES.LOGIN}
                        element={
                            <PublicRoute>
                                <Login />
                            </PublicRoute>
                        }
                    />
                    <Route
                        path={ROUTES.REGISTER}
                        element={
                            <PublicRoute>
                                <Register />
                            </PublicRoute>
                        }
                    />
                </Route>

                {/* Protected Routes inside Dashboard Layout */}
                <Route
                    element={
                        <ProtectedRoute>
                            <DashboardLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route path="/" element={<Navigate to={ROUTES.WORLDS} replace />} />
                    <Route path="/home" element={<Worlds />} />
                    <Route path={ROUTES.DASHBOARD} element={<Navigate to={ROUTES.WORLDS} replace />} />
                    <Route path={ROUTES.WORLDS} element={<Worlds />} />
                    <Route path={ROUTES.COMMAND_CENTER} element={<CommandCenter />} />
                    <Route path={ROUTES.REALM_DETAILS} element={<RealmDetails />} />
                    <Route path={ROUTES.TOPIC_PROBLEMS} element={<ProblemList />} />
                    <Route path={ROUTES.PROBLEM_DETAILS} element={<ProblemDetails />} />
                    <Route path={ROUTES.ARENA} element={<CodingArena />} />
                    <Route path={ROUTES.PROFILE} element={<Profile />} />
                    <Route path={ROUTES.SETTINGS} element={<Settings />} />
                    <Route path={ROUTES.LEADERBOARD} element={<Leaderboard />} />
                    <Route path={ROUTES.ACHIEVEMENTS} element={<Achievements />} />
                    <Route path={ROUTES.ADMIN} element={<Admin />} />
                    <Route path={ROUTES.QUESTS} element={<Quests />} />
                    <Route path={ROUTES.TRIALS} element={<Trials />} />
                    <Route path={ROUTES.GUILD} element={<Guild />} />
                    <Route path={ROUTES.NOTIFICATIONS} element={<Notifications />} />
                    <Route path={ROUTES.ANALYTICS} element={<Analytics />} />
                    
                    {/* Contests routing specifications */}
                    <Route path="/contests" element={<ContestsHub />} />
                    <Route path="/contests/:id" element={<ContestDetails />} />
                    <Route path="/contests/:contestId/arena/:problemId" element={<ContestArena />} />
                    <Route path="/contest/:id" element={<ContestDetails />} />
                    <Route path="/contest/:contestId/arena/:problemId" element={<ContestArena />} />
                    <Route path="/contest/:id/arena" element={<ContestArena />} />
                </Route>

                {/* Fallback 404 */}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </Suspense>
    );
};

export default AppRoutes;
