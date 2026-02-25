// src/pages/Dashboard.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { officesData } from '../data/offices';
import { useAuth } from '../contexts/AuthContext';
import OfficeCard from '../components/Dashboard/OfficeCard';
import KPIOverview from '../components/Dashboard/KPIOverview';
import RecentActivities from '../components/Dashboard/RecentActivities';
import QuickStats from '../components/Dashboard/QuickStats';
import Notification from '../components/Notification/Notification';
import AccountSettings from '../components/Auth/AccountSettings';
import '../styles/Dashboard.css';

const Dashboard = ({ language, toggleLanguage }) => {
    const { user, logout } = useAuth();
    const [timeFrame, setTimeFrame] = useState('weekly');
    const [showAccountSettings, setShowAccountSettings] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isNavOpen, setIsNavOpen] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const [selectedOffice, setSelectedOffice] = useState('all');

    const translations = {
        am: {
            welcome: 'እንኳን ደህና መጡ',
            dashboard: 'ዳሽቦርድ',
            overview: 'አጠቃላይ እይታ',
            offices: 'ቢሮዎች',
            activities: 'ቅርብ እንቅስቃሴዎች',
            reports: 'ሪፖርቶች',
            addReport: 'አዲስ ሪፖርት ያስገቡ',
            logout: 'ውጣ',
            lastUpdated: 'መጨረሻ የተሻሻለበት ጊዜ'
        },
        en: {
            welcome: 'Welcome Back',
            dashboard: 'Dashboard',
            overview: 'Overview',
            offices: 'Offices',
            activities: 'Recent Activities',
            reports: 'Reports',
            addReport: 'Add New Report',
            logout: 'Logout',
            lastUpdated: 'Last Updated'
        }
    };

    const t = translations[language];

    return (
        <div className="dashboard">
            {/* Header */}
            <div className="dashboard-header">
                <div className="header-left">
                    <div className="logo">
                        <h2>የለሚ ኩራ ክ/ከተማ ወረዳ 6 አስተዳደር<br />የመቀነስ ግቦች</h2>
                    </div>
                    <div className="search-bar">
                        <input
                            type="text"
                            placeholder={language === 'am' ? 'ያልፈሉ...' : 'Search...'}
                            className="search-input"
                        />
                        <button className="search-btn">
                            <i className="fas fa-search"></i>
                        </button>
                    </div>
                </div>
                <div className="header-right">
                    <button
                        onClick={toggleLanguage}
                        className="language-toggle"
                        title={language === 'am' ? 'Switch to English' : 'አማርኛ ቀይር'}
                    >
                        {language === 'am' ? 'EN' : 'አማ'}
                    </button>
                    <div className="user-profile">
                        <button
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="user-menu-btn"
                        >
                            <i className="fas fa-user"></i>
                            <span>{user.name}</span>
                        </button>
                        {showUserMenu && (
                            <div className="user-menu-dropdown">
                                <div className="user-info">
                                    <p className="user-name">{user.name}</p>
                                    <p className="user-position">{user.position_am}</p>
                                    <p className="user-office">{user.office}</p>
                                </div>
                                <div className="user-menu-actions">
                                    <button
                                        onClick={() => {
                                            setShowAccountSettings(true);
                                            setShowUserMenu(false);
                                        }}
                                        className="user-menu-item"
                                    >
                                        <i className="fas fa-cog"></i>
                                        {language === 'am' ? 'የመለያ ቅንብሮች' : 'Account Settings'}
                                    </button>
                                    <button
                                        onClick={() => {
                                            logout();
                                            setShowUserMenu(false);
                                        }}
                                        className="user-menu-item logout"
                                    >
                                        <i className="fas fa-sign-out-alt"></i>
                                        {t.logout}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                    <Notification language={language} />
                </div>
                {/* Mobile Navigation Toggle */}
                <button
                    className={`mobile-menu-toggle ${isNavOpen ? 'active' : ''}`}
                    onClick={() => setIsNavOpen(!isNavOpen)}
                    aria-label="Toggle navigation menu"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </div>

            <div className="dashboard-layout">
                {/* Left Navigation */}
                <div className={`left-nav ${isNavOpen ? 'open' : ''}`}>
                    <div className="nav-section">
                        <h3>{language === 'am' ? 'ዳሽቦርድ' : 'Dashboard'}</h3>
                        <div className="nav-items">
                            <Link to="/dashboard" className="nav-item active" onClick={() => setIsNavOpen(false)}>
                                <i className="fas fa-tachometer-alt"></i>
                                {language === 'am' ? 'አጠቃላይ እይታ' : 'Overview'}
                            </Link>
                            {(user.role === 'user' || user.role === 'sub_admin') && (
                                <Link to="/report" className="nav-item" onClick={() => setIsNavOpen(false)}>
                                    <i className="fas fa-plus"></i>
                                    {language === 'am' ? 'አዲስ ሪፖርት' : 'New Report'}
                                </Link>
                            )}
                            <Link to="/annual-plan" className="nav-item" onClick={() => setIsNavOpen(false)}>
                                <i className="fas fa-calendar-alt"></i>
                                {language === 'am' ? 'አመታዊ ዕቅድ' : 'Annual Plan'}
                            </Link>
                            {user.role === 'admin' && (
                                <Link to="/admin" className="nav-item" onClick={() => setIsNavOpen(false)}>
                                    <i className="fas fa-cog"></i>
                                    {language === 'am' ? 'አስተያየት ፓነል' : 'Admin Panel'}
                                </Link>
                            )}
                        </div>
                    </div>
                    <div className="nav-section">
                        <h3>{language === 'am' ? 'ቢሮዎች' : 'Offices'}</h3>
                        <div className="nav-items">
                            <div
                                className={`nav-item office-item ${selectedOffice === 'all' ? 'active' : ''}`}
                                onClick={() => {
                                    setSelectedOffice('all');
                                    setIsNavOpen(false);
                                }}
                            >
                                <i className="fas fa-building"></i>
                                <span>{language === 'am' ? 'ሁሉንም ቢሮዎች' : 'All Offices'}</span>
                            </div>
                            {officesData
                                .filter(office => user && user.accessibleOffices && user.accessibleOffices.includes(office.id))
                                .map(office => (
                                    <div
                                        key={office.id}
                                        className={`nav-item office-item ${selectedOffice === office.id ? 'active' : ''}`}
                                        onClick={() => {
                                            setSelectedOffice(office.id);
                                            setIsNavOpen(false);
                                        }}
                                    >
                                        <i className="fas fa-building"></i>
                                        <span>{language === 'am' ? office.name_am : office.name_en}</span>
                                    </div>
                                ))}
                        </div>
                    </div>
                    <div className="nav-section">
                        <h3>{language === 'am' ? 'ቅንብሮች' : 'Settings'}</h3>
                        <div className="nav-items">
                            <select
                                className="time-select nav-select"
                                value={timeFrame}
                                onChange={(e) => setTimeFrame(e.target.value)}
                            >
                                <option value="daily">{language === 'am' ? 'እለታዊ' : 'Daily'}</option>
                                <option value="weekly">{language === 'am' ? 'ሳምንታዊ' : 'Weekly'}</option>
                                <option value="monthly">{language === 'am' ? 'ወርሃዊ' : 'Monthly'}</option>
                                <option value="yearly">{language === 'am' ? 'አመታዊ' : 'Yearly'}</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Main Dashboard Area */}
                <div className="main-dashboard">
                    {/* Quick Stats */}
                    <div className="dashboard-section">
                        <QuickStats language={language} timeFrame={timeFrame} selectedOffice={selectedOffice} />
                    </div>

                    {/* KPI Overview */}
                    <div className="dashboard-section">
                        <h2>{t.overview}</h2>
                        <KPIOverview timeFrame={timeFrame} language={language} selectedOffice={selectedOffice} />
                    </div>

                    {/* Offices Grid */}
                    <div className="dashboard-section">
                        <div className="section-header">
                            <h2>{t.offices}</h2>
                            <select
                                className="office-filter"
                                value={selectedOffice}
                                onChange={(e) => setSelectedOffice(e.target.value)}
                            >
                                <option value="all">{language === 'am' ? 'ሁሉንም ቢሮዎች' : 'All Offices'}</option>
                                {officesData
                                    .filter(office => user && user.accessibleOffices && user.accessibleOffices.includes(office.id))
                                    .map(office => (
                                        <option key={office.id} value={office.id}>
                                            {language === 'am' ? office.name_am : office.name_en}
                                        </option>
                                    ))}
                            </select>
                        </div>
                        <div className="offices-grid">
                            {officesData
                                .filter(office => {
                                    const hasAccess = user && user.accessibleOffices && user.accessibleOffices.includes(office.id);
                                    const matchesFilter = selectedOffice === 'all' || office.id === selectedOffice;
                                    return hasAccess && matchesFilter;
                                })
                                .map(office => (
                                    <OfficeCard
                                        key={office.id}
                                        office={office}
                                        language={language}
                                        user={user}
                                    />
                                ))}
                        </div>
                    </div>

                    {/* Recent Activities */}
                    <div className="dashboard-section">
                        <div className="section-header">
                            <h2>{t.activities}</h2>
                            <Link to="/reports">{language === 'am' ? 'ሁሉንም ይመልከቱ' : 'View All'}</Link>
                        </div>
                        <RecentActivities language={language} />
                    </div>

                    {/* Last Updated */}
                    <div className="last-updated">
                        <small>
                            {t.lastUpdated}: {lastUpdated.toLocaleString()}
                        </small>
                    </div>

                    {/* Copyright */}
                    <div className="copyright">
                        <small>
                            © 2026 Version 1.0.0 - ELT Technology
                        </small>
                    </div>
                </div>
            </div>

            {/* Account Settings Modal */}
            {showAccountSettings && (
                <AccountSettings
                    language={language}
                    onClose={() => setShowAccountSettings(false)}
                />
            )}
        </div>
    );
};

export default Dashboard;
