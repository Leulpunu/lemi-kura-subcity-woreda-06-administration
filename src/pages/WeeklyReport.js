// src/pages/WeeklyReport.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { officesData } from '../data/offices';
import { useAuth } from '../contexts/AuthContext';
import '../styles/ReportForm.css';

const WeeklyReport = ({ language, toggleLanguage }) => {
    const { user } = useAuth();
    const [selectedOffice, setSelectedOffice] = useState('');
    const [selectedTask, setSelectedTask] = useState('');
    const [reportData, setReportData] = useState({});
    const [weekStart, setWeekStart] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        // Calculate the start of the current week (Monday)
        const today = new Date();
        const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
        const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust for Sunday
        const monday = new Date(today.setDate(diff));
        setWeekStart(monday.toISOString().split('T')[0]);
    }, []);

    const translations = {
        am: {
            title: 'ሳምንታዊ ሪፖርት',
            selectOffice: 'ቢሮ ይምረጡ',
            selectTask: 'ተግባር ይምረጡ',
            weekStart: 'ሳምንት መጀመሪያ ቀን',
            value: 'ዋጋ',
            unit: 'አሃድ',
            target: 'ዒላማ',
            progress: 'እድገት',
            notes: 'ማስታወሻ',
            submit: 'ሪፖርት አስገባ',
            cancel: 'ሰርዝ'
        },
        en: {
            title: 'Weekly Report',
            selectOffice: 'Select Office',
            selectTask: 'Select Task',
            weekStart: 'Week Start Date',
            value: 'Value',
            unit: 'Unit',
            target: 'Target',
            progress: 'Progress',
            notes: 'Notes',
            submit: 'Submit Report',
            cancel: 'Cancel'
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
                weekStart: weekStart,
                reportedBy: user.id
            }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const report = {
            id: Date.now(),
            date: weekStart,
            weekStart: weekStart,
            officeId: selectedOffice,
            taskId: selectedTask,
            userId: user.id,
            userName: user.name,
            data: reportData,
            timestamp: new Date().toISOString(),
            type: 'weekly'
        };

        // Save to localStorage or send to API
        const existingReports = JSON.parse(localStorage.getItem('kpiReports') || '[]');
        existingReports.push(report);
        localStorage.setItem('kpiReports', JSON.stringify(existingReports));

        alert(language === 'am' ? 'ሪፖርት በተሳካ ሁኔታ ተመዝግቧል!' : 'Report submitted successfully!');
        navigate('/dashboard');
    };

    return (
        <div className="report-form">
            <h1>{t.title}</h1>

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>{t.weekStart}</label>
                    <input
                        type="date"
                        value={weekStart}
                        onChange={(e) => setWeekStart(e.target.value)}
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
                        }}
                        required
                    >
                        <option value="">{language === 'am' ? '-- ቢሮ ይምረጡ --' : '-- Select Office --'}</option>
                        {officesData
                            .filter(office => user && user.accessibleOffices && user.accessibleOffices.includes(office.id))
                            .map(office => (
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
                            onChange={(e) => setSelectedTask(e.target.value)}
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

                {selectedTask && office && (
                    <div className="kpi-inputs">
                        <h3>{language === 'am' ? 'ኪፒአይ ውሂብ አስገባ' : 'Enter KPI Data'}</h3>
                        {office.tasks
                            .find(t => t.id === selectedTask)
                            .kpis.map(kpi => (
                                <div key={kpi.id} className="kpi-input-group">
                                    <label>
                                        {language === 'am' ? kpi.name_am : kpi.name_en}
                                        <span className="unit">({kpi.unit})</span>
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
                                            {language === 'am' ? 'ዒላማ' : 'Target'}: {kpi.target.toLocaleString()}
                                        </span>
                                    </div>
                                    {reportData[kpi.id]?.value && (
                                        <div className="progress-indicator">
                                            <div className="progress-bar">
                                                <div
                                                    className="progress-fill"
                                                    style={{
                                                        width: `${Math.min((reportData[kpi.id].value / kpi.target) * 100, 100)}%`
                                                    }}
                                                ></div>
                                            </div>
                                            <span>{((reportData[kpi.id].value / kpi.target) * 100).toFixed(1)}%</span>
                                        </div>
                                    )}
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

export default WeeklyReport;
