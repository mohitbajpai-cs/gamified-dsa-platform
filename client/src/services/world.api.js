import api from './api';

export const getWorldsApi = async () => {
    const response = await api.get('/worlds');
    return response.data;
};

export const getWorldByIdApi = async (id) => {
    const response = await api.get(`/worlds/${id}`);
    return response.data;
};

export const getTopicsByWorldApi = async (worldId) => {
    const response = await api.get(`/topics/${worldId}`);
    return response.data;
};

export const getProblemsByTopicApi = async (topicId) => {
    const response = await api.get(`/problems/${topicId}`);
    return response.data;
};

export const getProblemByIdApi = async (id) => {
    const response = await api.get(`/problem/${id}`);
    return response.data;
};
