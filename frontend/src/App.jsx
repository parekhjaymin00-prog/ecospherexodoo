import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import DashboardLayout from './layouts/DashboardLayout.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import DepartmentsPage from './pages/DepartmentsPage.jsx';
import EnvironmentalPage from './pages/EnvironmentalPage.jsx';
import SocialPage from './pages/SocialPage.jsx';
import GovernancePage from './pages/GovernancePage.jsx';
import GamificationPage from './pages/GamificationPage.jsx';
import ReportsPage from './pages/ReportsPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/departments" element={<DepartmentsPage />} />
          <Route path="/environmental" element={<EnvironmentalPage />} />
          <Route path="/social" element={<SocialPage />} />
          <Route path="/governance" element={<GovernancePage />} />
          <Route path="/gamification" element={<GamificationPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
