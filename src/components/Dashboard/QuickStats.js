import React, { useState, useEffect } from 'react';
import { officesData } from '../../data/offices';

const QuickStats = ({ language, timeFrame, selectedOffice }) => {
    const [hoveredStat, setHoveredStat] = useState(null);
    const [statsData, setStatsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch stats data from API
    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/reports/stats/${timeFrame}/${selectedOffice || 'all'}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch stats');
                }
                const data = await response.json();
                setStatsData(data);
                setError(null);
            } catch (err) {
                console.error('Error fetching stats:', err);
                setError(err.message);
                setStatsData(null);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [timeFrame, selectedOffice]);

    // Calculate previous period data for comparison (mock for now)
    const getPreviousPeriodData = () => {
        const previousData = {
            daily: { reports: 45, performance: 85, completion: 92 },
            weekly: { reports: 320, performance: 86, completion: 93 },
            monthly: { reports: 1240, performance: 87, completion: 94 },
            yearly: { reports: 14840, performance: 88, completion: 95 }
        };
        return previousData[timeFrame] || previousData.weekly;
    };

    const prevData = getPreviousPeriodData();

    // Calculate changes
    const calculateChange = (current, previous) => {
        if (previous === 0) return { value: '+0%', type: 'neutral' };
        const change = ((current - previous) / previous) * 100;
        const rounded = Math.round(change * 100) / 100;
        return {
            value: `${change >= 0 ? '+' : ''}${rounded}%`,
            type: change >= 0 ? 'up' : 'down'
        };
    };

    // Format numbers
    const formatNumber = (num) => {
        return num.toLocaleString();
    };

    // Build stats array
    const stats = [
        {
            id: 'total-reports',
            title_am: 'አጠቃላይ ሪፖርቶች',
            title_en: 'Total Reports',
            value: statsData ? formatNumber(statsData.totalReports) : '0',
            change: calculateChange(statsData?.totalReports || 0, prevData.reports).value,
            changeType: calculateChange(statsData?.totalReports || 0, prevData.reports).type,
            icon: 'fas fa-file-alt',
            color: '#3498db',
            tooltip_am: `በዚህ ${timeFrame === 'daily' ? 'ቀን' : timeFrame === 'weekly' ? 'ሳምንት' : timeFrame === 'monthly' ? 'ወር' : 'አመት'} ሪፖርቶች ተለጠፈ፣ ከቀድሞ ${timeFrame === 'daily' ? 'ቀን' : timeFrame === 'weekly' ? 'ሳምንት' : timeFrame === 'monthly' ? 'ወር' : 'አመት'} በኩል ከ ${prevData.reports} ተለያየ`,
            tooltip_en: `Reports submitted this ${timeFrame}, compared to ${prevData.reports} last ${timeFrame}`,
            trend: [320, 340, 380, 420, 450, 480, 520]
        },
        {
            id: 'active-offices',
            title_am: 'ንቁ ቢሮዎች',
            title_en: 'Active Offices',
            value: statsData ? statsData.activeOffices.toString() : '0',
            change: '+2', // Mock change for now
            changeType: 'up',
            icon: 'fas fa-building',
            color: '#e74c3c',
            tooltip_am: `${statsData?.activeOffices || 0} ቢሮዎች ንቁ ናቸው፣ በዚህ ${timeFrame === 'daily' ? 'ቀን' : timeFrame === 'weekly' ? 'ሳምንት' : timeFrame === 'monthly' ? 'ወር' : 'አመት'}`,
            tooltip_en: `${statsData?.activeOffices || 0} offices are active this ${timeFrame}`,
            trend: [8, 9, 9, 10, 10, 11, 11]
        },
        {
            id: 'avg-performance',
            title_am: 'አማካይ አፈፃፀም',
            title_en: 'Avg Performance',
            value: statsData ? `${statsData.avgPerformance}%` : '0%',
            change: calculateChange(statsData?.avgPerformance || 0, prevData.performance).value,
            changeType: calculateChange(statsData?.avgPerformance || 0, prevData.performance).type,
            icon: 'fas fa-chart-line',
            color: '#27ae60',
            tooltip_am: `አማካይ አፈፃፀም በዚህ ${timeFrame === 'daily' ? 'ቀን' : timeFrame === 'weekly' ? 'ሳምንት' : timeFrame === 'monthly' ? 'ወር' : 'አመት'} ${statsData?.avgPerformance || 0}% ነበር፣ ከቀድሞ ${timeFrame === 'daily' ? 'ቀን' : timeFrame === 'weekly' ? 'ሳምንት' : timeFrame === 'monthly' ? 'ወር' : 'አመት'} በኩል ከ ${prevData.performance}% ተለያየ`,
            tooltip_en: `Average performance this ${timeFrame} is ${statsData?.avgPerformance || 0}%, ${calculateChange(statsData?.avgPerformance || 0, prevData.performance).value} from ${prevData.performance}% last ${timeFrame}`,
            trend: [82, 83, 84, 85, 86, 86, 87]
        },
        {
            id: 'completion-rate',
            title_am: 'የመጠናቀቅ መጠን',
            title_en: 'Completion Rate',
            value: statsData ? `${statsData.completionRate}%` : '0%',
            change: calculateChange(statsData?.completionRate || 0, prevData.completion).value,
            changeType: calculateChange(statsData?.completionRate || 0, prevData.completion).type,
            icon: 'fas fa-check-circle',
            color: '#9b59b6',
            tooltip_am: `የመጠናቀቅ መጠን በዚህ ${timeFrame === 'daily' ? 'ቀን' : timeFrame === 'weekly' ? 'ሳምንት' : timeFrame === 'monthly' ? 'ወር' : 'አመት'} ${statsData?.completionRate || 0}% ነበር፣ ከቀድሞ ${timeFrame === 'daily' ? 'ቀን' : timeFrame === 'weekly' ? 'ሳምንት' : timeFrame === 'monthly' ? 'ወር' : 'አመት'} በኩል ከ ${prevData.completion}% ተለያየ`,
            tooltip_en: `Completion rate this ${timeFrame} is ${statsData?.completionRate || 0}%, ${calculateChange(statsData?.completionRate || 0, prevData.completion).value} from ${prevData.completion}% last ${timeFrame}`,
            trend: [95, 94, 94, 93, 93, 93, 94]
        }
    ];

    const exportToCSV = () => {
        const csvData = stats.map(stat => ({
            Metric: language === 'am' ? stat.title_am : stat.title_en,
            Value: stat.value,
            Change: stat.change,
            'Time Frame': timeFrame
        }));

        const csvContent = [
            Object.keys(csvData[0]).join(','),
            ...csvData.map(row => Object.values(row).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `dashboard-stats-${timeFrame}-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const translations = {
        am: {
            quickStats: 'ፈጣን ስታትስትዮች',
            export: 'ወደ CSV ላክ'
        },
        en: {
            quickStats: 'Quick Stats',
            export: 'Export to CSV'
        }
    };

    const t = translations[language];

    return (
        <div className="quick-stats">
            <div className="stats-header">
                <h3>{t.quickStats}</h3>
                <button onClick={exportToCSV} className="btn-secondary export-btn">
                    <i className="fas fa-download"></i> {t.export}
                </button>
            </div>
            <div className="stats-grid">
                {stats.map(stat => (
                    <div
                        key={stat.id}
                        className="stat-card"
                        onMouseEnter={() => setHoveredStat(stat.id)}
                        onMouseLeave={() => setHoveredStat(null)}
                    >
                        <div className="stat-icon" style={{ backgroundColor: stat.color }}>
                            <i className={stat.icon}></i>
                        </div>
                        <div className="stat-content">
                            <div className="stat-value">{stat.value}</div>
                            <div className="stat-title">
                                {language === 'am' ? stat.title_am : stat.title_en}
                            </div>
                            <div className={`stat-change ${stat.changeType}`}>
                                <i className={`fas fa-arrow-${stat.changeType === 'up' ? 'up' : 'down'}`}></i>
                                {stat.change}
                            </div>
                        </div>
                        {hoveredStat === stat.id && (
                            <div className="stat-tooltip">
                                {language === 'am' ? stat.tooltip_am : stat.tooltip_en}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default QuickStats;
