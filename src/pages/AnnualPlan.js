import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { officesData } from '../data/offices';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import '../styles/ReportForm.css';

const AnnualPlan = ({ language, toggleLanguage }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [selectedOffice, setSelectedOffice] = useState('');
  const [selectedTask, setSelectedTask] = useState('');
  const [annualTargets, setAnnualTargets] = useState({});
  const [kpiUnits, setKpiUnits] = useState({});
  const [distributedPlans, setDistributedPlans] = useState({ monthly: {}, weekly: {}, daily: {} });
  const [isDistributed, setIsDistributed] = useState(false);
  const [manualEntry, setManualEntry] = useState(false);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [loadingPlan, setLoadingPlan] = useState(false);

  const currentYear = new Date().getFullYear();
  const planLocked = currentPlan && (currentPlan.status === 'submitted' || currentPlan.status === 'approved');

  const selectedOfficeData = officesData.find((office) => office.id === selectedOffice);
  const selectedTaskData = selectedOfficeData?.tasks.find((task) => task.id === selectedTask);

  const resetPlanForm = () => {
    setAnnualTargets({});
    setKpiUnits({});
    setDistributedPlans({ monthly: {}, weekly: {}, daily: {} });
    setIsDistributed(false);
    setManualEntry(false);
  };

  const handleOfficeChange = (e) => {
    if (planLocked) return;
    setSelectedOffice(e.target.value);
    setSelectedTask('');
    resetPlanForm();
  };

  const handleTaskChange = (e) => {
    if (planLocked) return;
    setSelectedTask(e.target.value);
    resetPlanForm();
  };

  const handleAnnualTargetChange = (kpiId, value) => {
    if (planLocked) return;
    setAnnualTargets((prev) => ({ ...prev, [kpiId]: parseFloat(value) || 0 }));
  };

  const handleKpiUnitChange = (kpiId, value) => {
    if (planLocked) return;
    setKpiUnits((prev) => ({ ...prev, [kpiId]: value }));
  };

  const handleManualPlanChange = (period, kpiId, value) => {
    if (planLocked) return;
    setDistributedPlans((prev) => ({
      ...prev,
      [period]: {
        ...prev[period],
        [kpiId]: parseFloat(value) || 0
      }
    }));
  };

  const distributePlan = () => {
    if (planLocked || !selectedTaskData) return;

    const kpis = selectedTaskData.kpis || [];
    const hasAllTargets = kpis.every((kpi) => annualTargets[kpi.id] && annualTargets[kpi.id] > 0);
    const hasAllUnits = kpis.every((kpi) => kpiUnits[kpi.id] && kpiUnits[kpi.id].trim() !== '');

    if (!hasAllTargets) {
      alert('Please enter all annual targets');
      return;
    }
    if (!hasAllUnits) {
      alert('Please enter all units');
      return;
    }

    const monthly = {};
    const weekly = {};
    const daily = {};
    kpis.forEach((kpi) => {
      const annualTarget = annualTargets[kpi.id] || 0;
      monthly[kpi.id] = annualTarget / 12;
      weekly[kpi.id] = annualTarget / 48;
      daily[kpi.id] = annualTarget / 365;
    });

    setDistributedPlans({ monthly, weekly, daily });
    setIsDistributed(true);
  };

  const savePlan = async () => {
    if (planLocked) {
      alert('This plan is locked after submission. You can edit only when administrator requests changes.');
      return;
    }
    if (!isDistributed) {
      alert('Please distribute the plan first');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await api.post('/annualPlans', {
        officeId: selectedOffice,
        taskId: selectedTask,
        annualTargets,
        kpiUnits,
        distributedPlans,
        year: currentYear
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setCurrentPlan(response.data);
      alert('Plan submitted to administrator and locked until review.');
      navigate('/dashboard');
    } catch (error) {
      alert(error?.response?.data?.message || 'Failed to submit plan');
    }
  };

  useEffect(() => {
    const loadPlan = async () => {
      if (!selectedOffice || !selectedTask || !user) {
        setCurrentPlan(null);
        return;
      }

      setLoadingPlan(true);
      try {
        const token = localStorage.getItem('token');
        const response = await api.get('/annualPlans', {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            office_id: selectedOffice,
            task_id: selectedTask,
            year: currentYear
          }
        });

        const plan = Array.isArray(response.data) && response.data.length > 0 ? response.data[0] : null;
        setCurrentPlan(plan);

        if (plan) {
          setAnnualTargets(plan.annualTargets || {});
          setKpiUnits(plan.kpiUnits || {});
          setDistributedPlans(plan.distributedPlans || { monthly: {}, weekly: {}, daily: {} });
          setIsDistributed(Boolean(plan.distributedPlans));
        } else {
          resetPlanForm();
        }
      } catch (error) {
        setCurrentPlan(null);
      } finally {
        setLoadingPlan(false);
      }
    };

    loadPlan();
  }, [selectedOffice, selectedTask, user, currentYear]);

  return (
    <div className="daily-report">
      <div className="report-header">
        <button onClick={() => navigate('/dashboard')} className="btn-secondary back-button">
          <i className="fas fa-arrow-left"></i> Back to Dashboard
        </button>
        <h1>Annual Plan</h1>
        <button onClick={toggleLanguage} className="language-toggle" title="Toggle language">
          {language === 'am' ? 'EN' : 'AM'}
        </button>
      </div>

      <div className="report-form">
        <div className="form-group">
          <label htmlFor="office">Office:</label>
          <select id="office" value={selectedOffice} onChange={handleOfficeChange} disabled={planLocked} required>
            <option value="">Select Office</option>
            {officesData
              .filter((office) => user && user.accessibleOffices && user.accessibleOffices.includes(office.id))
              .map((office) => (
                <option key={office.id} value={office.id}>
                  {language === 'am' ? office.name_am : office.name_en}
                </option>
              ))}
          </select>
        </div>

        {selectedOffice && (
          <div className="form-group">
            <label htmlFor="task">Task:</label>
            <select id="task" value={selectedTask} onChange={handleTaskChange} disabled={planLocked} required>
              <option value="">Select Task</option>
              {selectedOfficeData?.tasks.map((task) => (
                <option key={task.id} value={task.id}>
                  {language === 'am' ? task.title_am : task.title_en}
                </option>
              ))}
            </select>
          </div>
        )}

        {selectedTask && selectedTaskData && (
          <div className="kpi-section">
            <h3>Annual Targets</h3>
            {selectedTaskData.kpis.map((kpi) => (
              <div key={kpi.id} className="form-group">
                <label htmlFor={`unit-${kpi.id}`}>{language === 'am' ? kpi.name_am : kpi.name_en} - Unit:</label>
                <input
                  type="text"
                  id={`unit-${kpi.id}`}
                  value={kpiUnits[kpi.id] || ''}
                  onChange={(e) => handleKpiUnitChange(kpi.id, e.target.value)}
                  disabled={planLocked}
                  placeholder="Enter unit"
                  required
                />
                <label htmlFor={`annual-${kpi.id}`}>{language === 'am' ? kpi.name_am : kpi.name_en} - Target:</label>
                <input
                  type="number"
                  id={`annual-${kpi.id}`}
                  value={annualTargets[kpi.id] || ''}
                  onChange={(e) => handleAnnualTargetChange(kpi.id, e.target.value)}
                  disabled={planLocked}
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
                  disabled={planLocked}
                />
                Enter plan manually
              </label>
            </div>

            <div className="button-group">
              {!manualEntry && (
                <button type="button" onClick={distributePlan} className="submit-btn" disabled={planLocked}>
                  Distribute Plan
                </button>
              )}
              {manualEntry && (
                <button type="button" onClick={() => setIsDistributed(true)} className="submit-btn" disabled={planLocked}>
                  Enter Manual Plan
                </button>
              )}
            </div>
          </div>
        )}

        {isDistributed && selectedTaskData && (
          <div className="kpi-section">
            <h3>{manualEntry ? 'Enter Manual Plan' : 'Distributed Plan'}</h3>

            <div className="plan-distribution">
              <div className="plan-section">
                <h4>Monthly Plan</h4>
                {selectedTaskData.kpis.map((kpi) => (
                  <div key={kpi.id} className="form-group">
                    <label htmlFor={`monthly-${kpi.id}`}>{language === 'am' ? kpi.name_am : kpi.name_en} ({kpiUnits[kpi.id] || '-'})</label>
                    <input
                      type="number"
                      id={`monthly-${kpi.id}`}
                      value={distributedPlans.monthly[kpi.id] || ''}
                      onChange={(e) => handleManualPlanChange('monthly', kpi.id, e.target.value)}
                      disabled={planLocked}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                ))}
              </div>

              <div className="plan-section">
                <h4>Weekly Plan</h4>
                {selectedTaskData.kpis.map((kpi) => (
                  <div key={kpi.id} className="form-group">
                    <label htmlFor={`weekly-${kpi.id}`}>{language === 'am' ? kpi.name_am : kpi.name_en} ({kpiUnits[kpi.id] || '-'})</label>
                    <input
                      type="number"
                      id={`weekly-${kpi.id}`}
                      value={distributedPlans.weekly[kpi.id] || ''}
                      onChange={(e) => handleManualPlanChange('weekly', kpi.id, e.target.value)}
                      disabled={planLocked}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                ))}
              </div>

              <div className="plan-section">
                <h4>Daily Plan</h4>
                {selectedTaskData.kpis.map((kpi) => (
                  <div key={kpi.id} className="form-group">
                    <label htmlFor={`daily-${kpi.id}`}>{language === 'am' ? kpi.name_am : kpi.name_en} ({kpiUnits[kpi.id] || '-'})</label>
                    <input
                      type="number"
                      id={`daily-${kpi.id}`}
                      value={distributedPlans.daily[kpi.id] || ''}
                      onChange={(e) => handleManualPlanChange('daily', kpi.id, e.target.value)}
                      disabled={planLocked}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="button-group">
              <button type="button" onClick={savePlan} className="submit-btn" disabled={planLocked}>
                {currentPlan?.status === 'rejected' ? 'Resubmit Plan' : 'Submit Plan'}
              </button>
              <button type="button" onClick={() => navigate('/dashboard')} className="back-btn">
                Back to Dashboard
              </button>
            </div>
          </div>
        )}

        {selectedTask && loadingPlan && <p>Loading plan status...</p>}
        {selectedTask && currentPlan?.status === 'submitted' && (
          <p style={{ color: '#b45309' }}>Your plan is submitted and locked until admin decision.</p>
        )}
        {selectedTask && currentPlan?.status === 'approved' && (
          <p style={{ color: '#166534' }}>Your plan is approved and cannot be edited.</p>
        )}
        {selectedTask && currentPlan?.status === 'rejected' && (
          <p style={{ color: '#991b1b' }}>Changes requested: {currentPlan.rejectionReason || ''}</p>
        )}
      </div>
    </div>
  );
};

export default AnnualPlan;
