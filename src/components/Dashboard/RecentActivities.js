import React, { useState, useEffect } from 'react';

const RecentActivities = ({ language }) => {
    const [activities, setActivities] = useState([]);

    useEffect(() => {
        // Load recent activities from localStorage
        const reports = JSON.parse(localStorage.getItem('kpiReports') || '[]');

        // Create activities from reports and feedback
        const activities = [];

        reports.forEach(report => {
            // Add report submission activity
            activities.push({
                id: `report-${report.id}`,
                type: 'report',
                description: language === 'am'
                    ? `አዲስ ሪፖርት ተለጠፈ በ ${report.userName}`
                    : `New report submitted by ${report.userName}`,
                timestamp: report.timestamp,
                office: report.officeId
            });

            // Add feedback activity if exists
            if (report.feedback) {
                activities.push({
                    id: `feedback-${report.id}`,
                    type: 'feedback',
                    description: language === 'am'
                        ? `አስተያየት ተለጠፈ በ ${report.feedbackBy} ለ ${report.userName}`
                        : `Feedback provided by ${report.feedbackBy} to ${report.userName}`,
                    feedback: report.feedback,
                    timestamp: report.feedbackDate || report.timestamp,
                    office: report.officeId
                });
            }
        });

        // Sort by timestamp and take most recent 5
        const recentActivities = activities
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 5);

        setActivities(recentActivities);
    }, [language]);

    const translations = {
        am: {
            recentActivities: 'ቅርብ እንቅስቃሴዎች',
            noActivities: 'ምንም እንቅስቃሴ የለም'
        },
        en: {
            recentActivities: 'Recent Activities',
            noActivities: 'No recent activities'
        }
    };

    const t = translations[language];

    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString(language === 'am' ? 'am-ET' : 'en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="recent-activities">
            <h3>{t.recentActivities}</h3>
            <div className="activities-list">
                {activities.length > 0 ? (
                    activities.map(activity => (
                        <div key={activity.id} className="activity-item">
                            <div className="activity-icon">
                                <i className={activity.type === 'feedback' ? 'fas fa-comment' : 'fas fa-file-alt'}></i>
                            </div>
                            <div className="activity-content">
                                <p className="activity-description">{activity.description}</p>
                                {activity.feedback && (
                                    <div className="feedback-content">
                                        <blockquote>"{activity.feedback}"</blockquote>
                                    </div>
                                )}
                                <span className="activity-time">{formatDate(activity.timestamp)}</span>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="no-activities">{t.noActivities}</p>
                )}
            </div>
        </div>
    );
};

export default RecentActivities;
