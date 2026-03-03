import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { officesData } from '../data/offices';
import api from '../services/api';
import '../styles/ReportForm.css';

const UnifiedReport = ({ language, toggleLanguage }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const canAccessOffice = (officeId) => {
    if (!user) return false;
    if (user.role === 'admin' || user.role === 'party') return true;
    return Array.isArray(user.accessibleOffices) && user.accessibleOffices.includes(officeId);
  };

  const [reportType, setReportType] = useState('daily');
  const [formData, setFormData] = useState({
    date: '',
    startDate: '',
    endDate: '',
    month: '',
    year: '',
    office: '',
    task: '',
    kpiData: {}
  });
  const [existingReport, setExistingReport] = useState(null);

  const t = {
    am: {
      title: 'Unified Report Form',
      reportType: 'Report Type',
      date: 'Date',
      startDate: 'Start Date',
      endDate: 'End Date',
      month: 'Month',
      year: 'Year',
      office: 'Office',
      task: 'Task',
      selectOffice: 'Select Office',
      selectTask: 'Select Task',
      kpiData: 'KPI Data',
      lockedNotice: 'This report is locked. Wait for administrator feedback to edit.',
      unlockedNotice: 'Administrator feedback received. You can edit and resubmit this report.',
      loginFirst: 'Please login first',
      lockedAlert: 'This report is locked. You can edit it only after administrator feedback.',
      alreadyLockedAlert: 'This report was already submitted and is locked.',
      submit: 'Submit Report',
      resubmit: 'Resubmit Report'
    },
    en: {
      title: 'Unified Report Form',
      reportType: 'Report Type',
      date: 'Date',
      startDate: 'Start Date',
      endDate: 'End Date',
      month: 'Month',
      year: 'Year',
      office: 'Office',
      task: 'Task',
      selectOffice: 'Select Office',
      selectTask: 'Select Task',
      kpiData: 'KPI Data',
      lockedNotice: 'This report is locked. Wait for administrator feedback to edit.',
      unlockedNotice: 'Administrator feedback received. You can edit and resubmit this report.',
      loginFirst: 'Please login first',
      lockedAlert: 'This report is locked. You can edit it only after administrator feedback.',
      alreadyLockedAlert: 'This report was already submitted and is locked.',
      submit: 'Submit Report',
      resubmit: 'Resubmit Report'
    }
  }[language] || {
    title: 'Unified Report Form',
    reportType: 'Report Type',
    date: 'Date',
    startDate: 'Start Date',
    endDate: 'End Date',
    month: 'Month',
    year: 'Year',
    office: 'Office',
    task: 'Task',
    selectOffice: 'Select Office',
    selectTask: 'Select Task',
    kpiData: 'KPI Data',
    lockedNotice: 'This report is locked. Wait for administrator feedback to edit.',
    unlockedNotice: 'Administrator feedback received. You can edit and resubmit this report.',
    loginFirst: 'Please login first',
    lockedAlert: 'This report is locked. You can edit it only after administrator feedback.',
    alreadyLockedAlert: 'This report was already submitted and is locked.',
    submit: 'Submit Report',
    resubmit: 'Resubmit Report'
  };

  const getCurrentPeriodKey = (type = reportType, data = formData) => {
    switch (type) {
      case 'daily':
        return data.date || '';
      case 'weekly':
        return `${data.startDate || ''}|${data.endDate || ''}`;
      case 'monthly':
        return data.month || '';
      case 'yearly':
        return data.year ? String(data.year) : '';
      default:
        return '';
    }
  };

  const getReportPeriodKey = (report) => {
    switch (report.type) {
      case 'daily':
        return report.date ? String(report.date).slice(0, 10) : '';
      case 'weekly': {
        const start = report.startDate || report.weekStart || '';
        const end = report.endDate || '';
        return `${start}|${end}`;
      }
      case 'monthly':
        return report.month || (report.date ? String(report.date).slice(0, 7) : '');
      case 'yearly':
        if (report.year) return String(report.year);
        if (!report.date) return '';
        {
          const parsed = new Date(report.date);
          return Number.isNaN(parsed.getTime()) ? '' : String(parsed.getFullYear());
        }
      default:
        return '';
    }
  };

  const loadExistingReport = (nextFormData = formData, nextReportType = reportType) => {
    loadExistingReportFromApi(nextFormData, nextReportType);
  };

  const loadExistingReportFromApi = async (nextFormData = formData, nextReportType = reportType) => {
    if (!user || !nextFormData.office || !nextFormData.task) {
      setExistingReport(null);
      return;
    }

    const periodKey = getCurrentPeriodKey(nextReportType, nextFormData);
    if (!periodKey || (nextReportType === 'weekly' && periodKey === '|')) {
      setExistingReport(null);
      return;
    }

    let storedReports = [];
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/reports', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      storedReports = Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      storedReports = JSON.parse(localStorage.getItem('kpiReports') || '[]');
    }

    const matchedReports = storedReports
      .filter((report) => (
        report.userId === user.id &&
        report.officeId === nextFormData.office &&
        report.taskId === nextFormData.task &&
        report.type === nextReportType &&
        getReportPeriodKey(report) === periodKey
      ))
      .sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));

    const latestMatch = matchedReports[0] || null;
    setExistingReport(latestMatch);

    if (latestMatch && latestMatch.data) {
      const nextKpiData = {};
      Object.entries(latestMatch.data).forEach(([kpiId, value]) => {
        if (value && typeof value === 'object' && Object.prototype.hasOwnProperty.call(value, 'value')) {
          nextKpiData[kpiId] = String(value.value ?? '');
        }
      });
      setFormData((prev) => ({ ...prev, kpiData: nextKpiData }));
      return;
    }

    setFormData((prev) => ({ ...prev, kpiData: {} }));
  };

  const hasAdminFeedback = Boolean(existingReport?.feedback && String(existingReport.feedback).trim());
  const isReportLocked = Boolean(existingReport && !hasAdminFeedback);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const nextFormData = {
      ...formData,
      [name]: value
    };
    if (name === 'office') {
      nextFormData.task = '';
      nextFormData.kpiData = {};
    }
    setFormData(nextFormData);
    loadExistingReport(nextFormData, reportType);
  };

  const handleReportTypeChange = (nextType) => {
    setReportType(nextType);
    const resetFormData = {
      date: '',
      startDate: '',
      endDate: '',
      month: '',
      year: '',
      office: formData.office,
      task: formData.task,
      kpiData: {}
    };
    setFormData(resetFormData);
    setExistingReport(null);
    if (resetFormData.office && resetFormData.task) {
      loadExistingReport(resetFormData, nextType);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      alert(t.loginFirst);
      return;
    }

    if (isReportLocked) {
      alert(t.lockedAlert);
      return;
    }

    const payloadData = Object.keys(formData.kpiData).reduce((acc, kpiId) => {
      acc[kpiId] = {
        value: parseFloat(formData.kpiData[kpiId]),
        [reportType === 'daily' ? 'date' : reportType === 'monthly' ? 'month' : reportType === 'yearly' ? 'year' : 'startDate']:
          formData[reportType === 'daily' ? 'date' : reportType === 'monthly' ? 'month' : reportType === 'yearly' ? 'year' : 'startDate'],
        reportedBy: user.id
      };
      if (reportType === 'weekly') {
        acc[kpiId].endDate = formData.endDate;
      }
      return acc;
    }, {});

    const reportBase = {
      officeId: formData.office,
      taskId: formData.task,
      userId: user.id,
      userName: user.name,
      data: payloadData,
      timestamp: new Date().toISOString(),
      type: reportType,
      status: 'submitted',
      isLocked: true,
      periodKey: getCurrentPeriodKey()
    };

    if (reportType === 'daily') reportBase.date = formData.date;
    if (reportType === 'weekly') {
      reportBase.date = formData.startDate;
      reportBase.startDate = formData.startDate;
      reportBase.endDate = formData.endDate;
      reportBase.weekStart = formData.startDate;
    }
    if (reportType === 'monthly') {
      reportBase.month = formData.month;
      reportBase.date = `${formData.month}-01`;
    }
    if (reportType === 'yearly') {
      reportBase.year = Number(formData.year);
      reportBase.date = `${formData.year}-01-01`;
    }

    if (existingReport && !hasAdminFeedback) {
      alert(t.alreadyLockedAlert);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await api.post('/reports', reportBase, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Keep local cache for offline fallback.
      const storedReports = JSON.parse(localStorage.getItem('kpiReports') || '[]');
      localStorage.setItem('kpiReports', JSON.stringify([
        ...storedReports,
        { id: Date.now(), ...reportBase }
      ]));
    } catch (error) {
      const storedReports = JSON.parse(localStorage.getItem('kpiReports') || '[]');
      localStorage.setItem('kpiReports', JSON.stringify([
        ...storedReports,
        { id: Date.now(), ...reportBase }
      ]));
    }

    alert('Report submitted successfully');
    navigate('/dashboard');
  };

  const renderDateFields = () => {
    switch (reportType) {
      case 'daily':
        return (
          <div className="form-group">
            <label htmlFor="date">{t.date}:</label>
            <input type="date" id="date" name="date" value={formData.date} onChange={handleInputChange} required />
          </div>
        );
      case 'weekly':
        return (
          <>
            <div className="form-group">
              <label htmlFor="startDate">{t.startDate}:</label>
              <input type="date" id="startDate" name="startDate" value={formData.startDate} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="endDate">{t.endDate}:</label>
              <input type="date" id="endDate" name="endDate" value={formData.endDate} onChange={handleInputChange} required />
            </div>
          </>
        );
      case 'monthly':
        return (
          <div className="form-group">
            <label htmlFor="month">{t.month}:</label>
            <input type="month" id="month" name="month" value={formData.month} onChange={handleInputChange} required />
          </div>
        );
      case 'yearly':
        return (
          <div className="form-group">
            <label htmlFor="year">{t.year}:</label>
            <input type="number" id="year" name="year" value={formData.year} onChange={handleInputChange} min="2020" max="2030" required />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="daily-report">
      <div className="report-header">
        <button onClick={() => navigate('/dashboard')} className="btn-secondary back-button">
          <i className="fas fa-arrow-left"></i> Back to Dashboard
        </button>
        <h1>{t.title}</h1>
        <button onClick={toggleLanguage} className="language-toggle" title={language === 'am' ? 'Switch to English' : 'Switch to Amharic'}>
          {language === 'am' ? 'EN' : 'AM'}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="report-form">
        <div className="form-group">
          <label htmlFor="reportType">{t.reportType}:</label>
          <select id="reportType" name="reportType" value={reportType} onChange={(e) => handleReportTypeChange(e.target.value)}>
            <option value="daily">Daily Report</option>
            <option value="weekly">Weekly Report</option>
            <option value="monthly">Monthly Report</option>
            <option value="yearly">Yearly Report</option>
          </select>
        </div>

        {renderDateFields()}

        <div className="form-group">
          <label htmlFor="office">{t.office}:</label>
          <select id="office" name="office" value={formData.office} onChange={handleInputChange} required>
            <option value="">{t.selectOffice}</option>
            {officesData
              .filter((office) => canAccessOffice(office.id))
              .map((office) => (
                <option key={office.id} value={office.id}>
                  {language === 'am' ? office.name_am : office.name_en}
                </option>
              ))}
          </select>
        </div>

        {formData.office && (
          <div className="form-group">
            <label htmlFor="task">{t.task}:</label>
            <select id="task" name="task" value={formData.task || ''} onChange={handleInputChange} required>
              <option value="">{t.selectTask}</option>
              {officesData.find((office) => office.id === formData.office)?.tasks.map((task) => (
                <option key={task.id} value={task.id}>
                  {language === 'am' ? task.title_am : task.title_en}
                </option>
              ))}
            </select>
          </div>
        )}

        {formData.task && (
          <div className="kpi-section">
            <h3>{t.kpiData}</h3>
            {existingReport && (
              <p style={{ marginTop: 0, color: isReportLocked ? '#b45309' : '#166534' }}>
                {isReportLocked ? t.lockedNotice : t.unlockedNotice}
              </p>
            )}
            {officesData.find((office) => office.id === formData.office)?.tasks.find((task) => task.id === formData.task)?.kpis.map((kpi) => (
              <div key={kpi.id} className="form-group">
                <label htmlFor={kpi.id}>
                  {language === 'am' ? kpi.name_am : kpi.name_en} ({kpi.unit}):
                </label>
                <input
                  type="number"
                  id={kpi.id}
                  name={kpi.id}
                  value={formData.kpiData[kpi.id] || ''}
                  onChange={(e) => {
                    const { name, value } = e.target;
                    setFormData((prev) => ({
                      ...prev,
                      kpiData: {
                        ...prev.kpiData,
                        [name]: value
                      }
                    }));
                  }}
                  min="0"
                  required
                  disabled={isReportLocked}
                />
              </div>
            ))}
          </div>
        )}

        <button type="submit" className="submit-btn" disabled={isReportLocked}>
          {existingReport && hasAdminFeedback ? t.resubmit : t.submit}
        </button>
      </form>
    </div>
  );
};

export default UnifiedReport;
