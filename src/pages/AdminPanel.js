// src/pages/AdminPanel.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { officesData } from '../data/offices';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import '../styles/AdminPanel.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend);

const AdminPanel = ({ language, toggleLanguage }) => {
    const { createUser } = useAuth();
    const navigate = useNavigate();
    const [reports, setReports] = useState([]);
    const [users, setUsers] = useState([]);
    const [plans, setPlans] = useState([]);
    const [selectedOffice, setSelectedOffice] = useState('all');
    const [timeRange, setTimeRange] = useState('monthly');
    const [planOfficeFilter, setPlanOfficeFilter] = useState('all');
    const [planStatusFilter, setPlanStatusFilter] = useState('all');
    const [planYearFilter, setPlanYearFilter] = useState('');
    const [showUserForm, setShowUserForm] = useState(false);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [selectedReport, setSelectedReport] = useState(null);
    const [newUser, setNewUser] = useState({
        username: '',
        password: '',
        name: '',
        position_am: '',
        position_en: '',
        office: '',
        role: 'user',
        accessibleOffices: []
    });

    // Fetch users from backend API
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await api.get('/auth/users', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                setUsers(response.data);
            } catch (error) {
                console.error('Error fetching users from API:', error);
                // Fallback to localStorage if API fails
                const savedUsers = JSON.parse(localStorage.getItem('users') || '[]');
                setUsers(savedUsers);
            } finally {
                setLoadingUsers(false);
            }
        };

        fetchUsers();
    }, []);

    useEffect(() => {
        const fetchReportsAndPlans = async () => {
            try {
                const token = localStorage.getItem('token');
                const reportsResponse = await api.get('/reports', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setReports(Array.isArray(reportsResponse.data) ? reportsResponse.data : []);
            } catch (error) {
                const savedReports = JSON.parse(localStorage.getItem('kpiReports') || '[]');
                setReports(savedReports);
            }

            try {
                const token = localStorage.getItem('token');
                const plansResponse = await api.get('/annualPlans', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setPlans(Array.isArray(plansResponse.data) ? plansResponse.data : []);
            } catch (error) {
                const savedPlans = JSON.parse(localStorage.getItem('annualPlans') || '[]');
                setPlans(savedPlans);
            }
        };

        fetchReportsAndPlans();
    }, []);

    // Get target from saved plans
    const getTargetFromPlan = (officeId, taskId, kpiId) => {
        const plan = plans.find(p => p.officeId === officeId && p.taskId === taskId);
        if (plan && plan.annualTargets && plan.annualTargets[kpiId]) {
            return plan.annualTargets[kpiId];
        }
        return 1; // Default target if no plan found
    };

    const filteredPlans = plans.filter((plan) => {
        const matchesOffice = planOfficeFilter === 'all' || plan.officeId === planOfficeFilter;
        const matchesStatus = planStatusFilter === 'all' || (plan.status || 'submitted') === planStatusFilter;
        const matchesYear = !planYearFilter || String(plan.year) === String(planYearFilter);
        return matchesOffice && matchesStatus && matchesYear;
    });

    const pendingPlans = filteredPlans.filter((plan) => (plan.status || 'submitted') === 'submitted');
    const reviewedPlans = filteredPlans
        .filter((plan) => ['approved', 'rejected'].includes(plan.status))
        .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0));

    const handlePlanDecision = async (planId, action) => {
        try {
            const token = localStorage.getItem('token');
            const payload = { id: planId, action };
            if (action === 'reject') {
                const reason = window.prompt(language === 'am' ? 'የመመለሻ ምክንያት ያስገቡ' : 'Enter rejection reason');
                if (!reason || !reason.trim()) return;
                payload.rejectionReason = reason.trim();
            }

            const response = await api.patch('/annualPlans', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setPlans((prev) => prev.map((plan) => (
                plan.id === planId ? response.data : plan
            )));
        } catch (error) {
            alert(error?.response?.data?.message || (language === 'am' ? 'ውሳኔ መውሰድ አልተሳካም' : 'Failed to process annual plan decision'));
        }
    };

    // Filter reports based on time range
    const filterReportsByTimeRange = (reports) => {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfYear = new Date(now.getFullYear(), 0, 1);

        return reports.filter(report => {
            const reportDate = getReportDate(report);
            if (!reportDate || Number.isNaN(reportDate.getTime())) return false;
            switch (timeRange) {
                case 'daily':
                    return reportDate >= startOfDay;
                case 'weekly':
                    return reportDate >= startOfWeek;
                case 'monthly':
                    return reportDate >= startOfMonth;
                case 'yearly':
                    return reportDate >= startOfYear;
                default:
                    return true;
            }
        });
    };

    const getReportDate = (report) => {
        if (report?.type === 'monthly' && report.month) return new Date(`${report.month}-01T00:00:00`);
        if (report?.type === 'yearly' && report.year) return new Date(`${report.year}-01-01T00:00:00`);
        if (report?.type === 'weekly' && report.startDate) return new Date(`${report.startDate}T00:00:00`);
        if (report?.date) return new Date(`${String(report.date).slice(0, 10)}T00:00:00`);
        if (report?.timestamp) return new Date(report.timestamp);
        return null;
    };

    const formatReportDate = (report) => {
        const reportDate = getReportDate(report);
        if (!reportDate || Number.isNaN(reportDate.getTime())) {
            return language === 'am' ? 'Unknown Date' : 'Unknown Date';
        }
        return reportDate.toLocaleDateString();
    };

    // Calculate office performance
    const calculateOfficePerformance = () => {
        const filteredReports = filterReportsByTimeRange(reports);
        return officesData.map(office => {
            const officeReports = filteredReports.filter(r => r.officeId === office.id);
            let totalProgress = 0;
            let kpiCount = 0;

            officeReports.forEach(report => {
                Object.keys(report.data).forEach(kpiId => {
                    const kpiData = report.data[kpiId];
                    // Get target from saved plan
                    const target = getTargetFromPlan(office.id, report.taskId, kpiId);
                    if (target > 0) {
                        totalProgress += (kpiData.value / target) * 100;
                        kpiCount++;
                    }
                });
            });

            const avgProgress = kpiCount > 0 ? totalProgress / kpiCount : 0;

            return {
                name: language === 'am' ? office.name_am : office.name_en,
                progress: avgProgress,
                color: office.color,
                reportCount: officeReports.length
            };
        });
    };

    const performanceData = calculateOfficePerformance();

    // Chart data
    const barChartData = {
        labels: performanceData.map(p => p.name),
        datasets: [{
            label: language === 'am' ? 'አፈፃፀም %' : 'Performance %',
            data: performanceData.map(p => p.progress),
            backgroundColor: performanceData.map(p => p.color),
            borderColor: performanceData.map(p => p.color),
            borderWidth: 1
        }]
    };

    // Handle user creation
    const handleCreateUser = () => {
        if (!newUser.username || !newUser.password || !newUser.name || !newUser.office || newUser.accessibleOffices.length === 0) {
            alert(language === 'am' ? 'እባክዎ ሁሉንም አስፈላጊ ቦታዎች ያስገቡ እና ቢሮዎችን ይምረጡ' : 'Please fill in all required fields and select at least one accessible office');
            return;
        }

        try {
            const createdUser = createUser(newUser);
            setUsers([...users, createdUser]);
            setNewUser({
                username: '',
                password: '',
                name: '',
                position_am: '',
                position_en: '',
                office: '',
                role: 'user',
                accessibleOffices: []
            });
            setShowUserForm(false);
            alert(language === 'am' ? 'ተጠቃሚ ተሳክቷል!' : 'User created successfully!');
        } catch (error) {
            alert(language === 'am' ? 'ተጠቃሚ መፍጠር አልተሳካም' : 'Failed to create user');
        }
    };

    // Handle user deletion
    const handleDeleteUser = (userId) => {
        if (window.confirm(language === 'am' ? 'እርግጠኛ ነዎት ይህን ተጠቃሚ መሰረዝ ይፈልጋሉ?' : 'Are you sure you want to delete this user?')) {
            const updatedUsers = users.filter(user => user.id !== userId);
            setUsers(updatedUsers);
            localStorage.setItem('users', JSON.stringify(updatedUsers));
            alert(language === 'am' ? 'ተጠቃሚ ተሰረዘ!' : 'User deleted successfully!');
        }
    };

    return (
        <div className="admin-panel">
            <button onClick={() => navigate('/dashboard')} className="btn-secondary back-button">
                <i className="fas fa-arrow-left"></i> Back to Dashboard
            </button>
            <h1>{language === 'am' ? 'አስተዳደር ፓነል' : 'Admin Panel'}</h1>

            <div className="admin-filters">
                <select value={selectedOffice} onChange={(e) => setSelectedOffice(e.target.value)}>
                    <option value="all">{language === 'am' ? 'ሁሉም ቢሮዎች' : 'All Offices'}</option>
                    {officesData.map(office => (
                        <option key={office.id} value={office.id}>
                            {language === 'am' ? office.name_am : office.name_en}
                        </option>
                    ))}
                </select>

                <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
                    <option value="daily">{language === 'am' ? 'እለታዊ' : 'Daily'}</option>
                    <option value="weekly">{language === 'am' ? 'ሳምንታዊ' : 'Weekly'}</option>
                    <option value="monthly">{language === 'am' ? 'ወርሃዊ' : 'Monthly'}</option>
                    <option value="yearly">{language === 'am' ? 'አመታዊ' : 'Yearly'}</option>
                </select>
            </div>

            {/* Performance Overview */}
            <div className="admin-section">
                <h2>{language === 'am' ? 'የቢሮ አፈፃፀም' : 'Office Performance'}</h2>
                <div className="chart-container">
                    <Bar data={barChartData} options={{
                        responsive: true,
                        plugins: {
                            legend: { display: false },
                            title: {
                                display: true,
                                text: language === 'am' ? 'አፈፃፀም መጠን (%)' : 'Performance Rate (%)'
                            }
                        }
                    }} />
                </div>
            </div>

                                    {/* Annual Plans Dashboard */}
            <div className="admin-section">
                <h2>Annual Plans Dashboard</h2>

                <div className="admin-filters" style={{ justifyContent: 'flex-start', marginBottom: '16px' }}>
                    <select value={planOfficeFilter} onChange={(e) => setPlanOfficeFilter(e.target.value)}>
                        <option value="all">All Offices</option>
                        {officesData.map((office) => (
                            <option key={office.id} value={office.id}>
                                {language === 'am' ? office.name_am : office.name_en}
                            </option>
                        ))}
                    </select>
                    <select value={planStatusFilter} onChange={(e) => setPlanStatusFilter(e.target.value)}>
                        <option value="all">All Status</option>
                        <option value="submitted">Submitted</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                    </select>
                    <input
                        type="number"
                        min="2020"
                        max="2100"
                        placeholder="Year"
                        value={planYearFilter}
                        onChange={(e) => setPlanYearFilter(e.target.value)}
                        style={{ width: '120px' }}
                    />
                </div>

                <div style={{ display: 'flex', gap: '12px', marginBottom: '14px', flexWrap: 'wrap' }}>
                    <span className="plan-pill">Pending: {pendingPlans.length}</span>
                    <span className="plan-pill">Reviewed: {reviewedPlans.length}</span>
                    <span className="plan-pill">Total: {filteredPlans.length}</span>
                </div>

                <h3 style={{ marginBottom: '10px' }}>Pending Plans</h3>
                {pendingPlans.length === 0 ? (
                    <p>No pending annual plans.</p>
                ) : (
                    <div className="reports-table" style={{ marginBottom: '20px' }}>
                        <table>
                            <thead>
                                <tr>
                                    <th>Year</th>
                                    <th>Office</th>
                                    <th>Task</th>
                                    <th>KPIs</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingPlans.map((plan) => {
                                    const office = officesData.find((o) => o.id === plan.officeId);
                                    const task = office?.tasks.find((t) => t.id === plan.taskId);
                                    return (
                                        <tr key={plan.id}>
                                            <td>{plan.year}</td>
                                            <td>{language === 'am' ? office?.name_am : office?.name_en}</td>
                                            <td>{language === 'am' ? task?.title_am : task?.title_en}</td>
                                            <td>{Object.keys(plan.annualTargets || {}).length}</td>
                                            <td>{plan.status || 'submitted'}</td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button className="btn-view" onClick={() => handlePlanDecision(plan.id, 'approve')}>Approve</button>
                                                    <button className="btn-secondary" onClick={() => handlePlanDecision(plan.id, 'reject')}>Request Changes</button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                <h3 style={{ marginBottom: '10px' }}>Plan History</h3>
                {reviewedPlans.length === 0 ? (
                    <p>No reviewed plans found.</p>
                ) : (
                    <div className="reports-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Year</th>
                                    <th>Office</th>
                                    <th>Task</th>
                                    <th>Status</th>
                                    <th>Reason</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reviewedPlans.slice(0, 30).map((plan) => {
                                    const office = officesData.find((o) => o.id === plan.officeId);
                                    const task = office?.tasks.find((t) => t.id === plan.taskId);
                                    return (
                                        <tr key={plan.id}>
                                            <td>{plan.year}</td>
                                            <td>{language === 'am' ? office?.name_am : office?.name_en}</td>
                                            <td>{language === 'am' ? task?.title_am : task?.title_en}</td>
                                            <td>{plan.status}</td>
                                            <td>{plan.status === 'rejected' ? (plan.rejectionReason || '-') : '-'}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* User Activity */}
            <div className="admin-section">
                <h2>{language === 'am' ? 'የተጠቃሚ እንቅስቃሴ' : 'User Activity'}</h2>
                <div className="users-grid">
                    {users.map(user => {
                        const userReports = reports.filter(r => r.userId === user.id);
                        const lastReport = userReports.length > 0
                            ? new Date(userReports[userReports.length - 1].timestamp).toLocaleDateString()
                            : language === 'am' ? 'ምንም ሪፖርት የለም' : 'No reports';

                        return (
                            <div key={user.id} className="user-card">
                                <div className="user-avatar">
                                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                </div>
                                <div className="user-info">
                                    <h4>{user.name || 'Unknown User'}</h4>
                                    <p><strong>{language === 'am' ? 'የተጠቃሚ ስም' : 'Username'}:</strong> {user.username}</p>
                                    <p><strong>{language === 'am' ? 'ሚና' : 'Role'}:</strong> {user.role === 'admin' ? (language === 'am' ? 'አስተያየት ሰጪ' : 'Administrator') : (user.role === 'subadmin' || user.role === 'sub_admin' || user.role === 'party') ? (language === 'am' ? 'ህዝብ ኃላፊ' : 'Sub Admin') : (language === 'am' ? 'ተጠቃሚ' : 'User')}</p>
                                    <p><strong>{language === 'am' ? 'ቢሮ' : 'Office'}:</strong> {user.office}</p>
                                    <p>{language === 'am' ? user.position_am : user.position_en}</p>
                                    <p className="user-stats">
                                        {language === 'am' ? 'ሪፖርቶች' : 'Reports'}: {userReports.length}
                                    </p>
                                    <p className="last-active">
                                        {language === 'am' ? 'የመጨረሻ ሪፖርት' : 'Last report'}: {lastReport}
                                    </p>
                                    <div className="user-actions">
                                        <button
                                            className="btn-danger"
                                            onClick={() => handleDeleteUser(user.id)}
                                        >
                                            {language === 'am' ? 'ሰርዝ' : 'Delete'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Recent Reports */}
            <div className="admin-section">
                <h2>{language === 'am' ? 'ቅርብ ሪፖርቶች' : 'Recent Reports'}</h2>
                <div className="reports-table">
                    <table>
                        <thead>
                            <tr>
                                <th>{language === 'am' ? 'ቀን' : 'Date'}</th>
                                <th>{language === 'am' ? 'ቢሮ' : 'Office'}</th>
                                <th>{language === 'am' ? 'ተጠቃሚ' : 'User'}</th>
                                <th>{language === 'am' ? 'ኪፒአይዎች' : 'KPIs'}</th>
                                <th>{language === 'am' ? 'ድርጊቶች' : 'Actions'}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reports.slice(0, 10).map(report => {
                                const office = officesData.find(o => o.id === report.officeId);
                                return (
                                    <tr key={report.id}>
                                        <td>{formatReportDate(report)}</td>
                                        <td>{language === 'am' ? office?.name_am : office?.name_en}</td>
                                        <td>{report.userName}</td>
                                        <td>{Object.keys(report.data).length}</td>
                                        <td>
                                            <button
                                                className="btn-view"
                                                onClick={() => setSelectedReport(report)}
                                            >
                                                {language === 'am' ? 'ይመልከቱ' : 'View'}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedReport && (
                <div className="report-modal-overlay" onClick={() => setSelectedReport(null)}>
                    <div className="report-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="report-modal-header">
                            <h3>{language === 'am' ? 'Report Details' : 'Report Details'}</h3>
                            <button className="btn-secondary" onClick={() => setSelectedReport(null)}>
                                {language === 'am' ? 'Close' : 'Close'}
                            </button>
                        </div>
                        <div className="report-modal-body">
                            <p><strong>ID:</strong> {selectedReport.id}</p>
                            <p><strong>{language === 'am' ? 'Date' : 'Date'}:</strong> {formatReportDate(selectedReport)}</p>
                            <p><strong>{language === 'am' ? 'Type' : 'Type'}:</strong> {selectedReport.type || 'N/A'}</p>
                            <p><strong>{language === 'am' ? 'Office' : 'Office'}:</strong> {language === 'am'
                                ? officesData.find((o) => o.id === selectedReport.officeId)?.name_am || selectedReport.officeId
                                : officesData.find((o) => o.id === selectedReport.officeId)?.name_en || selectedReport.officeId}
                            </p>
                            <p><strong>{language === 'am' ? 'User' : 'User'}:</strong> {selectedReport.userName}</p>
                            <p><strong>{language === 'am' ? 'Task' : 'Task'}:</strong> {selectedReport.taskId}</p>
                            <h4>{language === 'am' ? 'KPI Values' : 'KPI Values'}</h4>
                            <ul className="report-kpi-list">
                                {Object.entries(selectedReport.data || {}).map(([kpiId, kpiData]) => (
                                    <li key={kpiId}>
                                        <strong>{kpiId}:</strong> {kpiData?.value ?? 0}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {/* User Management */}
            <div className="admin-section">
                <div className="section-header">
                    <h2>{language === 'am' ? 'የተጠቃሚ አስተያየት' : 'User Management'}</h2>
                    <button
                        className="btn-primary"
                        onClick={() => setShowUserForm(!showUserForm)}
                    >
                        {showUserForm
                            ? (language === 'am' ? 'ተያይዞ ለምን ያልለቀ' : 'Cancel')
                            : (language === 'am' ? 'አዲስ ተጠቃሚ ያስገቡ' : 'Add New User')
                        }
                    </button>
                </div>

                {showUserForm && (
                    <div className="user-form">
                        <div className="form-grid">
                            <div className="form-group">
                                <label>{language === 'am' ? 'የተጠቃሚ ስም*' : 'Username*'}</label>
                                <input
                                    type="text"
                                    value={newUser.username}
                                    onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                                    placeholder={language === 'am' ? 'የተጠቃሚ ስም ያስገቡ' : 'Enter username'}
                                />
                            </div>

                            <div className="form-group">
                                <label>{language === 'am' ? 'የይለፍ ቃል*' : 'Password*'}</label>
                                <input
                                    type="password"
                                    value={newUser.password}
                                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                                    placeholder={language === 'am' ? 'የይለፍ ቃል ያስገቡ' : 'Enter password'}
                                />
                            </div>

                            <div className="form-group">
                                <label>{language === 'am' ? 'ሙሉ ስም*' : 'Full Name*'}</label>
                                <input
                                    type="text"
                                    value={newUser.name}
                                    onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                                    placeholder={language === 'am' ? 'ሙሉ ስም ያስገቡ' : 'Enter full name'}
                                />
                            </div>

                            <div className="form-group">
                                <label>{language === 'am' ? 'ቦታ (አማርኛ)' : 'Position (Amharic)'}</label>
                                <input
                                    type="text"
                                    value={newUser.position_am}
                                    onChange={(e) => setNewUser({...newUser, position_am: e.target.value})}
                                    placeholder={language === 'am' ? 'ቦታ በአማርኛ ያስገቡ' : 'Enter position in Amharic'}
                                />
                            </div>

                            <div className="form-group">
                                <label>{language === 'am' ? 'ቦታ (እንግሊዝኛ)' : 'Position (English)'}</label>
                                <input
                                    type="text"
                                    value={newUser.position_en}
                                    onChange={(e) => setNewUser({...newUser, position_en: e.target.value})}
                                    placeholder={language === 'am' ? 'ቦታ በእንግሊዝኛ ያስገቡ' : 'Enter position in English'}
                                />
                            </div>

                            <div className="form-group">
                                <label>{language === 'am' ? 'ቢሮ*' : 'Office*'}</label>
                                <select
                                    value={newUser.office}
                                    onChange={(e) => setNewUser({...newUser, office: e.target.value})}
                                >
                                    <option value="">{language === 'am' ? 'ቢሮ ይምረጡ' : 'Select office'}</option>
                                    {officesData.map(office => (
                                        <option key={office.id} value={office.name_en}>
                                            {language === 'am' ? office.name_am : office.name_en}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>{language === 'am' ? 'ሚና' : 'Role'}</label>
                                <select
                                    value={newUser.role}
                                    onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                                >
                                    <option value="user">{language === 'am' ? 'ተጠቃሚ' : 'User'}</option>
                                    <option value="admin">{language === 'am' ? 'አስተያየት ሰጪ' : 'Administrator'}</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>{language === 'am' ? 'የሚያገኙበት ቢሮዎች' : 'Accessible Offices'}</label>
                                <div className="checkbox-group">
                                    {officesData.map(office => (
                                        <label key={office.id} className="checkbox-label">
                                            <input
                                                type="checkbox"
                                                checked={newUser.accessibleOffices.includes(office.id)}
                                                onChange={(e) => {
                                                    const officeId = office.id;
                                                    if (e.target.checked) {
                                                        setNewUser({
                                                            ...newUser,
                                                            accessibleOffices: [...newUser.accessibleOffices, officeId]
                                                        });
                                                    } else {
                                                        setNewUser({
                                                            ...newUser,
                                                            accessibleOffices: newUser.accessibleOffices.filter(id => id !== officeId)
                                                        });
                                                    }
                                                }}
                                            />
                                            {language === 'am' ? office.name_am : office.name_en}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="form-actions">
                                <button className="btn-secondary" onClick={() => setShowUserForm(false)}>
                                    {language === 'am' ? 'ተያይዞ ለምን ያልለቀ' : 'Cancel'}
                                </button>
                                <button className="btn-primary" onClick={handleCreateUser}>
                                    {language === 'am' ? 'ተጠቃሚ ፍጠር' : 'Create User'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPanel;


