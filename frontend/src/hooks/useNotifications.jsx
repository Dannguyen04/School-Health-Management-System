import { useState, useEffect, useCallback } from "react";
import { parentAPI } from "../utils/api.js";

export const useNotifications = (userId, options = {}) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const {
        type,
        status,
        autoRefresh = true,
        refreshInterval = 30000,
    } = options;

    const fetchNotifications = useCallback(async () => {
        if (!userId) return;

        try {
            setLoading(true);
            setError(null);

            const params = {};
            if (type) params.type = type;
            if (status) params.status = status;

            const response = await parentAPI.getNotifications(params);
            if (response.data.success) {
                setNotifications(response.data.data);
            }
        } catch (err) {
            console.error("Error fetching notifications:", err);
            setError("Không thể tải thông báo");
        } finally {
            setLoading(false);
        }
    }, [userId, type, status]);

    const fetchUnreadCount = useCallback(async () => {
        if (!userId || status === "ARCHIVED") return;

        try {
            const response = await parentAPI.getUnreadNotificationCount();
            if (response.data.success) {
                setUnreadCount(response.data.data.count);
            }
        } catch (err) {
            console.error("Error fetching unread count:", err);
        }
    }, [userId, status]);

    const markAsRead = useCallback(
        async (notificationId) => {
            try {
                await parentAPI.updateNotificationStatus(
                    notificationId,
                    "READ"
                );
                await fetchUnreadCount();
                await fetchNotifications();
                return true;
            } catch (err) {
                console.error("Error marking notification as read:", err);
                return false;
            }
        },
        [fetchUnreadCount, fetchNotifications]
    );

    const deleteNotification = useCallback(
        async (notificationId) => {
            try {
                await parentAPI.deleteNotification(notificationId);
                await fetchUnreadCount();
                await fetchNotifications();
                return true;
            } catch (err) {
                console.error("Error deleting notification:", err);
                return false;
            }
        },
        [fetchUnreadCount, fetchNotifications]
    );

    const archiveNotification = useCallback(
        async (notificationId) => {
            try {
                await parentAPI.archiveNotification(notificationId);
                await fetchUnreadCount();
                await fetchNotifications();
                return true;
            } catch (err) {
                console.error("Error archiving notification:", err);
                return false;
            }
        },
        [fetchUnreadCount, fetchNotifications]
    );

    const restoreNotification = useCallback(
        async (notificationId) => {
            try {
                await parentAPI.restoreNotification(notificationId);
                await fetchUnreadCount();
                await fetchNotifications();
                return true;
            } catch (err) {
                console.error("Error restoring notification:", err);
                return false;
            }
        },
        [fetchUnreadCount, fetchNotifications]
    );

    // Initial fetch
    useEffect(() => {
        fetchNotifications();
        fetchUnreadCount();
    }, [fetchNotifications, fetchUnreadCount]);

    // Auto refresh
    useEffect(() => {
        if (!autoRefresh) return;

        const interval = setInterval(() => {
            fetchNotifications();
            fetchUnreadCount();
        }, refreshInterval);

        return () => clearInterval(interval);
    }, [autoRefresh, refreshInterval, fetchNotifications, fetchUnreadCount]);

    return {
        notifications,
        unreadCount,
        loading,
        error,
        refresh: fetchNotifications,
        markAsRead,
        deleteNotification,
        archiveNotification,
        restoreNotification,
    };
};
