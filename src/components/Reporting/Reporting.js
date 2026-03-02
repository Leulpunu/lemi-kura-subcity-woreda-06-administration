import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { officesData } from '../../data/offices';
import { useAuth } from '../../contexts/AuthContext';
import './Reporting.css';

const Reporting = ({ language }) => {
  const [reports, setReports] = useState([]);
  const [feedbackModal, setFeedbackModal] = useState({ show: false, reportId: null, feedback: '' });
  const [expandedReports, setExpandedReports] = useState(new Set());
  const [reportTypeFilter, setReportTypeFilter] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const storedReports = JSON.parse(localStorage.getItem('kpiReports') || '[]');
    const filteredByAccess = storedReports.filter((report) => {
      if (user && user.role === 'admin') return true;
      return user && user.accessibleOffices && user.accessibleOffices.includes(report.officeId);
    });
    setReports(filteredByAccess);
  }, [user]);

  const translations = {
    am: {
      reports: 'Reports',
      noReports: 'No reports found.',
      exportExcel: 'Export to Excel',
      exportPDF: 'Export to PDF',
      backToDashboard: 'Back to Dashboard',
      date: 'Date',
      office: 'Office',
      task: 'Task',
      type: 'Type',
      kpi: 'KPI',
      value: 'Value',
      feedback: 'Feedback',
      fromDate: 'From Date',
      toDate: 'To Date',
      allTypes: 'All',
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly',
      yearly: 'Yearly',
      clearFilters: 'Clear Filters',
      provideFeedback: 'Provide Feedback',
      submitFeedback: 'Submit Feedback',
      cancel: 'Cancel',
      feedbackPlaceholder: 'Enter feedback...'
    },
    en: {
      reports: 'Reports',
      noReports: 'No reports found.',
      exportExcel: 'Export to Excel',
      exportPDF: 'Export to PDF',
      backToDashboard: 'Back to Dashboard',
      date: 'Date',
      office: 'Office',
      task: 'Task',
      type: 'Type',
      kpi: 'KPI',
      value: 'Value',
      feedback: 'Feedback',
      fromDate: 'From Date',
      toDate: 'To Date',
      allTypes: 'All',
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly',
      yearly: 'Yearly',
      clearFilters: 'Clear Filters',
      provideFeedback: 'Provide Feedback',
      submitFeedback: 'Submit Feedback',
      cancel: 'Cancel',
      feedbackPlaceholder: 'Enter feedback...'
    }
  };

  const t = translations[language] || translations.en;

  const getReportDate = (report) => {
    if (report.type === 'monthly' && report.month) {
      return new Date(`${report.month}-01T00:00:00`);
    }
    if (report.type === 'yearly' && report.year) {
      return new Date(`${report.year}-01-01T00:00:00`);
    }
    if (report.type === 'weekly' && report.startDate) {
      return new Date(`${report.startDate}T00:00:00`);
    }
    if (report.date) {
      return new Date(`${String(report.date).slice(0, 10)}T00:00:00`);
    }
    return new Date(report.timestamp);
  };

  const filteredReports = reports.filter((report) => {
    if (reportTypeFilter !== 'all' && report.type !== reportTypeFilter) {
      return false;
    }

    const reportDate = getReportDate(report);
    if (Number.isNaN(reportDate.getTime())) {
      return false;
    }

    if (fromDate) {
      const from = new Date(`${fromDate}T00:00:00`);
      if (reportDate < from) return false;
    }

    if (toDate) {
      const to = new Date(`${toDate}T23:59:59`);
      if (reportDate > to) return false;
    }

    return true;
  });

  const exportToExcel = () => {
    const exportRows = filteredReports.map((report) => ({
      id: report.id,
      type: report.type,
      date: report.date || report.month || report.year || report.timestamp,
      office: report.officeId,
      task: report.taskId,
      user: report.userName,
      feedback: report.feedback || ''
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Reports');
    XLSX.writeFile(workbook, 'kpi-reports.xlsx');
  };

  const exportToPDF = () => {
    const element = document.getElementById('reports-table');
    if (!element) return;
    html2canvas(element).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
      pdf.addImage(imgData, 'PNG', 0, 0);
      pdf.save('kpi-reports.pdf');
    });
  };

  const downloadReport = (report) => {
    const reportDetails = {
      id: report.id,
      date: report.timestamp,
      type: report.type,
      office: report.officeId,
      task: report.taskId,
      user: report.userName,
      data: report.data,
      notes: report.notes || '',
      feedback: report.feedback || '',
      feedbackBy: report.feedbackBy || ''
    };

    const dataStr = JSON.stringify(reportDetails, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    const exportFileDefaultName = `kpi-report-${report.type}-${report.id}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const openFeedbackModal = (reportId) => {
    setFeedbackModal({ show: true, reportId, feedback: '' });
  };

  const closeFeedbackModal = () => {
    setFeedbackModal({ show: false, reportId: null, feedback: '' });
  };

  const submitFeedback = () => {
    if (!feedbackModal.feedback.trim()) return;

    const storedReports = JSON.parse(localStorage.getItem('kpiReports') || '[]');
    const updatedReports = storedReports.map((report) => {
      if (report.id === feedbackModal.reportId) {
        return {
          ...report,
          feedback: feedbackModal.feedback,
          feedbackBy: user.name,
          feedbackDate: new Date().toISOString(),
          status: 'feedback_provided',
          isLocked: false
        };
      }
      return report;
    });

    localStorage.setItem('kpiReports', JSON.stringify(updatedReports));
    setReports((prevReports) => (
      prevReports.map((report) => (
        report.id === feedbackModal.reportId
          ? {
              ...report,
              feedback: feedbackModal.feedback,
              feedbackBy: user.name,
              feedbackDate: new Date().toISOString(),
              status: 'feedback_provided',
              isLocked: false
            }
          : report
      ))
    ));
    closeFeedbackModal();
  };

  const toggleReportExpansion = (reportId) => {
    const newExpanded = new Set(expandedReports);
    if (newExpanded.has(reportId)) {
      newExpanded.delete(reportId);
    } else {
      newExpanded.add(reportId);
    }
    setExpandedReports(newExpanded);
  };

  const clearFilters = () => {
    setReportTypeFilter('all');
    setFromDate('');
    setToDate('');
  };

  return (
    <div className="reporting">
      <div className="reporting-header">
        <button onClick={() => navigate('/dashboard')} className="btn-secondary back-button">
          <i className="fas fa-arrow-left"></i> {t.backToDashboard}
        </button>
        <h2>{t.reports}</h2>
      </div>

      <div className="export-buttons">
        {user && user.role === 'admin' && (
          <>
            <select
              value={reportTypeFilter}
              onChange={(e) => setReportTypeFilter(e.target.value)}
              className="btn-secondary"
              title={t.type}
            >
              <option value="all">{t.allTypes}</option>
              <option value="daily">{t.daily}</option>
              <option value="weekly">{t.weekly}</option>
              <option value="monthly">{t.monthly}</option>
              <option value="yearly">{t.yearly}</option>
            </select>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="btn-secondary"
              title={t.fromDate}
            />
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="btn-secondary"
              title={t.toDate}
            />
            <button onClick={clearFilters} className="btn-secondary">
              {t.clearFilters}
            </button>
          </>
        )}
        <button onClick={exportToExcel} className="btn-primary" disabled={filteredReports.length === 0}>
          {t.exportExcel}
        </button>
        <button onClick={exportToPDF} className="btn-secondary" disabled={filteredReports.length === 0}>
          {t.exportPDF}
        </button>
      </div>

      {filteredReports.length === 0 ? (
        <p>{t.noReports}</p>
      ) : (
        <div id="reports-table" className="reports-table">
          <table>
            <thead>
              <tr>
                <th></th>
                <th>{t.date}</th>
                <th>{t.type}</th>
                <th>{t.office}</th>
                <th>{t.task}</th>
                <th>{t.kpi}</th>
                <th>{t.value}</th>
                {user && user.role === 'admin' && <th>{t.feedback}</th>}
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((report) => (
                <React.Fragment key={report.id}>
                  <tr>
                    <td>
                      <button
                        className="expand-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleReportExpansion(report.id);
                        }}
                        title={expandedReports.has(report.id) ? 'Collapse details' : 'Expand details'}
                      >
                        <i className={`fas fa-chevron-down expand-icon ${expandedReports.has(report.id) ? 'expanded' : ''}`}></i>
                      </button>
                    </td>
                    <td onClick={() => downloadReport(report)} style={{ cursor: 'pointer' }}>
                      {getReportDate(report).toLocaleDateString()}
                    </td>
                    <td onClick={() => downloadReport(report)} style={{ cursor: 'pointer' }}>
                      {report.type || 'N/A'}
                    </td>
                    <td onClick={() => downloadReport(report)} style={{ cursor: 'pointer' }}>
                      {officesData.find((o) => o.id === report.officeId)?.[language === 'am' ? 'name_am' : 'name_en'] || report.officeId}
                    </td>
                    <td onClick={() => downloadReport(report)} style={{ cursor: 'pointer' }}>
                      {(() => {
                        const office = officesData.find((o) => o.id === report.officeId);
                        const task = office?.tasks.find((taskItem) => taskItem.id === report.taskId);
                        return task ? `${task.number_am} - ${language === 'am' ? task.title_am : task.title_en}` : report.taskId;
                      })()}
                    </td>
                    <td onClick={() => downloadReport(report)} style={{ cursor: 'pointer' }}>
                      {(() => {
                        const office = officesData.find((o) => o.id === report.officeId);
                        const task = office?.tasks.find((taskItem) => taskItem.id === report.taskId);
                        const kpis = Object.keys(report.data || {});
                        if (kpis.length === 0) return 'N/A';
                        return kpis.map((kpiId) => {
                          const kpi = task?.kpis.find((k) => k.id === kpiId);
                          return kpi ? (language === 'am' ? kpi.name_am : kpi.name_en) : kpiId;
                        }).join(', ');
                      })()}
                    </td>
                    <td onClick={() => downloadReport(report)} style={{ cursor: 'pointer' }}>
                      {Object.values(report.data || {}).map((d) => d.value || 0).join(', ')}
                    </td>
                    {user && user.role === 'admin' && (
                      <td onClick={(e) => e.stopPropagation()}>
                        {report.feedback ? (
                          <div className="feedback-display">
                            <span>{report.feedback}</span>
                            <small>({report.feedbackBy})</small>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openFeedbackModal(report.id);
                            }}
                            className="btn-secondary btn-small"
                          >
                            {t.provideFeedback}
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                  {expandedReports.has(report.id) && (
                    <tr>
                      <td colSpan={user && user.role === 'admin' ? 8 : 7}>
                        <div className="report-details">
                          <div className="detail-row">
                            <span className="detail-label">Report ID:</span>
                            <span className="detail-value">{report.id}</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Report Type:</span>
                            <span className="detail-value">{report.type}</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">User:</span>
                            <span className="detail-value">{report.userName}</span>
                          </div>
                          {report.notes && (
                            <div className="detail-row">
                              <span className="detail-label">Notes:</span>
                              <span className="detail-value">{report.notes}</span>
                            </div>
                          )}
                          <div className="detail-row">
                            <span className="detail-label">Submitted At:</span>
                            <span className="detail-value">{new Date(report.timestamp).toLocaleString()}</span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {feedbackModal.show && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{t.provideFeedback}</h3>
            <textarea
              value={feedbackModal.feedback}
              onChange={(e) => setFeedbackModal((prev) => ({ ...prev, feedback: e.target.value }))}
              placeholder={t.feedbackPlaceholder}
              rows="4"
              className="feedback-textarea"
            />
            <div className="modal-actions">
              <button onClick={closeFeedbackModal} className="btn-secondary">
                {t.cancel}
              </button>
              <button onClick={submitFeedback} className="btn-primary">
                {t.submitFeedback}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reporting;
