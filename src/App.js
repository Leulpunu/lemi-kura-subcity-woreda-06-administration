import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Login from './components/Auth/Login';
import Dashboard from './pages/Dashboard';
import UnifiedReport from './pages/UnifiedReport';
import AnnualPlan from './pages/AnnualPlan';
import ViewAnnualPlan from './pages/ViewAnnualPlan';
import AdminPanel from './pages/AdminPanel';

import OfficeKPIs from './components/OfficeKPIs/OfficeKPIs';
import Reporting from './components/Reporting/Reporting';
import './App.css';

function App() {
  const [language, setLanguage] = React.useState('am'); // Default to Amharic for Ethiopian system

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'am' ? 'en' : 'am');
  };

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="App" dir={language === 'am' ? 'ltr' : 'ltr'}>
        {/* Language Toggle Button */}
        <button
          onClick={toggleLanguage}
          className="language-toggle"
          title={language === 'am' ? 'Switch to English' : 'አማርኛ ቀይር'}
        >
          {language === 'am' ? 'EN' : 'አማ'}
        </button>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard language={language} toggleLanguage={toggleLanguage} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/report"
            element={
              <ProtectedRoute>
                <UnifiedReport language={language} toggleLanguage={toggleLanguage} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/annual-plan"
            element={
              <ProtectedRoute>
                <AnnualPlan language={language} toggleLanguage={toggleLanguage} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/view-annual-plan"
            element={
              <ProtectedRoute>
                <ViewAnnualPlan language={language} toggleLanguage={toggleLanguage} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminPanel language={language} toggleLanguage={toggleLanguage} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/office/:officeId"
            element={
              <ProtectedRoute>
                <OfficeKPIs language={language} toggleLanguage={toggleLanguage} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <Reporting language={language} toggleLanguage={toggleLanguage} />
              </ProtectedRoute>
            }
          />

          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
