import api from './api';

export const submitSolutionApi = async (problemId, code, language, isSubmit = false) => {
    const response = await api.post('/submission', { problemId, code, language, isSubmit });
    return response.data;
};

export const getSubmissionsHistoryApi = async () => {
    const response = await api.get('/submissions');
    return response.data;
};

export const getProblemSubmissionsApi = async (problemId) => {
    const response = await api.get(`/submissions/${problemId}`);
    return response.data;
};
