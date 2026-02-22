import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { officesData } from '../../data/offices';
import './OfficeKPIs.css';

const OfficeKPIs = ({ language }) => {
  const { officeId } = useParams();
  const { user } = useAuth();

  // Find the office data
  const office = officesData.find(office => office.id === officeId);

  // Check if user has access to this office
  const hasAccess = user.role === 'admin' || user.accessibleOffices.includes(officeId);

  // Redirect if no access
  if (!hasAccess) {
    return <Navigate to="/dashboard" replace />;
  }

  // If office not found, redirect to dashboard
  if (!office) {
    return <Navigate to="/dashboard" replace />;
  }

  const translations = {
    am: {
      backToDashboard: 'ወደ ዳሽቦርድ ተመለስ',
      officeKPIs: 'የቢሮ ኪፒአይዎች',
      tasks: 'ተግባራት',
      kpis: 'ኪፒአይዎች',
      target: 'ዒላማ',
      unit: 'አሃድ'
    },
    en: {
      backToDashboard: 'Back to Dashboard',
      officeKPIs: 'Office KPIs',
      tasks: 'Tasks',
      kpis: 'KPIs',
      target: 'Target',
      unit: 'Unit'
    }
  };

  const t = translations[language];

  return (
    <div className="office-kpis">
      <div className="office-header">
        <h1>{office.name_am} - {t.officeKPIs}</h1>
        <button
          className="btn-secondary"
          onClick={() => window.history.back()}
        >
          {t.backToDashboard}
        </button>
      </div>

      <div className="kpis-grid">
        {office.tasks.map((task, taskIndex) => (
          <div key={taskIndex} className="task-card">
            <h3>{task.name_am}</h3>
            <div className="kpis-list">
              {task.kpis.map((kpi, kpiIndex) => (
                <div key={kpiIndex} className="kpi-item">
                  <div className="kpi-name">{kpi.name_am}</div>
                  <div className="kpi-target">{t.target}: {kpi.target}</div>
                  <div className="kpi-unit">{t.unit}: {kpi.unit}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OfficeKPIs;
