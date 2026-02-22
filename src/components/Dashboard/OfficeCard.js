import React from 'react';
import { Link } from 'react-router-dom';

const OfficeCard = ({ office, language, user }) => {
    const translations = {
        am: {
            viewDetails: 'ዝርዝሮች ይመልከቱ',
            kpis: 'ኪፒአይዎች',
            reports: 'ሪፖርቶች'
        },
        en: {
            viewDetails: 'View Details',
            kpis: 'KPIs',
            reports: 'Reports'
        }
    };

    const t = translations[language];

    // Calculate overall progress for this office
    const totalKPIs = office.tasks.reduce((sum, task) => sum + task.kpis.length, 0);
    const completedKPIs = office.tasks.reduce((sum, task) =>
        sum + task.kpis.filter(kpi => kpi.current >= kpi.target).length, 0
    );
    const progressPercentage = totalKPIs > 0 ? (completedKPIs / totalKPIs) * 100 : 0;

    return (
        <div className="office-card">
            <div className="office-header">
                <h3>{language === 'am' ? office.name_am : office.name_en}</h3>
                <span className="office-type">{office.type}</span>
            </div>

            <div className="office-stats">
                <div className="stat">
                    <span className="stat-label">{t.kpis}</span>
                    <span className="stat-value">{totalKPIs}</span>
                </div>
                <div className="stat">
                    <span className="stat-label">{t.reports}</span>
                    <span className="stat-value">
                        {JSON.parse(localStorage.getItem('kpiReports') || '[]')
                            .filter(report => report.officeId === office.id).length}
                    </span>
                </div>
            </div>

            <div className="office-progress">
                <div className="progress-bar">
                    <div
                        className="progress-fill"
                        style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                    ></div>
                </div>
                <span className="progress-text">{progressPercentage.toFixed(1)}%</span>
            </div>

            <div className="office-actions">
                <Link to={`/office/${office.id}`} className="btn-secondary">
                    {t.viewDetails}
                </Link>
            </div>
        </div>
    );
};

export default OfficeCard;
