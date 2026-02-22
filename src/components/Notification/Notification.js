import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './Notification.css';

const Notification = ({ language }) => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (user) {
            fetchNotifications();
            // Check for new notifications every 5 minutes
            const interval = setInterval(fetchNotifications, 5 * 60 * 1000);
            return () => clearInterval(interval);
        }
    }, [user]);

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/notifications', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setNotifications(data || []);
                setUnreadCount(data.filter(n => !n.isRead).length || 0);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
            // Fallback to localStorage for offline functionality
            fallbackToLocalNotifications();
        }
    };

    const fallbackToLocalNotifications = () => {
        // Check for overdue reports and create notifications
        const reports = JSON.parse(localStorage.getItem('kpiReports') || '[]');
        const today = new Date();
        const overdueNotifications = [];

        // Check if any office hasn't submitted a report in the last 2 days
        const offices = JSON.parse(localStorage.getItem('offices') || '[]');
        offices.forEach(office => {
            const officeReports = reports.filter(r => r.officeId === office.id);
            if (officeReports.length > 0) {
                const lastReport = officeReports.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
                const daysSinceLastReport = Math.floor((today - new Date(lastReport.date)) / (1000 * 60 * 60 * 24));

                if (daysSinceLastReport > 2) {
                    overdueNotifications.push({
                        id: `overdue-${office.id}`,
                        type: 'overdue',
                        title: language === 'am' ? 'ያልተላከ ሪፖርት' : 'Overdue Report',
                        message: language === 'am'
                            ? `${office.name_am} በ ${daysSinceLastReport} ቀናት ሪፖርት አልላከም`
                            : `${office.name_en} has not submitted a report in ${daysSinceLastReport} days`,
                        timestamp: new Date().toISOString(),
                        urgent: daysSinceLastReport > 5,
                        isRead: false
                    });
                }
            }
        });

        // Add notification for new office added
        overdueNotifications.push({
            id: `new-office-public-service-hr-development`,
            type: 'new',
            title: language === 'am' ? 'አዲስ ቢሮ ተያዘ' : 'New Office Added',
            message: language === 'am'
                ? 'የፐብሊክ ሰርቪስና የሰው ሀብት ልማት ጽ/ቤት ተያዘ'
                : 'Public Service and Human Resource Development Office has been added',
            timestamp: new Date().toISOString(),
            urgent: false,
            isRead: false
        });

        setNotifications(overdueNotifications);
        setUnreadCount(overdueNotifications.filter(n => !n.isRead).length);
    };

    const markAsRead = async (notificationId) => {
        try {
            const token = localStorage.getItem('token');
            await fetch(`/api/notifications/${notificationId}/read`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            fetchNotifications(); // Refresh notifications
        } catch (error) {
            console.error('Error marking notification as read:', error);
            // Fallback for local notifications
            setNotifications(prev => prev ? prev.map(n =>
                n.id === notificationId ? { ...n, isRead: true } : n
            ) : []);
            setUnreadCount(prev => Math.max(0, prev - 1));
        }
    };

    const markAllAsRead = async () => {
        try {
            const token = localStorage.getItem('token');
            await fetch('/api/notifications/mark-all-read', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            fetchNotifications(); // Refresh notifications
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            // Fallback for local notifications
            setNotifications(prev => prev ? prev.map(n => ({ ...n, isRead: true })) : []);
            setUnreadCount(0);
        }
    };

    const requestNotificationPermission = () => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    };

    const showBrowserNotification = (notification) => {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(notification.title, {
                body: notification.message,
                icon: '/favicon.ico'
            });
        }
    };

    const dismissNotification = (id) => {
        setNotifications(prev => prev ? prev.filter(n => n.id !== id) : []);
        if (notifications && !notifications.find(n => n.id === id)?.isRead) {
            setUnreadCount(prev => Math.max(0, prev - 1));
        }
    };

    const translations = {
        am: {
            notifications: 'ማሳወቂያዎች',
            noNotifications: 'ምንም ማሳወቂያ የለም',
            enableNotifications: 'ብራውዘር ማሳወቂያዎችን አንቃ',
            markAllRead: 'ሁሉንም እንደ ተራ ምልክት አድርግ'
        },
        en: {
            notifications: 'Notifications',
            noNotifications: 'No notifications',
            enableNotifications: 'Enable Browser Notifications',
            markAllRead: 'Mark All as Read'
        }
    };

    const t = translations[language];

    return (
        <div className="notification-container">
            <button
                className="notification-toggle"
                onClick={() => setShowNotifications(!showNotifications)}
            >
                <i className="fas fa-bell"></i>
                {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount}</span>
                )}
            </button>

            {showNotifications && (
                <div className="notification-dropdown">
                    <div className="notification-header">
                        <h4>{t.notifications}</h4>
                        <div className="notification-actions">
                            <button
                                className="enable-notifications-btn"
                                onClick={requestNotificationPermission}
                            >
                                {t.enableNotifications}
                            </button>
                            {unreadCount > 0 && (
                                <button
                                    className="mark-all-read-btn"
                                    onClick={markAllAsRead}
                                >
                                    {t.markAllRead}
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="notification-list">
                        {notifications && notifications.length > 0 ? (
                            notifications.map(notification => (
                                <div
                                    key={notification.id || notification._id}
                                    className={`notification-item ${notification.urgent || notification.priority === 'urgent' ? 'urgent' : ''} ${!notification.isRead ? 'unread' : ''}`}
                                >
                                    <div className="notification-content">
                                        <h5>{notification.title}</h5>
                                        <p>{notification.message}</p>
                                        <small>{new Date(notification.timestamp || notification.createdAt).toLocaleDateString()}</small>
                                    </div>
                                    <div className="notification-actions">
                                        {!notification.isRead && (
                                            <button
                                                className="mark-read-btn"
                                                onClick={() => markAsRead(notification.id || notification._id)}
                                            >
                                                ✓
                                            </button>
                                        )}
                                        <button
                                            className="dismiss-btn"
                                            onClick={() => dismissNotification(notification.id || notification._id)}
                                        >
                                            ×
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="no-notifications">{t.noNotifications}</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Notification;
