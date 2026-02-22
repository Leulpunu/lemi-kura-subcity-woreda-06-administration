// src/pages/AdminPanel.js
import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { officesData } from '../data/offices';
import { useAuth } from '../contexts/AuthContext';
import '../styles/AdminPanel.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend);

const AdminPanel = ({ language, toggleLanguage }) => {
    const { createUser } = useAuth();
    const [reports, setReports] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedOffice, setSelectedOffice] = useState('all');
    const [timeRange, setTimeRange] = useState('monthly');
    const [showUserForm, setShowUserForm] = useState(false);
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

    useEffect(() => {
        // Load reports from localStorage or API
        const savedReports = JSON.parse(localStorage.getItem('kpiReports') || '[]');
        setReports(savedReports);

        // Load users
        const savedUsers = JSON.parse(localStorage.getItem('users') || '[]');
        setUsers(savedUsers);
    }, []);

    // Filter reports based on time range
    const filterReportsByTimeRange = (reports) => {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfYear = new Date(now.getFullYear(), 0, 1);

        return reports.filter(report => {
            const reportDate = new Date(report.date);
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

    // Calculate office performance
    const calculateOfficePerformance = () => {
        const filteredReports = filterReportsByTimeRange(reports);
        return officesData.map(office => {
            const officeReports = filteredReports.filter(r => r.officeId === office.id);
            let totalProgress = 0;
            let kpiCount = 0;

            officeReports.forEach(report => {
                Object.values(report.data).forEach(kpi => {
                    const officeTask = office.tasks.find(t =>
                        t.kpis.some(k => k.id === kpi.kpiId)
                    );
                    if (officeTask) {
                        const kpiTarget = officeTask.kpis.find(k => k.id === kpi.kpiId)?.target || 1;
                        totalProgress += (kpi.value / kpiTarget) * 100;
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
                                    <p><strong>{language === 'am' ? 'የይለፍ ቃል' : 'Password'}:</strong> {user.password}</p>
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
                                        <td>{new Date(report.date).toLocaleDateString()}</td>
                                        <td>{language === 'am' ? office?.name_am : office?.name_en}</td>
                                        <td>{report.userName}</td>
                                        <td>{Object.keys(report.data).length}</td>
                                        <td>
                                            <button className="btn-view">
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
