import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { officesData } from '../data/offices';
import { useAuth } from '../contexts/AuthContext';
import '../styles/ReportForm.css';

const YearlyReport = ({ language }) => {
    const { user } = useAuth();
    const [selectedOffice, setSelectedOffice] = useState('');
    const [selectedTask, setSelectedTask] = useState('');
    const [reportData, setReportData] = useState({});
    const [year, setYear] = useState(new Date().getFullYear().toString());
    const [savedPlans, setSavedPlans] = useState([]);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const navigate = useNavigate();

    // Load saved plans from localStorage
    useEffect(() => {
        const plans = JSON.parse(localStorage.getItem('annualPlans') || '[]');
        setSavedPlans(plans);
    }, []);

    // Filter plans for the selected office and task
    const filteredPlans = savedPlans.filter(plan => 
        plan.officeId === selectedOffice && 
        plan.taskId === selectedTask &&
        plan.year === parseInt(year)
    );

    const translations = {
        am: {
            title: 'አመታዊ ሪፖርት',
            selectOffice: 'ቢሮ ይምረጡ',
            selectTask: 'ተግባር ይምረጡ',
            selectPlan: 'እቅድ ይምረጡ',
            year: 'አመት',
            value: 'ዋጋ',
            unit: 'አሃድ',
            target: 'ዒላማ',
            progress: 'እድገት',
            notes: 'ማስታወሻ',
            submit: 'ሪፖርት አስገባ',
            cancel: 'ሰርዝ',
            noPlan: 'ለዚህ አመት እቅድ የለም'
        },
        en: {
            title: 'Yearly Report',
            selectOffice: 'Select Office',
            selectTask: 'Select Task',
            selectPlan: 'Select Plan',
            year: 'Year',
            value: 'Value',
            unit: 'Unit',
            target: 'Target',
            progress: 'Progress',
            notes: 'Notes',
            submit: 'Submit Report',
            cancel: 'Cancel',
            noPlan: 'No plan for this year'
        }
    };

    const t = translations[language];
    const office = officesData.find(o => o.id === selectedOffice);

    const handleKPIChange = (kpiId, value) => {
        setReportData(prev => ({
            ...prev,
            [kpiId]: {
                ...prev[kpiId],
                value: parseFloat(value) || 0,
                year: year,
                reportedBy: user.id
            }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const report = {
            id: Date.now(),
            date: year + '-01-01',
            year: year,
            officeId: selectedOffice,
            taskId: selectedTask,
            planId: selectedPlan?.id,
            userId: user.id,
            userName: user.name,
            data: reportData,
            timestamp: new Date().toISOString(),
            type: 'yearly'
        };

        // Save to localStorage or send to API
        const existingReports = JSON.parse(localStorage.getItem('kpiReports') || '[]');
        existingReports.push(report);
        localStorage.setItem('kpiReports', JSON.stringify(existingReports));

        alert(language === 'am' ? 'ሪፖርት በተሳካ ሁኔታ ተመዝግቧል!' : 'Report submitted successfully!');
        navigate('/dashboard');
    };

    // Get the current task KPIs
    const taskKpis = office?.tasks.find(t => t.id === selectedTask)?.kpis || [];

    // Get unit from plan or use default
    const getUnit = (kpiId) => {
        if (selectedPlan && selectedPlan.kpiUnits && selectedPlan.kpiUnits[kpiId]) {
            return selectedPlan.kpiUnits[kpiId];
        }
        return '-';
    };

    // Get target from plan
    const getTarget = (kpiId) => {
        if (selectedPlan && selectedPlan.annualTargets && selectedPlan.annualTargets[kpiId]) {
            return selectedPlan.annualTargets[kpiId];
        }
        return 0;
    };

    return (
        <div className="report-form">
            <div className="report-header">
                <button onClick={() => navigate('/')} className="btn-secondary back-button">
                    <i className="fas fa-arrow-left"></i> {language === 'am' ? 'ወደ ዳሽቦርድ ተመለስ' : 'Back to Dashboard'}
                </button>
                <h1>{t.title}</h1>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>{t.year}</label>
                    <input
                        type="number"
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        min="2020"
                        max="2030"
                        required
                    />
                </div>

                <div className="form-group">
                    <label>{t.selectOffice}</label>
                    <select
                        value={selectedOffice}
                        onChange={(e) => {
                            setSelectedOffice(e.target.value);
                            setSelectedTask('');
                            setReportData({});
                            setSelectedPlan(null);
                        }}
                        required
                    >
                        <option value="">{language === 'am' ? '-- ቢሮ ይምረጡ --' : '-- Select Office --'}</option>
                        {officesData.map(office => (
                            <option key={office.id} value={office.id}>
                                {language === 'am' ? office.name_am : office.name_en}
                            </option>
                        ))}
                    </select>
                </div>

                {office && (
                    <div className="form-group">
                        <label>{t.selectTask}</label>
                        <select
                            value={selectedTask}
                            onChange={(e) => {
                                setSelectedTask(e.target.value);
                                setReportData({});
                                setSelectedPlan(null);
                            }}
                            required
                        >
                            <option value="">{language === 'am' ? '-- ተግባር ይምረጡ --' : '-- Select Task --'}</option>
                            {office.tasks.map(task => (
                                <option key={task.id} value={task.id}>
                                    {task.number_am} - {language === 'am' ? task.title_am : task.title_en}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {selectedOffice && selectedTask && filteredPlans.length > 0 && (
                    <div className="form-group">
                        <label>{t.selectPlan}</label>
                        <select
                            value={selectedPlan?.id || ''}
                            onChange={(e) => {
                                const plan = filteredPlans.find(p => p.id === parseInt(e.target.value));
                                setSelectedPlan(plan);
                                setReportData({});
                            }}
                            required
                        >
                            <option value="">{language === 'am' ? '-- እቅድ ይምረጡ --' : '-- Select Plan --'}</option>
                            {filteredPlans.map(plan => (
                                <option key={plan.id} value={plan.id}>
                                    {language === 'am' ? 'እቅድ' : 'Plan'} #{plan.id} - {plan.year}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {selectedOffice && selectedTask && filteredPlans.length === 0 && (
                    <div className="form-group">
                        <p style={{ color: 'orange' }}>{t.noPlan}</p>
                    </div>
                )}

                {selectedTask && office && selectedPlan && (
                    <div className="kpi-inputs">
                        <h3>{language === 'am' ? 'ኪፒአይ ውሂብ አስገባ' : 'Enter KPI Data'}</h3>
                        {taskKpis.map(kpi => (
                                <div key={kpi.id} className="kpi-input-group">
                                    <label>
                                        {language === 'am' ? kpi.name_am : kpi.name_en}
                                        <span className="unit">({getUnit(kpi.id)})</span>
                                    </label>
                                    <div className="input-with-target">
                                        <input
                                            type="number"
                                            value={reportData[kpi.id]?.value || ''}
                                            onChange={(e) => handleKPIChange(kpi.id, e.target.value)}
                                            placeholder={language === 'am' ? 'ዋጋ ያስገቡ' : 'Enter value'}
                                            required
                                        />
                                        <span className="target-display">
                                            {language === 'am' ? 'ዒላማ' : 'Target'}: {getTarget(kpi.id).toLocaleString()}
                                        </span>
                                    </div>
                                    {reportData[kpi.id]?.value && getTarget(kpi.id) > 0 && (
                                        <div className="progress-indicator">
                                            <div className="progress-bar">
                                                <div
                                                    className="progress-fill"
                                                    style={{
                                                        width: `${Math.min((reportData[kpi.id].value / getTarget(kpi.id)) * 100, 100)}%`
                                                    }}
                                                ></div>
                                            </div>
                                            <span>{((reportData[kpi.id].value / getTarget(kpi.id)) * 100).toFixed(1)}%</span>
                                        </div>
                                    )}
                                </div>
                            ))
                        }
                    </div>
                )}

                {selectedTask && office && !selectedPlan && (
                    <div className="kpi-inputs">
                        <h3>{language === 'am' ? 'ኪፒአይ ውሂብ አስገባ' : 'Enter KPI Data'}</h3>
                        {taskKpis.map(kpi => (
                                <div key={kpi.id} className="kpi-input-group">
                                    <label>
                                        {language === 'am' ? kpi.name_am : kpi.name_en}
                                    </label>
                                    <input
                                        type="number"
                                        value={reportData[kpi.id]?.value || ''}
                                        onChange={(e) => handleKPIChange(kpi.id, e.target.value)}
                                        placeholder={language === 'am' ? 'ዋጋ ያስገቡ' : 'Enter value'}
                                        required
                                    />
                                </div>
                            ))
                        }
                    </div>
                )}

                <div className="form-group">
                    <label>{t.notes}</label>
                    <textarea
                        rows="4"
                        value={reportData.notes || ''}
                        onChange={(e) => setReportData(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder={language === 'am' ? 'ተጨማሪ ማስታወሻ...' : 'Additional notes...'}
                    />
                </div>

                <div className="form-actions">
                    <button type="button" className="btn-secondary" onClick={() => navigate('/dashboard')}>
                        {t.cancel}
                    </button>
                    <button type="submit" className="btn-primary">
                        {t.submit}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default YearlyReport;
