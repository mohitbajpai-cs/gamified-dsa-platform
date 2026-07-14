const Notification = require('../models/notification.model');

class NotificationService {
    async createNotification({ recipient, sender, type, title, message, data }) {
        return await Notification.create({
            recipient,
            sender,
            type,
            title,
            message,
            data
        });
    }

    async getNotifications(userId) {
        return await Notification.find({ recipient: userId })
            .populate('sender', 'username')
            .sort({ createdAt: -1 });
    }

    async markAsRead(notificationId, userId) {
        return await Notification.findOneAndUpdate(
            { _id: notificationId, recipient: userId },
            { isRead: true },
            { new: true }
        );
    }

    async markAllAsRead(userId) {
        return await Notification.updateMany(
            { recipient: userId, isRead: false },
            { isRead: true }
        );
    }

    async deleteNotification(notificationId, userId) {
        return await Notification.findOneAndDelete({ _id: notificationId, recipient: userId });
    }

    async getUnreadCount(userId) {
        return await Notification.countDocuments({ recipient: userId, isRead: false });
    }
}

module.exports = new NotificationService();
