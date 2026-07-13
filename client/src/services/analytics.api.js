import api from './api';

export const getUserAnalyticsApi = async () => {
    const res = await api.get('/analytics/user');
    return res.data;
};

export const getAdminAnalyticsApi = async () => {
    const res = await api.get('/analytics/admin');
    return res.data;
};

export const getActivityAnalyticsApi = async () => {
    const res = await api.get('/analytics/activity');
    return res.data;
};

export const getTopicMasteryAnalyticsApi = async () => {
    const res = await api.get('/analytics/topic-mastery');
    return res.data;
};
