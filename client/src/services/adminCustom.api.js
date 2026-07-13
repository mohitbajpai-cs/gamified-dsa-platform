import api from './api';

export const getAdminStatsApi = async () => {
    const res = await api.get('/admin/dashboard/stats');
    return res.data;
};

export const getAdminAnalyticsApi = async () => {
    const res = await api.get('/admin/dashboard/analytics');
    return res.data;
};

export const getAdminUsersApi = async (params) => {
    const res = await api.get('/admin/users', { params });
    return res.data;
};

export const updateUserRoleApi = async (id, role) => {
    const res = await api.put(`/admin/users/${id}/role`, { role });
    return res.data;
};

export const resetUserXpApi = async (id) => {
    const res = await api.post(`/admin/users/${id}/reset-xp`);
    return res.data;
};

export const resetUserCoinsApi = async (id) => {
    const res = await api.post(`/admin/users/${id}/reset-coins`);
    return res.data;
};

export const resetUserProgressApi = async (id) => {
    const res = await api.post(`/admin/users/${id}/reset-progress`);
    return res.data;
};

export const deleteUserApi = async (id) => {
    const res = await api.delete(`/admin/users/${id}`);
    return res.data;
};

// Quests CRUD
export const getAdminQuestsApi = async () => {
    const res = await api.get('/admin/quests');
    return res.data;
};

export const createAdminQuestApi = async (data) => {
    const res = await api.post('/admin/quests', data);
    return res.data;
};

export const updateAdminQuestApi = async (id, data) => {
    const res = await api.put(`/admin/quests/${id}`, data);
    return res.data;
};

export const deleteAdminQuestApi = async (id) => {
    const res = await api.delete(`/admin/quests/${id}`);
    return res.data;
};

// Achievements CRUD
export const getAdminAchievementsApi = async () => {
    const res = await api.get('/admin/achievements');
    return res.data;
};

export const createAdminAchievementApi = async (data) => {
    const res = await api.post('/admin/achievements', data);
    return res.data;
};

export const updateAdminAchievementApi = async (id, data) => {
    const res = await api.put(`/admin/achievements/${id}`, data);
    return res.data;
};

export const deleteAdminAchievementApi = async (id) => {
    const res = await api.delete(`/admin/achievements/${id}`);
    return res.data;
};

// Bosses CRUD
export const getAdminBossesApi = async () => {
    const res = await api.get('/admin/bosses');
    return res.data;
};

export const createAdminBossApi = async (data) => {
    const res = await api.post('/admin/bosses', data);
    return res.data;
};

export const updateAdminBossApi = async (id, data) => {
    const res = await api.put(`/admin/bosses/${id}`, data);
    return res.data;
};

export const deleteAdminBossApi = async (id) => {
    const res = await api.delete(`/admin/bosses/${id}`);
    return res.data;
};
