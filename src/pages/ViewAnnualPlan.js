import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { officesData } from '../data/offices';
import { useAuth } from '../contexts/AuthContext';
import '../styles/ReportForm.css';

const ViewAnnualPlan = ({ language, toggleLanguage }) => {
  const { user } = useAuth();
  const [plans, setPlans] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const existingPlans = JSON.parse(localStorage.getItem('annualPlans') || '[]');
    const userPlans = existingPlans.filter(plan => plan.officeId === user.accessibleOffices[0]);
    setPlans(userPlans);
  }, [user]);

  return (
    <div className="daily-report">
      <div className="report-header">
        <button onClick={() => navigate('/dashboard')} className="btn-secondary back-button">
          <i className="fas fa-arrow-left"></i> {language === 'am' ? 'ወደ ዳሽቦርድ ተመለስ' : 'Back to Dashboard'}
        </button>
        <h1>{language === 'am' ? 'አመታዊ እቅድ ይዩ' : 'View Annual Plan'}</h1>
        <button
          onClick={toggleLanguage}
          className="language-toggle"
          title={language === 'am' ? 'Switch to English' : 'አማርኛ ቀይር'}
        >
          {language === 'am' ? 'EN' : 'አማ'}
        </button>
      </div>

      <div className="report-form">
        {plans.length === 0 ? (
          <p>{language === 'am' ? 'እቅድ አልተለመደም' : 'No plans found'}</p>
        ) : (
          plans.map(plan => {
            const office = officesData.find(o => o.id === plan.officeId);
            const task = office?.tasks.find(t => t.id === plan.taskId);
            return (
              <div key={plan.id} className="plan-item">
                <h3>{language === 'am' ? office?.name_am : office?.name_en} - {language === 'am' ? task?.title_am : task?.title_en}</h3>
                <p>{language === 'am' ? 'አመት' : 'Year'}: {plan.year}</p>
                <div className="kpi-section">
                  <h4>{language === 'am' ? 'አመታዊ የግብ አላማዎች' : 'Annual Targets'}</h4>
                  {task?.kpis.map(kpi => (
                    <p key={kpi.id}>{language === 'am' ? kpi.name_am : kpi.name_en}: {plan.annualTargets[kpi.id]} {kpi.unit}</p>
                  ))}
                </div>
                <div className="plan-distribution">
                  <div className="plan-section">
                    <h4>{language === 'am' ? 'ወራዊ እቅድ' : 'Monthly Plan'}</h4>
                    {task?.kpis.map(kpi => (
                      <p key={kpi.id}>{language === 'am' ? kpi.name_am : kpi.name_en}: {plan.distributedPlans.monthly[kpi.id]} {kpi.unit}</p>
                    ))}
                  </div>
                  <div className="plan-section">
                    <h4>{language === 'am' ? 'ሳምንታዊ እቅድ' : 'Weekly Plan'}</h4>
                    {task?.kpis.map(kpi => (
                      <p key={kpi.id}>{language === 'am' ? kpi.name_am : kpi.name_en}: {plan.distributedPlans.weekly[kpi.id]} {kpi.unit}</p>
                    ))}
                  </div>
                  <div className="plan-section">
                    <h4>{language === 'am' ? 'ዕለታዊ እቅድ' : 'Daily Plan'}</h4>
                    {task?.kpis.map(kpi => (
                      <p key={kpi.id}>{language === 'am' ? kpi.name_am : kpi.name_en}: {plan.distributedPlans.daily[kpi.id]} {kpi.unit}</p>
                    ))}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ViewAnnualPlan;
