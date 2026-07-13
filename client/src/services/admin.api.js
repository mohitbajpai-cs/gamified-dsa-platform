import api from './api';

// Worlds Admin CRUD
export const adminGetWorldsApi = async () => (await api.get('/admin/worlds')).data;
export const adminCreateWorldApi = async (data) => (await api.post('/admin/worlds', data)).data;
export const adminUpdateWorldApi = async (id, data) => (await api.put(`/admin/worlds/${id}`, data)).data;
export const adminDeleteWorldApi = async (id) => (await api.delete(`/admin/worlds/${id}`)).data;

// Topics Admin CRUD
export const adminGetTopicsApi = async () => (await api.get('/admin/topics')).data;
export const adminCreateTopicApi = async (data) => (await api.post('/admin/topics', data)).data;
export const adminUpdateTopicApi = async (id, data) => (await api.put(`/admin/topics/${id}`, data)).data;
export const adminDeleteTopicApi = async (id) => (await api.delete(`/admin/topics/${id}`)).data;

// Problems Admin CRUD
export const adminGetProblemsApi = async () => (await api.get('/admin/problems')).data;
export const adminCreateProblemApi = async (data) => (await api.post('/admin/problems', data)).data;
export const adminUpdateProblemApi = async (id, data) => (await api.put(`/admin/problems/${id}`, data)).data;
export const adminDeleteProblemApi = async (id) => (await api.delete(`/admin/problems/${id}`)).data;

// TestCases Admin CRUD
export const adminGetTestCasesApi = async () => (await api.get('/admin/testcases')).data;
export const adminCreateTestCaseApi = async (data) => (await api.post('/admin/testcases', data)).data;
export const adminUpdateTestCaseApi = async (id, data) => (await api.put(`/admin/testcases/${id}`, data)).data;
export const adminDeleteTestCaseApi = async (id) => (await api.delete(`/admin/testcases/${id}`)).data;

// Database Seeder
export const adminSeedDatabaseApi = async (fullReset = false) => (await api.post('/admin/seed', { fullReset })).data;
