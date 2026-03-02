import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { officesData } from '../data/offices';
import '../styles/ReportForm.css';

const ViewAnnualPlan = ({ language }) => {
    const { officeId, taskId } = useParams();
    const [plans, setPlans] = useState([]);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const savedPlans = JSON.parse(localStorage.getItem('annualPlans') || '[]');
        setPlans(savedPlans);
        
        if (officeId && taskId) {
            const filtered = savedPlans.filter(p => p.officeId === officeId && p.taskId === taskId);
            if (filtered.length > 0) {
                setSelectedPlan(filtered[0]);
            }
        }
    }, [officeId, taskId]);

    const office = officesData.find(o => o.id === (selectedPlan?.officeId || officeId));
    const task = office?.tasks.find(t => t.id === (selectedPlan?.taskId || taskId));

    const translations = {
        am: {
            title: 'እቅድ ይመልከቱ',
            selectPlan: 'እቅድ ይምረጡ',
            annualTargets: 'አመታዊ የግብ አላማዎች',
            monthlyPlan: 'ወራዊ እቅድ',
            weeklyPlan: 'ሳምንታዊ እቅድ',
            dailyPlan: 'ዕለታዊ እቅድ',
            noPlan: 'ምንም እቅድ የለም',
            back: 'ወደ ዳሽቦርድ'
        },
        en: {
            title: 'View Annual Plan',
            selectPlan: 'Select Plan',
            annualTargets: 'Annual Targets',
            monthlyPlan: 'Monthly Plan',
            weeklyPlan: 'Weekly Plan',
            dailyPlan: 'Daily Plan',
            noPlan: 'No plans found',
            back: 'Back to Dashboard'
        }
    };

    const t = translations[language];

    // Get unit from plan
    const getUnit = (kpiId) => {
        if (selectedPlan && selectedPlan.kpiUnits && selectedPlan.kpiUnits[kpiId]) {
            return selectedPlan.kpiUnits[kpiId];
        }
        return '-';
    };

    if (plans.length === 0) {
        return (
            <div className="report-form">
                <div className="report-header">
                    <button onClick={() => navigate('/dashboard')} className="btn-secondary back-button">
                        <i className="fas fa-arrow-left"></i> {t.back}
                    </button>
                    <h1>{t.title}</h1>
                </div>
                <p>{t.noPlan}</p>
            </div>
        );
    }

    return (
        <div className="report-form">
            <div className="report-header">
                <button onClick={() => navigate('/dashboard')} className="btn-secondary back-button">
                    <i className="fas fa-arrow-left"></i> {t.back}
                </button>
                <h1>{t.title}</h1>
            </div>

            <div className="form-group">
                <label>{t.selectPlan}</label>
                <select
                    value={selectedPlan?.id || ''}
                    onChange={(e) => {
                        const plan = plans.find(p => p.id === parseInt(e.target.value));
                        setSelectedPlan(plan);
                    }}
                >
                    <option value="">{language === 'am' ? '-- እቅድ ይምረጡ --' : '-- Select Plan --'}</option>
                    {plans.map(plan => (
                        <option key={plan.id} value={plan.id}>
                            {plan.year} - {officesData.find(o => o.id === plan.officeId)?.[language === 'am' ? 'name_am' : 'name_en']}
                        </option>
                    ))}
                </select>
            </div>

            {selectedPlan && task && (
                <div className="plan-details">
                    <div className="kpi-section">
                        <h4>{t.annualTargets}</h4>
                        {task.kpis.map(kpi => (
                            <p key={kpi.id}>
                                {language === 'am' ? kpi.name_am : kpi.name_en}: 
                                {selectedPlan.annualTargets[kpi.id]} {getUnit(kpi.id)}
                            </p>
                        ))}
                    </div>

                    <div className="kpi-section">
                        <h4>{t.monthlyPlan}</h4>
                        {task.kpis.map(kpi => (
                            <p key={kpi.id}>
                                {language === 'am' ? kpi.name_am : kpi.name_en}: 
                                {selectedPlan.distributedPlans?.monthly?.[kpi.id]?.toFixed(2)} {getUnit(kpi.id)}
                            </p>
                        ))}
                    </div>

                    <div className="kpi-section">
                        <h4>{t.weeklyPlan}</h4>
                        {task.kpis.map(kpi => (
                            <p key={kpi.id}>
                                {language === 'am' ? kpi.name_am : kpi.name_en}: 
                                {selectedPlan.distributedPlans?.weekly?.[kpi.id]?.toFixed(2)} {getUnit(kpi.id)}
                            </p>
                        ))}
                    </div>

                    <div className="kpi-section">
                        <h4>{t.dailyPlan}</h4>
                        {task.kpis.map(kpi => (
                            <p key={kpi.id}>
                                {language === 'am' ? kpi.name_am : kpi.name_en}: 
                                {selectedPlan.distributedPlans?.daily?.[kpi.id]?.toFixed(2)} {getUnit(kpi.id)}
                            </p>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ViewAnnualPlan;
