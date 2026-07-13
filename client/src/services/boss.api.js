import api from './api';

export const getAllBossesApi = async () => {
    const response = await api.get('/bosses');
    return response.data;
};

export const getBossByRealmIdApi = async (realmId) => {
    const response = await api.get(`/boss/${realmId}`);
    return response.data;
};

export const submitBossSolutionApi = async (realmId, code, language) => {
    const response = await api.post('/boss/submit', { realmId, code, language });
    return response.data;
};

export const getBossRewardsApi = async () => {
    const response = await api.get('/boss/rewards');
    return response.data;
};
