import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { officesData } from '../data/offices';
import { useAuth } from '../contexts/AuthContext';
import '../styles/ReportForm.css';

const AnnualPlan = ({ language, toggleLanguage }) => {
  const { user } = useAuth();
  const [selectedOffice, setSelectedOffice] = useState('');
  const [selectedTask, setSelectedTask] = useState('');
  const [annualTargets, setAnnualTargets] = useState({});
  const [kpiUnits, setKpiUnits] = useState({});
  const [distributedPlans, setDistributedPlans] = useState({
    monthly: {},
    weekly: {},
    daily: {}
  });
  const [isDistributed, setIsDistributed] = useState(false);
  const [manualEntry, setManualEntry] = useState(false);
  const navigate = useNavigate();

  const handleOfficeChange = (e) => {
    setSelectedOffice(e.target.value);
    setSelectedTask('');
    setAnnualTargets({});
    setKpiUnits({});
    setIsDistributed(false);
  };

  const handleTaskChange = (e) => {
    setSelectedTask(e.target.value);
    setAnnualTargets({});
    setKpiUnits({});
    setIsDistributed(false);
  };

  const handleAnnualTargetChange = (kpiId, value) => {
    setAnnualTargets(prev => ({
      ...prev,
      [kpiId]: parseFloat(value) || 0
    }));
  };

  const handleKpiUnitChange = (kpiId, value) => {
    setKpiUnits(prev => ({
      ...prev,
      [kpiId]: value
    }));
  };

  const handleManualPlanChange = (period, kpiId, value) => {
    setDistributedPlans(prev => ({
      ...prev,
      [period]: {
        ...prev[period],
        [kpiId]: parseFloat(value) || 0
      }
    }));
  };

  const distributePlan = () => {
    // Check if all annual targets and units are entered
    const kpis = selectedTaskData?.kpis || [];
    const hasAllTargets = kpis.every(kpi => annualTargets[kpi.id] && annualTargets[kpi.id] > 0);
    const hasAllUnits = kpis.every(kpi => kpiUnits[kpi.id] && kpiUnits[kpi.id].trim() !== '');
    
    if (!hasAllTargets) {
      alert(language === 'am' ? 'እባክዎ ሁሉንም አመታዊ ዒላማዎች ያስገቡ' : 'Please enter all annual targets');
      return;
    }
    
    if (!hasAllUnits) {
      alert(language === 'am' ? 'እባክዎ ሁሉንም አሃዶች ያስገቡ' : 'Please enter all units');
      return;
    }

    // Distribute annual targets to monthly, weekly, and daily
    const monthly = {};
    const weekly = {};
    const daily = {};

    kpis.forEach(kpi => {
      const annualTarget = annualTargets[kpi.id] || 0;
      
      // Divide by 12 months
      monthly[kpi.id] = annualTarget / 12;
      
      // Divide by 4 weeks per month (approximately)
      weekly[kpi.id] = annualTarget / 48;
      
      // Divide by 365 days per year (approximately)
      daily[kpi.id] = annualTarget / 365;
    });

    setDistributedPlans({
      monthly,
      weekly,
      daily
    });
    setIsDistributed(true);
  };

  const savePlan = () => {
    if (!isDistributed) {
      alert(language === 'am' ? 'እባክዎ መጀመሪያ እቅዱን ያከፋፍሉ' : 'Please distribute the plan first');
      return;
    }

    const planData = {
      id: Date.now(),
      officeId: selectedOffice,
      taskId: selectedTask,
      annualTargets,
      kpiUnits,
      distributedPlans,
      year: new Date().getFullYear(),
      submittedBy: user.id,
      submittedAt: new Date().toISOString()
    };

    // Save to localStorage
    const existingPlans = JSON.parse(localStorage.getItem('annualPlans') || '[]');
    existingPlans.push(planData);
    localStorage.setItem('annualPlans', JSON.stringify(existingPlans));

    alert(language === 'am' ? 'እቅዱ ተሳካ ተቀምጧል' : 'Plan saved successfully');
    navigate('/dashboard');
  };

  const selectedOfficeData = officesData.find(office => office.id === selectedOffice);
  const selectedTaskData = selectedOfficeData?.tasks.find(task => task.id === selectedTask);

  return (
    <div className="daily-report">
      <div className="report-header">
        <button onClick={() => navigate('/')} className="btn-secondary back-button">
          <i className="fas fa-arrow-left"></i> {language === 'am' ? 'ወደ ዳሽቦርድ ተመለስ' : 'Back to Dashboard'}
        </button>
        <h1>{language === 'am' ? 'አመታዊ እቅድ' : 'Annual Plan'}</h1>
        <button
          onClick={toggleLanguage}
          className="language-toggle"
          title={language === 'am' ? 'Switch to English' : 'አማርኛ ቀይር'}
        >
          {language === 'am' ? 'EN' : 'አማ'}
        </button>
      </div>

      <div className="report-form">
        <div className="form-group">
          <label htmlFor="office">
            {language === 'am' ? 'ቢሮ' : 'Office'}:
          </label>
          <select
            id="office"
            value={selectedOffice}
            onChange={handleOfficeChange}
            required
          >
            <option value="">{language === 'am' ? 'ቢሮ ይምረጡ' : 'Select Office'}</option>
            {officesData
              .filter(office => user && user.accessibleOffices && user.accessibleOffices.includes(office.id))
              .map(office => (
                <option key={office.id} value={office.id}>
                  {language === 'am' ? office.name_am : office.name_en}
                </option>
              ))}
          </select>
        </div>

        {selectedOffice && (
          <div className="form-group">
            <label htmlFor="task">
              {language === 'am' ? 'ተግባር' : 'Task'}:
            </label>
            <select
              id="task"
              value={selectedTask}
              onChange={handleTaskChange}
              required
            >
              <option value="">{language === 'am' ? 'ተግባር ይምረጡ' : 'Select Task'}</option>
              {selectedOfficeData.tasks.map(task => (
                <option key={task.id} value={task.id}>
                  {language === 'am' ? task.title_am : task.title_en}
                </option>
              ))}
            </select>
          </div>
        )}

        {selectedTask && (
          <div className="kpi-section">
            <h3>{language === 'am' ? 'አመታዊ የግብ አላማዎች' : 'Annual Targets'}</h3>
            {selectedTaskData.kpis.map(kpi => (
              <div key={kpi.id} className="form-group">
                <label htmlFor={`unit-${kpi.id}`}>
                  {language === 'am' ? kpi.name_am : kpi.name_en} - {language === 'am' ? 'አሃድ (Unit)' : 'Unit'}:
                </label>
                <input
                  type="text"
                  id={`unit-${kpi.id}`}
                  value={kpiUnits[kpi.id] || ''}
                  onChange={(e) => handleKpiUnitChange(kpi.id, e.target.value)}
                  placeholder={language === 'am' ? 'አሃድ ያስገቡ (ሰዎች, ኪሎ ግራም...)' : 'Enter unit (persons, kg, etc.)'}
                  required
                />
                <label htmlFor={`annual-${kpi.id}`}>
                  {language === 'am' ? kpi.name_am : kpi.name_en} - {language === 'am' ? 'ዒላማ (Target)' : 'Target'}:
                </label>
                <input
                  type="number"
                  id={`annual-${kpi.id}`}
                  value={annualTargets[kpi.id] || ''}
                  onChange={(e) => handleAnnualTargetChange(kpi.id, e.target.value)}
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            ))}

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={manualEntry}
                  onChange={(e) => setManualEntry(e.target.checked)}
                />
                {language === 'am' ? 'በተግባር እቅዱን አስገባ' : 'Enter plan manually'}
              </label>
            </div>

            <div className="button-group">
              {!manualEntry && (
                <button type="button" onClick={distributePlan} className="submit-btn">
                  {language === 'am' ? 'እቅዱን አከፋፍል' : 'Distribute Plan'}
                </button>
              )}
              {manualEntry && (
                <button type="button" onClick={() => setIsDistributed(true)} className="submit-btn">
                  {language === 'am' ? 'በተግባር እቅዱን አስገባ' : 'Enter Manual Plan'}
                </button>
              )}
            </div>
          </div>
        )}

        {isDistributed && (
          <div className="kpi-section">
            <h3>{language === 'am' ? (manualEntry ? 'በተግባር እቅዱን አስገባ' : 'የተከፋፈለ እቅድ') : (manualEntry ? 'Enter Manual Plan' : 'Distributed Plan')}</h3>

            <div className="plan-distribution">
              <div className="plan-section">
                <h4>{language === 'am' ? 'ወራዊ እቅድ' : 'Monthly Plan'}</h4>
                {selectedTaskData.kpis.map(kpi => (
                  <div key={kpi.id} className="form-group">
                    <label htmlFor={`monthly-${kpi.id}`}>
                      {language === 'am' ? kpi.name_am : kpi.name_en} ({kpiUnits[kpi.id] || '-'}):
                    </label>
                    <input
                      type="number"
                      id={`monthly-${kpi.id}`}
                      value={distributedPlans.monthly[kpi.id] || ''}
                      onChange={(e) => handleManualPlanChange('monthly', kpi.id, e.target.value)}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                ))}
              </div>

              <div className="plan-section">
                <h4>{language === 'am' ? 'ሳምንታዊ እቅድ' : 'Weekly Plan'}</h4>
                {selectedTaskData.kpis.map(kpi => (
                  <div key={kpi.id} className="form-group">
                    <label htmlFor={`weekly-${kpi.id}`}>
                      {language === 'am' ? kpi.name_am : kpi.name_en} ({kpiUnits[kpi.id] || '-'}):
                    </label>
                    <input
                      type="number"
                      id={`weekly-${kpi.id}`}
                      value={distributedPlans.weekly[kpi.id] || ''}
                      onChange={(e) => handleManualPlanChange('weekly', kpi.id, e.target.value)}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                ))}
              </div>

              <div className="plan-section">
                <h4>{language === 'am' ? 'ዕለታዊ እቅድ' : 'Daily Plan'}</h4>
                {selectedTaskData.kpis.map(kpi => (
                  <div key={kpi.id} className="form-group">
                    <label htmlFor={`daily-${kpi.id}`}>
                      {language === 'am' ? kpi.name_am : kpi.name_en} ({kpiUnits[kpi.id] || '-'}):
                    </label>
                    <input
                      type="number"
                      id={`daily-${kpi.id}`}
                      value={distributedPlans.daily[kpi.id] || ''}
                      onChange={(e) => handleManualPlanChange('daily', kpi.id, e.target.value)}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="button-group">
              <button type="button" onClick={savePlan} className="submit-btn">
                {language === 'am' ? 'እቅዱን አስቀምጥ' : 'Save Plan'}
              </button>
              <button type="button" onClick={() => navigate('/dashboard')} className="back-btn">
                {language === 'am' ? 'ወደ ዳሽቦርድ ተመለስ' : 'Back to Dashboard'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnnualPlan;
