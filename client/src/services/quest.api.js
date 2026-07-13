import api from './api';

export const getDailyQuestsApi = async () => {
    const response = await api.get('/quests/daily');
    return response.data;
};

export const getWeeklyQuestsApi = async () => {
    const response = await api.get('/quests/weekly');
    return response.data;
};

export const claimQuestApi = async (questId) => {
    const response = await api.post('/quests/claim', { questId });
    return response.data;
};

export const getAchievementsApi = async () => {
    const response = await api.get('/achievements');
    return response.data;
};

export const claimDailyLoginApi = async () => {
    const response = await api.post('/rewards/daily');
    return response.data;
};
