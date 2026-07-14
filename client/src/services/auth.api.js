import api from './api';

export const loginApi = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
};

export const registerApi = async (username, email, password) => {
    console.log("registerApi called", { username, email });
    console.log("Axios request sent to /auth/register");
    try {
        const response = await api.post('/auth/register', { username, email, password });
        console.log("Backend response received successfully:", response.data);
        return response.data;
    } catch (err) {
        console.error("Backend request failed in registerApi:", err);
        throw err;
    }
};

export const logoutApi = async () => {
    const response = await api.post('/auth/logout');
    return response.data;
};

export const getProfileApi = async () => {
    const response = await api.get('/auth/profile');
    return response.data;
};
