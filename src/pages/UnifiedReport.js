import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { officesData } from '../data/offices';
import '../styles/ReportForm.css'; // Use the ReportForm CSS

const UnifiedReport = ({ language, toggleLanguage }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Debug logging
  console.log('UnifiedReport - User:', user);
  console.log('UnifiedReport - User Role:', user?.role);
  console.log('UnifiedReport - Is Admin:', user?.role === 'admin');
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      alert(language === 'am' ? 'እባክዎ መጀመሪያ ይለገቡ' : 'Please login first');
      return;
    }

    const report = {
      id: Date.now(),
      officeId: formData.office,
      taskId: formData.task,
      userId: user.id,
      userName: user.name,
      data: Object.keys(formData.kpiData).reduce((acc, kpiId) => {
        acc[kpiId] = {
          value: parseFloat(formData.kpiData[kpiId]),
          [reportType === 'daily' ? 'date' : reportType === 'monthly' ? 'month' : reportType === 'yearly' ? 'year' : 'startDate']: formData[reportType === 'daily' ? 'date' : reportType === 'monthly' ? 'month' : reportType === 'yearly' ? 'year' : 'startDate'],
          reportedBy: user.id
        };
        if (reportType === 'weekly') {
          acc[kpiId].endDate = formData.endDate;
        }
        return acc;
      }, {}),
      timestamp: new Date().toISOString(),
      type: reportType
    };

    // Save to localStorage
    const existingReports = JSON.parse(localStorage.getItem('kpiReports') || '[]');
    existingReports.push(report);
    localStorage.setItem('kpiReports', JSON.stringify(existingReports));

    alert(language === 'am' ? 'ሪፖርቱ ተሳካ ተላከ' : 'Report submitted successfully');
    navigate('/dashboard');
  };

  const renderDateFields = () => {
    switch (reportType) {
      case 'daily':
        return (
          <div className="form-group">
            <label htmlFor="date">
              {language === 'am' ? 'ቀን' : 'Date'}:
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              required
            />
          </div>
        );
      case 'weekly':
        return (
          <>
            <div className="form-group">
              <label htmlFor="startDate">
                {language === 'am' ? 'የመጀመሪያ ቀን' : 'Start Date'}:
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="endDate">
                {language === 'am' ? 'የመጨረሻ ቀን' : 'End Date'}:
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                required
              />
            </div>
          </>
        );
      case 'monthly':
        return (
          <>
            <div className="form-group">
              <label htmlFor="month">
                {language === 'am' ? 'ወር' : 'Month'}:
              </label>
              <input
                type="month"
                id="month"
                name="month"
                value={formData.month}
                onChange={handleInputChange}
                required
              />
            </div>
          </>
        );
      case 'yearly':
        return (
          <div className="form-group">
            <label htmlFor="year">
              {language === 'am' ? 'አመት' : 'Year'}:
            </label>
            <input
              type="number"
              id="year"
              name="year"
              value={formData.year}
              onChange={handleInputChange}
              min="2020"
              max="2030"
              required
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="daily-report">
      <div className="report-header">
        <h1>{language === 'am' ? 'አንድ ሪፖርት ቅጽ' : 'Unified Report Form'}</h1>
        <button
          onClick={toggleLanguage}
          className="language-toggle"
          title={language === 'am' ? 'Switch to English' : 'አማርኛ ቀይር'}
        >
          {language === 'am' ? 'EN' : 'አማ'}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="report-form">
        <div className="form-group">
          <label htmlFor="reportType">
            {language === 'am' ? 'የሪፖርት አይነት' : 'Report Type'}:
          </label>
          <select
            id="reportType"
            name="reportType"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
          >
            <option value="daily">{language === 'am' ? 'የቀን ሪፖርት' : 'Daily Report'}</option>
            <option value="weekly">{language === 'am' ? 'የሳምንት ሪፖርት' : 'Weekly Report'}</option>
            <option value="monthly">{language === 'am' ? 'የወር ሪፖርት' : 'Monthly Report'}</option>
            <option value="yearly">{language === 'am' ? 'የአመት ሪፖርት' : 'Yearly Report'}</option>
          </select>
        </div>

        {renderDateFields()}

        <div className="form-group">
          <label htmlFor="office">
            {language === 'am' ? 'ቢሮ' : 'Office'}:
          </label>
          <select
            id="office"
            name="office"
            value={formData.office}
            onChange={handleInputChange}
            required
          >
            <option value="">{language === 'am' ? 'ቢሮ ይምረጡ' : 'Select Office'}</option>
            {officesData
              .filter(office => {
                // Admin sees all offices, regular users see only their accessible offices
                if (user && user.role === 'admin') {
                  return true;
                }
                return user && user.accessibleOffices && user.accessibleOffices.includes(office.id);
              })
              .map(office => (
                <option key={office.id} value={office.id}>
                  {language === 'am' ? office.name_am : office.name_en}
                </option>
              ))}
          </select>
        </div>

        {formData.office && (
          <div className="form-group">
            <label htmlFor="task">
              {language === 'am' ? 'ተግባር' : 'Task'}:
            </label>
            <select
              id="task"
              name="task"
              value={formData.task || ''}
              onChange={handleInputChange}
              required
            >
              <option value="">{language === 'am' ? 'ተግባር ይምረጡ' : 'Select Task'}</option>
              {officesData.find(office => office.id === formData.office)?.tasks.map(task => (
                <option key={task.id} value={task.id}>
                  {language === 'am' ? task.title_am : task.title_en}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Add KPI fields here based on selected task */}
        {formData.task && (
          <div className="kpi-section">
            <h3>{language === 'am' ? 'KPI ውሂብ' : 'KPI Data'}</h3>
            {officesData.find(office => office.id === formData.office)?.tasks.find(task => task.id === formData.task)?.kpis.map(kpi => (
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
                    setFormData(prev => ({
                      ...prev,
                      kpiData: {
                        ...prev.kpiData,
                        [name]: value
                      }
                    }));
                  }}
                  min="0"
                  required
                />
              </div>
            ))}
          </div>
        )}

        <button type="submit" className="submit-btn">
          {language === 'am' ? 'ሪፖርት አስገባ' : 'Submit Report'}
        </button>
      </form>
    </div>
  );
};

export default UnifiedReport;
