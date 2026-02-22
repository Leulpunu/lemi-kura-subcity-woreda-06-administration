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
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Load reports from localStorage
    const storedReports = JSON.parse(localStorage.getItem('kpiReports') || '[]');

    // Filter reports based on user access
    const filteredReports = storedReports.filter(report => {
      if (user && user.role === 'admin') {
        return true; // Admin sees all reports
      }
      return user && user.accessibleOffices && user.accessibleOffices.includes(report.officeId);
    });

    setReports(filteredReports);
  }, [user]);

  const translations = {
    am: {
      reports: 'ሪፖርቶች',
      noReports: 'ሪፖርት አልተለመደም።',
      exportExcel: 'ኤክሰል ወደ መላክ',
      exportPDF: 'ፒዲኤፍ ወደ መላክ',
      backToDashboard: 'ወደ ዳሽቦርድ ተመለስ',
      date: 'ቀን',
      office: 'ቢሮ',
      task: 'ተግባር',
      kpi: 'ኪፒአይ',
      value: 'እሴት',
      feedback: 'አስተያየት',
      provideFeedback: 'አስተያየት ስጥ',
      submitFeedback: 'አስተያየት አስገባ',
      cancel: 'ሰርዝ',
      feedbackPlaceholder: 'አስተያየት ያስገቡ...'
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
      kpi: 'KPI',
      value: 'Value',
      feedback: 'Feedback',
      provideFeedback: 'Provide Feedback',
      submitFeedback: 'Submit Feedback',
      cancel: 'Cancel',
      feedbackPlaceholder: 'Enter feedback...'
    }
  };

  const t = translations[language];

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(reports);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Reports');
    XLSX.writeFile(workbook, 'kpi-reports.xlsx');
  };

  const exportToPDF = () => {
    const element = document.getElementById('reports-table');
    html2canvas(element).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
      pdf.addImage(imgData, 'PNG', 0, 0);
      pdf.save('kpi-reports.pdf');
    });
  };

  const downloadReport = (report) => {
    // Create a detailed report object for download
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

    // Convert to JSON and download
    const dataStr = JSON.stringify(reportDetails, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

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
    const updatedReports = storedReports.map(report => {
      if (report.id === feedbackModal.reportId) {
        return {
          ...report,
          feedback: feedbackModal.feedback,
          feedbackBy: user.name,
          feedbackDate: new Date().toISOString()
        };
      }
      return report;
    });

    localStorage.setItem('kpiReports', JSON.stringify(updatedReports));

    // Update local state
    setReports(prevReports =>
      prevReports.map(report =>
        report.id === feedbackModal.reportId
          ? { ...report, feedback: feedbackModal.feedback, feedbackBy: user.name }
          : report
      )
    );

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

  return (
    <div className="reporting">
      <div className="reporting-header">
        <button onClick={() => navigate('/')} className="btn-secondary back-button">
          <i className="fas fa-arrow-left"></i> {t.backToDashboard}
        </button>
        <h2>{t.reports}</h2>
      </div>

      <div className="export-buttons">
        <button onClick={exportToExcel} className="btn-primary">
          {t.exportExcel}
        </button>
        <button onClick={exportToPDF} className="btn-secondary">
          {t.exportPDF}
        </button>
      </div>

      {reports.length === 0 ? (
        <p>{t.noReports}</p>
      ) : (
        <div id="reports-table" className="reports-table">
          <table>
            <thead>
              <tr>
                <th></th>
                <th>{t.date}</th>
                <th>{t.office}</th>
                <th>{t.task}</th>
                <th>{t.kpi}</th>
                <th>{t.value}</th>
                {user && user.role === 'admin' && <th>{t.feedback}</th>}
              </tr>
            </thead>
            <tbody>
              {reports.map((report, index) => (
                <React.Fragment key={index}>
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
                      {new Date(report.timestamp).toLocaleDateString()}
                    </td>
                    <td onClick={() => downloadReport(report)} style={{ cursor: 'pointer' }}>
                      {officesData.find(o => o.id === report.officeId)?.name_am || report.officeId}
                    </td>
                    <td onClick={() => downloadReport(report)} style={{ cursor: 'pointer' }}>
                      {(() => {
                        const office = officesData.find(o => o.id === report.officeId);
                        const task = office?.tasks.find(t => t.id === report.taskId);
                        return task ? `${task.number_am} - ${language === 'am' ? task.title_am : task.title_en}` : report.taskId;
                      })()}
                    </td>
                    <td onClick={() => downloadReport(report)} style={{ cursor: 'pointer' }}>
                      {(() => {
                        const office = officesData.find(o => o.id === report.officeId);
                        const task = office?.tasks.find(t => t.id === report.taskId);
                        const kpis = Object.keys(report.data || {});
                        return kpis.length > 0 ? kpis.map(kpiId => {
                          const kpi = task?.kpis.find(k => k.id === kpiId);
                          return kpi ? (language === 'am' ? kpi.name_am : kpi.name_en) : kpiId;
                        }).join(', ') : 'N/A';
                      })()}
                    </td>
                    <td onClick={() => downloadReport(report)} style={{ cursor: 'pointer' }}>
                      {Object.values(report.data || {}).map(d => d.value || 0).join(', ')}
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
                      <td colSpan={user && user.role === 'admin' ? 7 : 6}>
                        <div className="report-details">
                          <div className="detail-row">
                            <span className="detail-label">{language === 'am' ? 'የሪፖርት አይዲ' : 'Report ID'}:</span>
                            <span className="detail-value">{report.id}</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">{language === 'am' ? 'የሪፖርት አይነት' : 'Report Type'}:</span>
                            <span className="detail-value">{report.type}</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">{language === 'am' ? 'ተጠቃሚ' : 'User'}:</span>
                            <span className="detail-value">{report.userName}</span>
                          </div>
                          {report.notes && (
                            <div className="detail-row">
                              <span className="detail-label">{language === 'am' ? 'ማስታወሻዎች' : 'Notes'}:</span>
                              <span className="detail-value">{report.notes}</span>
                            </div>
                          )}
                          <div className="detail-row">
                            <span className="detail-label">{language === 'am' ? 'የተላከበት ጊዜ' : 'Submitted At'}:</span>
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

      {/* Feedback Modal */}
      {feedbackModal.show && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{t.provideFeedback}</h3>
            <textarea
              value={feedbackModal.feedback}
              onChange={(e) => setFeedbackModal(prev => ({ ...prev, feedback: e.target.value }))}
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
