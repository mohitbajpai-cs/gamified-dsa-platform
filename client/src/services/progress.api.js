import api from './api';

export const getProgressApi = async () => {
    const response = await api.get('/progress');
    return response.data;
};

export const getProfileStatsApi = async () => {
    const response = await api.get('/profile/stats');
    return response.data;
};

export const getLeaderboardApi = async () => {
    const response = await api.get('/leaderboard');
    return response.data;
};
