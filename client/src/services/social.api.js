import api from './api';

// -------------------------------------------------------------
// FRIENDS API
// -------------------------------------------------------------
export const sendFriendRequestApi = async (username) => {
    const res = await api.post('/social/friends/request', { username });
    return res.data;
};

export const acceptFriendRequestApi = async (friendshipId) => {
    const res = await api.put(`/social/friends/request/${friendshipId}/accept`);
    return res.data;
};

export const rejectFriendRequestApi = async (friendshipId) => {
    const res = await api.put(`/social/friends/request/${friendshipId}/reject`);
    return res.data;
};

export const removeFriendApi = async (friendId) => {
    const res = await api.delete(`/social/friends/${friendId}`);
    return res.data;
};

export const getFriendsApi = async () => {
    const res = await api.get('/social/friends');
    return res.data;
};

export const getPendingRequestsApi = async () => {
    const res = await api.get('/social/friends/requests/pending');
    return res.data;
};

export const searchUsersApi = async (query) => {
    const res = await api.get(`/social/users/search?q=${query}`);
    return res.data;
};

// -------------------------------------------------------------
// GUILD API
// -------------------------------------------------------------
export const createGuildApi = async (data) => {
    const res = await api.post('/social/guilds', data);
    return res.data;
};

export const joinGuildApi = async (inviteCode) => {
    const res = await api.post('/social/guilds/join', { inviteCode });
    return res.data;
};

export const leaveGuildApi = async () => {
    const res = await api.post('/social/guilds/leave');
    return res.data;
};

export const transferGuildOwnershipApi = async (newOwnerId) => {
    const res = await api.post('/social/guilds/transfer', { newOwnerId });
    return res.data;
};

export const exileGuildMemberApi = async (memberId) => {
    const res = await api.delete(`/social/guilds/exile/${memberId}`);
    return res.data;
};

export const getGuildMeApi = async () => {
    const res = await api.get('/social/guilds/me');
    return res.data;
};

export const getGuildLeaderboardApi = async () => {
    const res = await api.get('/social/guilds/leaderboard');
    return res.data;
};

// -------------------------------------------------------------
// NOTIFICATIONS API
// -------------------------------------------------------------
export const getNotificationsApi = async () => {
    const res = await api.get('/social/notifications');
    return res.data;
};

export const getUnreadNotificationsCountApi = async () => {
    const res = await api.get('/social/notifications/unread-count');
    return res.data;
};

export const markNotificationReadApi = async (id) => {
    const res = await api.put(`/social/notifications/${id}/read`);
    return res.data;
};

export const markAllNotificationsReadApi = async () => {
    const res = await api.put('/social/notifications/read/all');
    return res.data;
};

export const deleteNotificationApi = async (id) => {
    const res = await api.delete(`/social/notifications/${id}`);
    return res.data;
};
