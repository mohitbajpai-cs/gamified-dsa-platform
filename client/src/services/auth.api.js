import api from './api';

export const loginApi = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
};

export const registerApi = async (username, email, password) => {
    const response = await api.post('/auth/register', { username, email, password });
    return response.data;
};

export const logoutApi = async () => {
    const response = await api.post('/auth/logout');
    return response.data;
};

export const getProfileApi = async () => {
    const response = await api.get('/auth/profile');
    return response.data;
};
