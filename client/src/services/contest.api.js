import api from './api';

export const getContestsApi = async () => {
    const res = await api.get('/contests');
    return res.data;
};

export const getContestByIdApi = async (id) => {
    const res = await api.get(`/contests/${id}`);
    return res.data;
};

export const registerContestApi = async (id) => {
    const res = await api.post('/contests/register', { id });
    return res.data;
};

export const startContestApi = async (id) => {
    const res = await api.post('/contests/start', { id });
    return res.data;
};

export const submitContestSolutionApi = async ({ contestId, problemId, code, language }) => {
    const res = await api.post('/contests/submit', { contestId, problemId, code, language });
    return res.data;
};

export const getContestLeaderboardApi = async (id) => {
    const res = await api.get(`/contests/${id}/leaderboard`);
    return res.data;
};

export const getContestHistoryApi = async () => {
    const res = await api.get('/contests/history');
    return res.data;
};

// Admin CRUD
export const adminCreateContestApi = async (data) => {
    const res = await api.post('/contests/admin', data);
    return res.data;
};

export const adminUpdateContestApi = async (id, data) => {
    const res = await api.put(`/contests/admin/${id}`, data);
    return res.data;
};

export const adminDeleteContestApi = async (id) => {
    const res = await api.delete(`/contests/admin/${id}`);
    return res.data;
};
